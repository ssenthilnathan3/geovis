package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
	"golang.org/x/crypto/bcrypt"
)

var (
	db     *sql.DB
	jwtKey = []byte(os.Getenv("JWT_SECRET_KEY"))
)

type User struct {
	ID       int    `json:"id"`
	Email    string `json:"email"`
	Password string `json:"password,omitempty"`
	Name     string `json:"name"`
	Token    string `json:"token,omitempty"`
}

type Claims struct {
	Email string `json:"email"`
	jwt.RegisteredClaims
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	initDB()
	defer db.Close()

	router := mux.NewRouter()
	setupRoutes(router)

	handler := setupCORS(router)

	log.Println("Server started at http://localhost:8000")
	log.Fatal(http.ListenAndServe(":8000", handler))
}

func initDB() {
	var err error
	db, err = sql.Open("mysql", os.Getenv("DB_CONNECTION_STRING"))
	if err != nil {
		log.Fatal("Error connecting to database:", err)
	}

	if err := db.Ping(); err != nil {
		log.Fatal("Error pinging database:", err)
	}
}

func setupRoutes(router *mux.Router) {
	router.HandleFunc("/register", register).Methods("POST")
	router.HandleFunc("/login", login).Methods("POST")
	router.HandleFunc("/protected", protected).Methods("GET")
	router.HandleFunc("/logout", logout).Methods("POST")
}

func setupCORS(router *mux.Router) http.Handler {
	return cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	}).Handler(router)
}

func register(w http.ResponseWriter, r *http.Request) {
	var user User
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	if user.Email == "" || user.Password == "" || user.Name == "" {
		respondWithError(w, http.StatusBadRequest, "Email, password, and name are required")
		return
	}

	if err := createUser(&user); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error creating user")
		return
	}

	respondWithJSON(w, http.StatusCreated, map[string]interface{}{
		"user":  user,
		"token": user.Token,
	})
}

func login(w http.ResponseWriter, r *http.Request) {
	var creds User
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	user, err := getUserByEmail(creds.Email)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	if !checkPasswordHash(creds.Password, user.Password) {
		respondWithError(w, http.StatusUnauthorized, "Invalid credentials")
		return
	}

	token, err := generateToken(user.Email)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error generating token")
		return
	}

	user.Token = token
	if err := updateUserToken(user); err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error updating token")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]interface{}{
		"user": user,
	})
}

func protected(w http.ResponseWriter, r *http.Request) {
	claims, err := validateToken(r.Header.Get("Authorization"))
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "Invalid token")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": fmt.Sprintf("Valid token for %s", claims.Email)})
}

func logout(w http.ResponseWriter, r *http.Request) {
	// Extract the token from the Authorization header
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		respondWithError(w, http.StatusUnauthorized, "No token provided")
		return
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")

	// Validate the token
	claims, err := validateToken(tokenString)
	if err != nil {
		respondWithError(w, http.StatusUnauthorized, "Invalid token")
		return
	}

	// Invalidate the token
	err = invalidateToken(claims.Email)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, "Error invalidating token")
		return
	}

	respondWithJSON(w, http.StatusOK, map[string]string{"message": "Logged out successfully"})
}

func invalidateToken(email string) error {
	// Set the token to an empty string and update the last_logout time
	_, err := db.Exec("UPDATE users SET token = '', last_logout = ? WHERE email = ?", time.Now(), email)
	if err != nil {
		return fmt.Errorf("error invalidating token in database: %v", err)
	}
	return nil
}

func createUser(user *User) error {
	hashedPassword, err := hashPassword(user.Password)
	if err != nil {
		return err
	}

	token, err := generateToken(user.Email)
	if err != nil {
		return err
	}

	result, err := db.Exec("INSERT INTO users (email, password, name, token) VALUES (?, ?, ?, ?)",
		user.Email, hashedPassword, user.Name, token)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	user.ID = int(id)
	user.Token = token
	user.Password = ""
	return nil
}

func getUserByEmail(email string) (*User, error) {
	user := &User{}
	err := db.QueryRow("SELECT id, name, password, token FROM users WHERE email = ?", email).
		Scan(&user.ID, &user.Name, &user.Password, &user.Token)
	if err != nil {
		return nil, err
	}
	user.Email = email
	return user, nil
}

func updateUserToken(user *User) error {
	_, err := db.Exec("UPDATE users SET token = ? WHERE email = ?", user.Token, user.Email)
	return err
}

func generateToken(email string) (string, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		Email: email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtKey)
}

func validateToken(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return jwtKey, nil
	})
	if err != nil || !token.Valid {
		return nil, err
	}
	return claims, nil
}

func extractTokenFromHeader(r *http.Request) string {
	bearerToken := r.Header.Get("Authorization")
	return bearerToken[len("Bearer "):]
}

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func checkPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func respondWithError(w http.ResponseWriter, code int, message string) {
	respondWithJSON(w, code, map[string]string{"error": message})
}

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, _ := json.Marshal(payload)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(response)
}
