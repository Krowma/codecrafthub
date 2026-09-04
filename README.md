# CodeCraftHub

CodeCraftHub is a simple personal learning goal tracker API built with **Node.js** and **Express**.

The API allows developers to create, view, update, and delete courses they want to learn. Course data is stored locally in a `courses.json` file, so no database is required.

## Features

- Create new courses
- View all courses
- View a specific course
- Update existing courses
- Delete courses
- Automatically generate course IDs
- Track target completion dates
- Track course progress status
- Automatically create `courses.json`
- Validate required fields
- Validate course statuses
- Handle file read and write errors

### Allowed Course Statuses

- `Not Started`
- `In Progress`
- `Completed`

## Technologies Used

- Node.js
- Express.js
- JSON file storage
- REST API

## Project Structure

```text
codecrafthub/
├── app.js
├── package.json
├── package-lock.json
├── courses.json
└── README.md
```

The `courses.json` file is created automatically when the application starts if it does not already exist.

## Requirements

You need the following installed:

- [Node.js](https://nodejs.org/)
- npm

Check your installed versions:

```bash
node --version
npm --version
```

## Installation

### 1. Clone or create the project

```bash
mkdir codecrafthub
cd codecrafthub
```

### 2. Install dependencies

If `package.json` already exists, run:

```bash
npm install
```

This installs Express and the project's required dependencies.

### 3. Verify the project files

Make sure the project contains:

```text
app.js
package.json
```

You do not need to create `courses.json` manually. The application creates it automatically.

## How to Run the Application

Start the server using npm:

```bash
npm start
```

Alternatively, run the application directly:

```bash
node app.js
```

The API will run on:

```text
http://localhost:5000
```

You should see a message similar to:

```text
CodeCraftHub API is running on port 5000
```

## Course Data Format

Each course is stored using the following structure:

```json
{
  "id": 1,
  "name": "Express REST APIs",
  "description": "Learn how to build REST APIs with Node.js and Express.",
  "target_date": "2026-12-31",
  "status": "Not Started",
  "created_at": "2026-09-04T12:00:00.000Z"
}
```

### Course Fields

|
 Field 
|
 Description 
|
|
---
|
---
|
|
`id`
|
 Automatically generated numeric ID starting from 
`1`
|
|
`name`
|
 Required course name 
|
|
`description`
|
 Required course description 
|
|
`target_date`
|
 Required date in 
`YYYY-MM-DD`
 format 
|
|
`status`
|
 Required course status 
|
|
`created_at`
|
 Automatically generated timestamp 
|

## API Documentation

Base URL:

```text
http://localhost:5000
```

For requests containing JSON data, include this header:

```http
Content-Type: application/json
```

---

## Create a Course

Creates a new course.

### Request

```http
POST /api/courses
```

### cURL Example

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Express REST APIs",
    "description": "Learn how to build REST APIs with Node.js and Express.",
    "target_date": "2026-12-31",
    "status": "Not Started"
  }'
```

### Successful Response

**Status:** `201 Created`

```json
{
  "id": 1,
  "name": "Express REST APIs",
  "description": "Learn how to build REST APIs with Node.js and Express.",
  "target_date": "2026-12-31",
  "status": "Not Started",
  "created_at": "2026-09-04T12:00:00.000Z"
}
```

---

## Get All Courses

Returns all courses.

### Request

```http
GET /api/courses
```

### cURL Example

```bash
curl http://localhost:5000/api/courses
```

### Successful Response

**Status:** `200 OK`

```json
[
  {
    "id": 1,
    "name": "Express REST APIs",
    "description": "Learn how to build REST APIs with Node.js and Express.",
    "target_date": "2026-12-31",
    "status": "Not Started",
    "created_at": "2026-09-04T12:00:00.000Z"
  }
]
```

---

## Get Course Statistics

Returns the total number of courses and the number of courses grouped by status.

### Request

```http
GET /api/courses/stats
```

### cURL Example

```bash
curl http://localhost:5000/api/courses/stats
```

### Successful Response

**Status:** `200 OK`

```json
{
  "total": 5,
  "byStatus": {
    "Not Started": 2,
    "In Progress": 2,
    "Completed": 1
  }
}
```

---

## Get a Specific Course

Returns one course by its ID.

### Request

```http
GET /api/courses/:id
```

### cURL Example

```bash
curl http://localhost:5000/api/courses/1
```

### Successful Response

**Status:** `200 OK`

```json
{
  "id": 1,
  "name": "Express REST APIs",
  "description": "Learn how to build REST APIs with Node.js and Express.",
  "target_date": "2026-12-31",
  "status": "Not Started",
  "created_at": "2026-09-04T12:00:00.000Z"
}
```

### Course Not Found Response

**Status:** `404 Not Found`

```json
{
  "error": "Course not found"
}
```

---

## Update a Course

Updates an existing course.

The `id` and `created_at` fields are preserved automatically.

### Request

```http
PUT /api/courses/:id
```

### cURL Example

```bash
curl -X PUT http://localhost:5000/api/courses/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Advanced Express REST APIs",
    "description": "Build and manage REST APIs using Express.",
    "target_date": "2027-01-15",
    "status": "In Progress"
  }'
```

### Successful Response

**Status:** `200 OK`

```json
{
  "id": 1,
  "name": "Advanced Express REST APIs",
  "description": "Build and manage REST APIs using Express.",
  "target_date": "2027-01-15",
  "status": "In Progress",
  "created_at": "2026-09-04T12:00:00.000Z"
}
```

A `PUT` request must include:

- `name`
- `description`
- `target_date`
- `status`

---

## Delete a Course

Deletes a course by its ID.

### Request

```http
DELETE /api/courses/:id
```

### cURL Example

```bash
curl -X DELETE http://localhost:5000/api/courses/1
```

### Successful Response

**Status:** `204 No Content`

There is no response body when the deletion is successful.

### Course Not Found Response

**Status:** `404 Not Found`

```json
{
  "error": "Course not found"
}
```

## Validation Errors

### Missing Required Fields

Request:

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -d '{}'
```

Response:

**Status:** `400 Bad Request`

```json
{
  "error": "Validation failed",
  "details": [
    "name is required",
    "description is required",
    "target_date is required",
    "status is required"
  ]
}
```

### Invalid Status

Example request body:

```json
{
  "name": "Node.js Basics",
  "description": "Learn Node.js fundamentals.",
  "target_date": "2026-12-31",
  "status": "Started"
}
```

Response:

**Status:** `400 Bad Request`

```json
{
  "error": "Validation failed",
  "details": [
    "status must be one of: Not Started, In Progress, Completed"
  ]
}
```

### Invalid Date

The `target_date` must use the following format:

```text
YYYY-MM-DD
```

Valid example:

```text
2026-12-31
```

Invalid example:

```text
31-12-2026
```

## HTTP Status Codes

|
 Status Code 
|
 Meaning 
|
|
---
|
---
|
|
`200 OK`
|
 Request completed successfully 
|
|
`201 Created`
|
 A new course was created 
|
|
`204 No Content`
|
 A course was deleted successfully 
|
|
`400 Bad Request`
|
 Request data is missing or invalid 
|
|
`404 Not Found`
|
 The requested route or course does not exist 
|
|
`500 Internal Server Error`
|
 A server or file-system error occurred 
|

## Troubleshooting

### `npm start` Does Not Work

Install the project dependencies:

```bash
npm install
```

Then start the application:

```bash
npm start
```

Also make sure that `app.js` and `package.json` are in the same directory.

### `Cannot Find Module 'express'`

Install Express manually:

```bash
npm install express
```

Then restart the server:

```bash
npm start
```

### Port 5000 Is Already in Use

Another application may already be using port `5000`.

Stop the application using that port, or change the port in `app.js`:

```js
const PORT = 5001;
```

Then restart the server.

### `Route Not Found`

Check that the URL and HTTP method are correct.

Examples:

```http
GET http://localhost:5000/api/courses
GET http://localhost:5000/api/courses/1
POST http://localhost:5000/api/courses
PUT http://localhost:5000/api/courses/1
DELETE http://localhost:5000/api/courses/1
```

A specific course requires an ID:

```text
/api/courses/1
```

### `Validation Failed`

Make sure the request includes all required fields:

```json
{
  "name": "JavaScript Basics",
  "description": "Learn JavaScript fundamentals.",
  "target_date": "2026-11-30",
  "status": "Not Started"
}
```

Check that:

- `name` is not empty
- `description` is not empty
- `target_date` uses the `YYYY-MM-DD` format
- `status` is one of the allowed values

### Invalid JSON Error

Make sure the request body contains valid JSON and includes this header:

```http
Content-Type: application/json
```

Correct example:

```json
{
  "name": "JavaScript Basics",
  "description": "Learn JavaScript fundamentals.",
  "target_date": "2026-11-30",
  "status": "Not Started"
}
```

### `courses.json` Cannot Be Read or Written

Check that:

- The application has permission to access the project directory.
- `courses.json` contains valid JSON.
- The file is not locked by another process.
- The file contains an array.

The file should initially contain:

```json
[]
```

If the file becomes corrupted, replace its contents with:

```json
[]
```

### Changes Are Not Being Saved

The application rewrites `courses.json` after creating, updating, or deleting a course.

Make sure you are checking the `courses.json` file in the same directory as `app.js`.

## Limitations

This project uses a JSON file for simplicity and learning purposes. It is not intended for high-traffic or multi-user production applications.

Limitations include:

- The entire file is read and rewritten for each change.
- Simultaneous writes may conflict.
- There are no database transactions.
- The data file should be backed up manually.
- There is no authentication or user management.

For a larger application, the file-storage system could later be replaced with a database while keeping the same REST API structure.