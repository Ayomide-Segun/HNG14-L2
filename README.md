HNG14 Stage 1 Backend Task - Profile API
Project Overview

This project is a REST API built for the HNG14 Stage 1 Backend Task.
It processes a name input, integrates multiple external APIs, applies classification logic, and stores the processed result in a database.

The API aggregates data from:
Genderize API
Agify API
Nationalize API

It then returns a structured response containing demographic insights such as gender, age group, and inferred nationality.

Base URL
[https://hng14-l1-production.up.railway.app](https://14-1-ayomide-segun1871-vleriu8v.leapcell.dev)

Endpoint
POST /api/profiles: Creates or retrieves a profile by enriching a given name using external APIs.

GET /api/profiles/{id}: Retrieves a single profile by its unique ID.

GET /api/profiles: Retrieves all stored profiles with optional filtering.
Query Parameters (optional, case-insensitive):
gender
country_id
age_group

DELETE /api/profiles/{id}: Deletes a profile by its unique ID. Returns 204 No Content on success.

Features
Accepts a name via POST request body
Integrates with multiple external APIs: Gender prediction (Genderize), Age estimation (Agify), Nationality inference (Nationalize)
Aggregates and processes responses from all APIs into a unified profile
Applies age classification logic: 0–12: child, 13–19: teenager, 20–59: adult, 60+: senior
Selects the most probable country based on highest probability score

Implements idempotency:
Prevents duplicate records for the same name
Returns existing profile if already stored
Stores structured data in MongoDB Atlas
Generates unique identifiers using UUID v7

Provides multiple RESTful endpoints for:
Creating profiles
Retrieving a single profile
Listing and filtering profiles
Deleting profiles

Supports case-insensitive filtering via query parameters
Returns clean and consistent JSON responses across all endpoints
Implements robust error handling:
400 (Bad Request), 422 (Unprocessable Entity), 404 (Not Found), 502 (External API failure), 500 (Server error)
Handles external API edge cases (null or missing data)
Includes CORS support for cross-origin requests
Uses UTC ISO 8601 format for timestamps

Data Storage
Each profile is stored with the following structure:
id (UUID v7)
name
gender
gender_probability
sample_size
age
age_group
country_id
country_probability
created_at (ISO 8601 UTC timestamp)

Tech Stack
Node.js
Express.js
MongoDB (Mongoose)
Axios
UUID v7

External APIs Used
https://api.genderize.io
https://api.agify.io
https://api.nationalize.io

Setup Instructions
1. Clone repository
git clone <repository-url>
2. Install dependencies
npm install
3. Create environment variables
Create a .env file:
MONGO_URI=your_mongodb_connection_string
PORT=5000
4. Run the server
npm start
Deployment

The API is deployed on leapcell:
https://14-1-ayomide-segun1871-vleriu8v.leapcell.dev

Notes
All timestamps are in UTC ISO 8601 format
All IDs are generated using UUID v7
API follows strict validation rules
Duplicate names return existing record instead of creating a new one
