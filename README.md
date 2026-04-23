Intelligence Query Engine (HNG14 Stage 2 Backend)
🚀 Overview

This project is a Queryable Intelligence Engine API built for Insighta Labs.
It transforms raw demographic profile data into a powerful system that supports:

Advanced filtering
Sorting
Pagination
Natural language queries

The API enables clients (marketing, analytics, product teams) to easily segment and analyze user data.

🏗️ Tech Stack
Node.js
Express.js
MongoDB (Mongoose)
Axios (external APIs)
i18n-iso-countries (country parsing)
UUID v7
📦 Database Schema

Each profile follows this structure:

Field	Type	Description
id	UUID v7	Primary identifier
name	String	Unique person name
gender	String	male / female
gender_probability	Float	Confidence score
age	Number	Exact age
age_group	String	child / teenager / adult / senior
country_id	String	ISO 2-letter code
country_name	String	Full country name
country_probability	Float	Confidence score
created_at	Date	Timestamp
🔗 Base URL
https://your-api-url.com/api
📌 Endpoints

1️⃣ Create Profile
POST /profiles
Creates a new profile using external APIs:
Genderize
Agify
Nationalize

Response:
    {
        "status": "success",
        "data": { ...profile }
    }

2️⃣ Get Profile by ID
GET /profiles/:id
Fetch a single profile by UUID.

Response:
    {
        "status": "success",
        "data": { ...profile }
    }

3️⃣ Advanced Filtering + Sorting + Pagination
GET /profiles
Supports filtering, sorting, and pagination.

Supported Filters
 - gender
 - age_group
 - country_id
 - min_age
 - max_age
 - min_gender_probability
 - min_country_probability

Sorting
Field	                       Values
sort_by	        age, created_at, gender_probability
order	        asc, desc

Pagination
Parameter	Default	    Max
page	      1	         -
limit	      10	     50

Example Request: /profiles?gender=male&country_id=NG&min_age=25&sort_by=age&order=desc&page=1&limit=10

Example Response:
    {
        "status": "success",
        "page": 1,
        "limit": 10,
        "total": 2026,
        "data": [ ... ]
    }

4️⃣ Natural Language Query (Core Feature)
GET /profiles/search?q=...
Converts plain English into structured filters.

Supported Interpretations
 - young males: male + age 16–24
 - females above 30: female + age ≥ 30
 - people from nigeria: country_id = NG
 - adult males from kenya: male + adult + KE
 - teenagers above 17: teenager + age ≥ 17

Rules
 - Rule-based parsing only (NO AI / LLM)
 - "young" = 16–24
 - If query cannot be interpreted:
        {
        "status": "error",
        "message": "Unable to interpret query"
        }

Example Request: /profiles/search?q=young males from nigeria&page=1&limit=10
Example Response:
    {
        "status": "success",
        "page": 1,
        "limit": 10,
        "total": 120,
        "data": [ ... ]
    }

Error Handling
 - All errors follow this format:
        {
            "status": "error",
            "message": "Error description"
        }

Common Status Codes
 - 400 = Bad Request
 - 422 = Invalid parameters
 - 404	= Not Found
 - 500	= Server Error

Performance Notes
 - MongoDB queries use filters (no full table scan in pagination)
 - Pagination limits enforced (max 50)
 - Efficient .countDocuments() used for totals
 - Optimized query-based filtering

Data Seeding
 - To seed database: node seed.js
Seeder Features:
 - Prevents duplicates using upsert
 - Uses UUID v7 for IDs
 - Safe re-run (idempotent)

CORS
Enabled globally: Access-Control-Allow-Origin: *

Key Feature Highlights
 - Advanced MongoDB filtering
 - Rule-based natural language parsing
 - Pagination + sorting combined
 - External API enrichment
 - Duplicate-safe seeding system

Author
Built as part of HNG14 Backend Stage 2 Task