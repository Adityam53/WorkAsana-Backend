# Workasana Backend – Task Management & Collaboration API

A scalable backend API for a task management and collaboration platform where users can manage tasks, teams, projects, and tags with authentication, filtering, pagination, and reporting features.

Built using Node.js, Express.js, MongoDB, Mongoose, and JWT Authentication.

---

## Quick Start

git clone https://github.com/Adityam53/WorkAsana-Backend.git
cd WorkAsana
cd Backend
npm install
npm run dev

---

## Tech Stack

Node.js
Express.js
MongoDB
Mongoose
JWT Authentication
bcrypt
dotenv
CORS

---

## Features

### Authentication

* User signup with name, email, and password
* Secure login using JWT
* Password hashing using bcrypt
* Protected routes using middleware
* Get current logged-in user using /auth/me

### Users

* Fetch all users (protected route)
* Get authenticated user details

### Tasks

* Create, update, and delete tasks
* Fetch task by ID
* Fetch all tasks with filtering support:

  * team
  * owner
  * project
  * status
  * tags
* Pagination support
* Sorted by latest first

### Teams

* Create teams
* Fetch all teams

### Projects

* Create projects
* Fetch all projects

### Tags

* Create tags
* Fetch all tags

---

## Reports

### Completed Tasks (Last 7 Days)

GET /report/last-week
Returns tasks completed in last 7 days

### Pending Work Report

GET /report/pending
Returns total pending tasks and estimated remaining work

### Closed Tasks Grouped Report

GET /report/closed-tasks?groupBy=team|owner|project
Returns completed tasks grouped by team, owner, or project

---

## Authentication Flow

Login returns a JWT token

POST /auth/login

Protected routes require header:
Authorization: Bearer <token>

---

## API Endpoints

### Auth

POST /auth/signup
POST /auth/login
GET /auth/me

### Users

GET /users

### Tasks

POST /tasks
GET /tasks
GET /tasks/:id
PUT /tasks/:id
DELETE /tasks/:id

Supports query parameters:
?page=1&limit=9&status=Completed&team=teamId&owner=userId&project=projectId&tags=tag1,tag2

### Teams

POST /teams
GET /teams

### Projects

POST /projects
GET /projects

### Tags

POST /tags
GET /tags

### Reports

GET /report/last-week
GET /report/pending
GET /report/closed-tasks

---

## Project Structure

db
models

* user.models.js
* task.models.js
* team.models.js
* project.models.js
* tag.models.js

middleware
server.js
.env
package.json

---

## Key Highlights

JWT authentication and authorization
Secure password hashing using bcrypt
Pagination and filtering system
Aggregated reporting endpoints
MongoDB population for relational data
Scalable REST API architecture

---

## Future Improvements

Role-based access control (admin/user)
Real-time updates using WebSockets
Email notifications
File uploads for tasks
Activity logs
Advanced analytics dashboard

---

## Author
Aditya Moorjmalani
Backend system built for Workasana – Task Management

## Contact
For any bugs contact adityamoorjmalani53@gmail.com
