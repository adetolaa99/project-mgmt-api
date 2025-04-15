# Project Management API

A RESTful API built with NestJS and SQLite that allows users to create and manage their projects and tasks.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Setup](#setup)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Example Usage](#example-usage)
- [Postman Collection](#postman-collection)
- [Database](#database)

## Features

- Project management (Create, Read, Update, Delete)
- Task management associated with a specific project
- Task status tracking
- JWT-based authentication
- User registration and login
- SQLite database for easy development setup

## Requirements

- Node.js (v14.x or higher)
- yarn (v1.x or higher)

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd project-mgmt-api
```

### 2. Install dependencies

```bash
yarn install
```
### 3. Add the enviromental variables as seen in the env.example file 

### 4. Start the development server

```bash
yarn start:dev
```

The API will start running on `http://localhost:{PORT}`.

## Authentication

This API uses JWT for authentication. To access protected endpoints, follow these steps:

### 1. Register a new user:

```bash
curl -X POST http://localhost:{PORT}/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

### 2. Login to get an access token:

```bash
curl -X POST http://localhost:{PORT}/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Use the returned access_token in the Authorization header for the requests:

```bash
curl -X GET http://localhost:{PORT}/api/projects \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## API Endpoints

### Authentication
- **POST /api/auth/register** - Register a new user
- **POST /api/auth/login** - Login and get access token

### Projects (Protected)
- **POST /api/projects** - Create a new project
- **PUT /api/projects/:id** - Update a project
- **DELETE /api/projects/:id** - Delete a project
- **GET /api/projects** - List all projects
  - Query params:
    - `limit` - Number of results per page (default: 10)
    - `offset` - Number of results to skip (default: 0)
    - `search` - Search term for project name or description
- **GET /api/projects/:id** - Get a single project by ID

### Tasks (Protected)
- **POST /api/projects/:projectId/tasks** - Create a task for a project
- **PATCH /api/tasks/:id** - Update a task
- **DELETE /api/tasks/:id** - Delete a task
- **GET /api/projects/:projectId/tasks** - List tasks for a project
  - Query params:
    - `limit` - Number of results per page (default: 5)
    - `offset` - Number of results to skip (default: 0)
    - `search` - Search term for task title or description
    - `is_completed` - Filter by completion status (`true` or `false`)

## Example Usage

### Register a new user

```bash
curl -X POST http://localhost:{PORT}/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:{PORT}/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### Create a project

```bash
curl -X POST http://localhost:{PORT}/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Website Redesign",
    "description": "Redesign company website with new branding"
  }'
```

### Get all projects

```bash
curl -X GET "http://localhost:{PORT}/api/projects?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Search projects

```bash
curl -X GET "http://localhost:{PORT}/api/projects?limit=10&offset=0&search=redesign" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Create a task for a project

```bash
curl -X POST http://localhost:{PORT}/api/projects/1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Design homepage mockup",
    "description": "Create initial mockup for homepage",
    "due_date": "2025-05-16"
  }'
```

### Get all tasks for a project

```bash
curl -X GET "http://localhost:{PORT}/api/projects/1/tasks?limit=5&offset=0" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get tasks with combined filters

```bash
curl -X GET "http://localhost:{PORT}/api/projects/1/tasks?limit=5&offset=0&search=design&is_completed=true" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update a task

```bash
curl -X PATCH http://localhost:{PORT}/api/tasks/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "is_completed": true
  }'
```

## Postman Collection

A Postman collection is included to help with API testing. To use it:

1. The `Project_Task_API.postman_collection.json` file is present in the root of the project
2. Open Postman
3. Click "Import" and select the collection file
4. Adjust the variables as needed and ensure the value of the baseUrl matches with the PORT number specified
5. Test the endpoints

## Database

The project uses SQLite. The database file is created automatically when the application runs for the first time at `database/database.sqlite`.

### Known Issues

1. **Token Expiration**: JWT tokens expire after 60 minutes. Users will need to log in again after this period.