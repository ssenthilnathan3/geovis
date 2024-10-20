package utils

import (
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"log"
	"net/http"

	"github.com/ssenthilnathan3/geovis-server/v2/types"
)

type UserFile struct {
	ID       int    `json:"id"`
	UserID   int    `json:"userId"`
	FileName string `json:"fileName"`
	FileData []byte `json:"fileData,omitempty"`
}

// GetFilesHandler handles the GET request to retrieve all files for a user
func GetFilesHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		userIDValue := ctx.Value(types.UserIDKey)
		log.Printf("Retrieved user ID from context: %v", userIDValue)

		userID, ok := userIDValue.(int)
		if !ok {
			log.Printf("Failed to cast user ID to int. Value: %v, Type: %T", userIDValue, userIDValue)
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		files, err := getUserFiles(db, userID)
		if err != nil {
			log.Printf("User files does not exist")
			http.Error(w, "Error retrieving files", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(files)
	}
}

func UploadFileHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		userIDValue := ctx.Value(types.UserIDKey)
		log.Printf("Retrieved user ID from context: %v", userIDValue)

		userID, ok := userIDValue.(int)
		if !ok {
			log.Printf("Failed to cast user ID to int. Value: %v, Type: %T", userIDValue, userIDValue)
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		// Parse the JSON body
		var requestBody struct {
			FileName string `json:"file_name"`
			FileData string `json:"file_data"`
		}
		err := json.NewDecoder(r.Body).Decode(&requestBody)
		if err != nil {
			log.Printf("Error parsing JSON body: %v", err)
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Ensure file data and file name are provided
		if len(requestBody.FileData) == 0 || requestBody.FileName == "" {
			log.Printf("File data or file name missing in the request body")
			http.Error(w, "File data or file name missing", http.StatusBadRequest)
			return
		}

		fileBytes, err := base64.StdEncoding.DecodeString(requestBody.FileData)
		if err != nil {
			log.Printf("Error decoding base64 file data: %v", err)
			http.Error(w, "Invalid file data encoding", http.StatusBadRequest)
			return
		}

		// Check if the user exists in the users table
		var existingUserID int
		err = db.QueryRow("SELECT id FROM users WHERE id = ?", userID).Scan(&existingUserID)
		if err == sql.ErrNoRows {
			log.Printf("User not found for token")
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		} else if err != nil {
			log.Printf("Error querying users table: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}

		// Create the user file entry
		userFile := UserFile{
			UserID:   userID,
			FileName: requestBody.FileName,
			FileData: fileBytes,
		}

		log.Printf("Storing file for user ID %d: %s (size: %d bytes)", userID, requestBody.FileName, len(requestBody.FileData))
		err = storeUserFile(db, &userFile)
		if err != nil {
			log.Printf("Error storing file for user ID %d: %v", userID, err)
			http.Error(w, "Error storing file", http.StatusInternalServerError)
			return
		}

		log.Printf("File uploaded successfully for user ID %d: %s", userID, requestBody.FileName)
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{"message": "File uploaded successfully"})
	}
}

// getUserFiles retrieves all files for a given user
func getUserFiles(db *sql.DB, userID int) ([]UserFile, error) {
	log.Printf("Retrieving files for user ID: %d", userID)
	rows, err := db.Query("SELECT id, file_name, file_data FROM user_files WHERE user_id = ?", userID) // Include file_data
	if err != nil {
		log.Printf("Error querying files for user ID %d: %v", userID, err)
		return nil, err
	}
	defer rows.Close()

	var files []UserFile
	for rows.Next() {
		var file UserFile
		err := rows.Scan(&file.ID, &file.FileName, &file.FileData) // Scan file_data
		if err != nil {
			log.Printf("Error scanning file row for user ID %d: %v", userID, err)
			return nil, err
		}
		file.UserID = userID
		files = append(files, file)
	}

	if err := rows.Err(); err != nil {
		log.Printf("Error iterating over rows for user ID %d: %v", userID, err)
		return nil, err
	}

	log.Printf("Retrieved %d files for user ID %d", len(files), userID)
	return files, nil
}

// storeUserFile saves a new file to the database
func storeUserFile(db *sql.DB, file *UserFile) error {
	log.Printf("Storing file: %s for user ID %d", file.FileName, file.UserID)
	result, err := db.Exec("INSERT INTO user_files (user_id, file_name, file_data) VALUES (?, ?, ?)",
		file.UserID, file.FileName, file.FileData)
	if err != nil {
		log.Printf("Error executing insert for user ID %d: %v", file.UserID, err)
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		log.Printf("Error getting last insert ID for user ID %d: %v", file.UserID, err)
		return err
	}

	file.ID = int(id)
	log.Printf("Stored file ID %d for user ID %d", file.ID, file.UserID)
	return nil
}

// InitFileTable creates the user_files table if it doesn't exist
func InitFileTable(db *sql.DB) error {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS user_files (
			id INT AUTO_INCREMENT PRIMARY KEY,
			user_id INT NOT NULL,
			file_name VARCHAR(255) NOT NULL,
			file_data LONGBLOB NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id)
		);
	`)
	return err
}
