Chat Application Backend
This is the backend for a real-time chat application built with Node.js, Express, Socket.IO, Sequelize (SQLite3), and bcrypt. It supports user registration, login, real-time messaging, and user search, with a SQLite database to store user data (username, password, socketId). An in-memory socketMap optimizes messaging by avoiding repeated database queries for socket IDs.
Prerequisites

Node.js: Version 14 or higher.
npm: Included with Node.js.

Install Dependencies:

Navigate to the project directory: cd <project-directory>.
Install required packages:npm install express socket.io sequelize sqlite3 bcrypt cors

Verify Files:

Ensure index.js is in the project root. This file contains the backend logic, including Sequelize model definitions and server setup.

Starting the Application

Run the Server:

In the project directory, start the server:node index.js

The server will run on http://localhost:4000 (or a custom port if PORT is set in the environment).
A SQLite database file (dev.db) will be created automatically in the project root to store user data.

Verify Server:

Open a browser or use a tool like Postman to check http://localhost:4000. You should see a blank response (as the root route is not defined).
The console will log: Server running on port 4000 and Database synced.

How It Works
Overview
The backend provides a REST API for user authentication and search, and a Socket.IO server for real-time messaging. Users register with a unique username and password, log in to authenticate, search for other users, and send/receive messages in real-time. The SQLite database stores user data, and an in-memory socketMap maps usernames to Socket.IO socketId for efficient messaging.
Database Structure

Table: users
Fields:
username: String, primary key, unique (e.g., "john_doe").
password: String, hashed with bcrypt (e.g., "$2b$10$...").
socketId: String, stores the Socket.IO socket ID when connected, empty ("") when disconnected.

Storage: SQLite file (dev.db) in the project root, created by Sequelize on first run.

API Endpoints

POST /register
Registers a new user.
Request: { "username": "string", "password": "string" }
Response:
201: { "message": "User registered successfully" }
400: { "error": "Username and password are required" } or "Username already exists"
500: { "error": "Registration failed" }

POST /login
Authenticates a user.
Request: { "username": "string", "password": "string" }
Response:
200: { "message": "Login successful", "username": "string" }
401: { "error": "Invalid username or password" }
400: { "error": "Username and password are required" }
500: { "error": "Login failed" }

GET /users?search=
Searches for users by username (case-insensitive, partial match).
Query: search (optional, e.g., ?search=john).
Response:
200: [{ "username": "string" }, ...]
500: { "error": "Search failed" }

Socket.IO Events

Client Emits:
register-socket(username): Registers the user’s socket with their username, updating socketId in the database and socketMap.
send-message({ sender, recipient, message }): Sends a message to the recipient, using socketMap to find the recipient’s socketId.

Server Emits:
receive-message({ sender, message }): Delivers a message to the recipient’s socket.

Disconnect:
On socket disconnection, clears socketId from the database and socketMap for the associated user.

Key Features

User Authentication: Unique usernames, passwords hashed with bcrypt.
Real-Time Messaging: Socket.IO enables instant message delivery using an in-memory socketMap for efficiency.
User Search: Partial username search via Sequelize queries.
Database: SQLite3 with Sequelize ORM, persistent storage in dev.db.
Optimization: socketMap reduces database queries by storing username → socketId mappings in memory.

Frontend Integration
The backend is designed to work with a React frontend (not included in this repository). The frontend should:

Use API calls (fetch) to http://localhost:4000/register, /login, and /users for authentication and search.
Connect to the Socket.IO server at http://localhost:4000 and emit register-socket on login and send-message for chats.
Listen for receive-message to display incoming messages.
A prompt for generating the React frontend (with Tailwind CSS and Socket.IO client) is available separately (refer to artifact ID 4baa8974-46fb-4117-9977-71f37eaa63f7). Provide this prompt to an AI tool like Same.New AI to generate the frontend code.

Security Notes

Passwords are hashed with bcrypt.
For production:
Implement JWT or session-based authentication for secure sessions.
Use HTTPS to encrypt communication.
Sanitize inputs to prevent injection attacks.
Consider a distributed store (e.g., Redis) for socketMap in multi-server setups.

Troubleshooting

Port Conflict: If port 4000 is in use, set the PORT environment variable (e.g., PORT=5000 node index.js).
Database Errors: Ensure dev.db is writable. Delete dev.db and restart to reset the database (data will be lost).
Socket.IO Issues: Verify the frontend connects to http://localhost:4000. Check CORS settings if cross-origin errors occur.
Dependencies: Run npm install again if modules are missing.

Scalability

Database: SQLite is suitable for small-scale apps. For larger apps, consider PostgreSQL or MySQL with Sequelize.
Socket.IO: The in-memory socketMap works for single-server setups. Use Redis for distributed systems.
Performance: Optimize Sequelize queries with indexes if search performance degrades.

For questions or contributions, contact the developer or refer to the project repository (if hosted).
