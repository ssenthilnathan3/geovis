### Features
- User authentication with NextAuth
- Geo-data management through context APIs
- File uploads and downloads in various formats (e.g., GeoJSON)
- User profile management displaying recent uploads

## Technologies Used
- **Frontend**: Next.js
- **Backend**: [Go]
- **Database**: [MySQL]

## Getting Started

### Prerequisites
Before running the project, ensure you have the following installed:
- Node.js
- npm or Yarn
- Go 
- A database connection (mysql)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ssenthilnathan3/skyserve-geovis.git
   cd skyserve-geovis
   ```

2. Install frontend dependencies:
   ```bash
   cd geovis-client
   npm install
   # or
   yarn install
   ```

3. Install backend dependencies (if applicable):
   ```bash
   cd geovis-server
   go mod tidy
   ```

4. Set up your environment variables:
   - Create a `.env.local` file in the root directory of the frontend and add the required environment variables (e.g., database connection string, API keys).
   - If your backend requires environment variables, create a similar `.env` file in the backend directory.

### Running the Application

1. Start the backend server:
   ```bash
   cd geovis-client
   go run main.go
   ```

2. Start the frontend development server:
   ```bash
   cd geovis-client
   npm run dev
   # or
   yarn dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Usage

- Log in to access your profile.
- Upload files and view your latest uploads.
- Explore the application's features and functionality.
