# 🐳 Docker Full-Stack CRUD App

Full-Stack CRUD Application using:

- Backend: Node.js + Express
- Frontend: Nginx (Static HTML/CSS/JS)
- Database: PostgreSQL
- Containerization: Docker & Docker Compose


## 📂 Project Structure
```
DockerHubImag/
│
├── backend/
│ ├── app.js
│ ├── Dockerfile
│ └── package.json
│
├── frontend/
│ ├── dist/
│ │ ├── assets/
│ │ │ ├── app.js
│ │ │ ├── deleted.js
│ │ │ ├── detail.js
│ │ │ ├── edit.js
│ │ │ └── style.css
│ │ │
│ │ ├── deleted.html
│ │ ├── detail.html
│ │ ├── edit.html
│ │ ├── error.html
│ │ └── index.html
│ │
│ ├── Dockerfile
│ └── nginx.conf
│
├── .gitignore
|ــ .env
├── docker-compose.yml
└── README.md

```

## 🚀 Getting Started

### 1️⃣ Build & Run

docker compose up --build

### 2️⃣ Access the Application

Frontend:
http://localhost

Backend API:
http://localhost:3001

Database:
localhost:5432

---

## 🏗️ Services & Ports

| Service  | Port | Description         |
| -------- | ---- | ------------------- |
| frontend | 80   | Nginx static server |
| backend  | 3001 | Express REST API    |
| db       | 5432 | PostgreSQL database |

---

## 🔗 API Endpoints

### Test API

GET /api/test

### Create User

POST /api/users
Body:
{
"name": "Mina",
"email": "mina@example.com"
}

### Get All Users

GET /api/users

### Get Deleted Users

GET /api/users?deleted=true

### Get User By ID

GET /api/users/:id

### Update User

PUT /api/users/:id

### Soft Delete User

DELETE /api/users/:id

### Restore Deleted User

PUT /api/users/:id/restore

---

## 🗄️ Database

PostgreSQL 15 (Alpine)

Table auto-created on startup:

users (
id SERIAL PRIMARY KEY,
name VARCHAR(100),
email VARCHAR(100) UNIQUE,
isDeleted BOOLEAN DEFAULT FALSE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
deleted_at TIMESTAMP
)

---

## 🐳 Architecture

Frontend (Nginx :80)
↓
Backend (Node.js :3001)
↓
PostgreSQL (:5432)

All services run inside a Docker bridge network.

---

## 🛑 Stop Containers

docker compose down

Remove volumes (delete DB data):

docker compose down -v

---

## ✨ Features

- Full CRUD operations
- Soft delete & restore
- Docker multi-stage builds
- Persistent PostgreSQL volume
- Automatic DB table creation
- Clean production-ready setup

---

## 👨‍💻 Author

Mina Nasser
"""
