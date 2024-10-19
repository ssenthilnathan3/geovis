package utils

import (
	"database/sql"
	"encoding/json"
	"net/http"
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
		userID := r.Context().Value("userID").(int)

		files, err := getUserFiles(db, userID)
		if err != nil {
			http.Error(w, "Error retrieving files", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(files)
	}
}

// UploadFileHandler handles the POST request to upload a new file
func UploadFileHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value("userID").(int)

		err := r.ParseMultipartForm(10 << 20) // 10 MB limit
		if err != nil {
			http.Error(w, "Error parsing form", http.StatusBadRequest)
			return
		}

		file, handler, err := r.FormFile("file")
		if err != nil {
			http.Error(w, "Error retrieving file", http.StatusBadRequest)
			return
		}
		defer file.Close()

		fileBytes := make([]byte, handler.Size)
		_, err = file.Read(fileBytes)
		if err != nil {
			http.Error(w, "Error reading file", http.StatusInternalServerError)
			return
		}

		userFile := UserFile{
			UserID:   userID,
			FileName: handler.Filename,
			FileData: fileBytes,
		}

		err = storeUserFile(db, &userFile)
		if err != nil {
			http.Error(w, "Error storing file", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{"message": "File uploaded successfully"})
	}
}

// getUserFiles retrieves all files for a given user
func getUserFiles(db *sql.DB, userID int) ([]UserFile, error) {
	rows, err := db.Query("SELECT id, file_name FROM user_files WHERE user_id = ?", userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var files []UserFile
	for rows.Next() {
		var file UserFile
		err := rows.Scan(&file.ID, &file.FileName)
		if err != nil {
			return nil, err
		}
		file.UserID = userID
		files = append(files, file)
	}

	return files, nil
}

// storeUserFile saves a new file to the database
func storeUserFile(db *sql.DB, file *UserFile) error {
	result, err := db.Exec("INSERT INTO user_files (user_id, file_name, file_data) VALUES (?, ?, ?)",
		file.UserID, file.FileName, file.FileData)
	if err != nil {
		return err
	}

	id, err := result.LastInsertId()
	if err != nil {
		return err
	}

	file.ID = int(id)
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
