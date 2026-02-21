# Docker CRUD Project (PostgreSQL + Node.js + Frontend)

This is a complete **Dockerized CRUD project** using PostgreSQL, Node.js (Express), and HTML Frontend served by Nginx.  
It supports **Create, Read, Update, Delete**, viewing **Deleted Users**, and **Restoring Deleted Users**.

---

## Project Structure

```
project/
├── backend/
│   ├── app.js
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── Dockerfile
│   └── dist/
│       ├── index.html
│       ├── deleted.html
│       ├── detail.html
│       ├── edit.html
│       ├── error.html
│       └── assets/
│           ├── style.css
│           ├── app.js
│           ├── deleted.js
│           ├── detail.js
│           └── edit.js
└── docker-compose.yml
```

---

## Step 1: Setup PostgreSQL

1. Pull PostgreSQL image:
```bash
docker pull postgres:15-alpine
```

2. Run PostgreSQL container:
```bash
docker run -dit \
  --name db-postgres \
  --network web-servers \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=admin \
  -e POSTGRES_DB=postgres \
  -p 5432:5432 \
  postgres:15-alpine
```

3. (Optional) Enter PostgreSQL CLI:
```bash
docker exec -it db-postgres psql -U postgres
```

4. Node.js backend auto-creates the `users` table with `isDeleted` column for soft deletes.

---

## Step 2: Setup Node.js Backend

1. Navigate to backend folder:
```bash
cd backend
```

2. Initialize project & install dependencies:
```bash
npm init -y
npm install express pg cors
```

3. Backend handles endpoints:
- `GET /api/users` → all active users
- `GET /api/users/:id` → single user
- `POST /api/users` → create user
- `PUT /api/users/:id` → update user
- `DELETE /api/users/:id` → soft delete user
- `GET /api/users/deleted` → get deleted users
- `POST /api/users/deleted/:id/restore` → restore deleted user

4. Dockerfile:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "app.js"]
```

5. Build & run backend container:
```bash
docker build -t node-backend .
docker run -dit --name backend --network web-servers -p 3000:3000 node-backend
```

---

## Step 3: Setup Frontend

1. Navigate to frontend folder.
2. HTML pages:
   - `index.html` → list and add users
   - `deleted.html` → list deleted users and restore
   - `detail.html` → user detail
   - `edit.html` → edit user
   - `error.html` → fallback
3. JS & CSS in `assets/` folder.

4. Dockerfile:
```dockerfile
FROM nginx:alpine
COPY ./dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

5. Build & run frontend container:
```bash
docker build -t frontend .
docker run -dit --name web --network web-servers -p 80:80 frontend
```

---

## Step 4: Docker Compose (Optional)

```yaml
version: '3'
services:
  db:
    image: postgres:15-alpine
    container_name: db-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: admin
      POSTGRES_DB: postgres
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - web-servers

  backend:
    build: ./backend
    container_name: backend
    depends_on:
      - db
    environment:
      DB_HOST: db
      DB_USER: postgres
      DB_PASSWORD: admin
      DB_NAME: postgres
      DB_PORT: 5432
    ports:
      - "3000:3000"
    networks:
      - web-servers

  frontend:
    build: ./frontend
    container_name: web
    depends_on:
      - backend
    ports:
      - "80:80"
    networks:
      - web-servers

volumes:
  pgdata:

networks:
  web-servers:
    driver: bridge
```

Run all containers:
```bash
docker-compose up -d
```

---

## Step 5: Test CRUD Endpoints

| Action               | Method | Endpoint                               | Body Example                                   |
|----------------------|--------|----------------------------------------|-----------------------------------------------|
| Create User          | POST   | /api/users                             | {"name":"Mina","email":"mina@test.com"}|
| Read All Users        | GET    | /api/users                             | -                                             |
| Read One User         | GET    | /api/users/1                           | -                                             |
| Update User           | PUT    | /api/users/1                           | {"name":"Ali","email":"ali@test.com"}  |
| Delete User (soft)    | DELETE | /api/users/1                           | -                                             |
| Get Deleted Users      | GET    | /api/users/deleted                     | -                                             |
| Restore Deleted User   | POST   | /api/users/deleted/1/restore           | -                                             |

---

## Notes
- Nginx proxies `/api/*` to the backend container.
- Frontend is SPA-ready (HTML5 routing fallback to `index.html`).
- Backend auto-creates `users` table with `isDeleted` column.
- Soft delete users instead of permanent removal.
- Deleted users can be restored via `/api/users/deleted/:id/restore`.

Project fully ready for **Dockerized CRUD with Restore functionality**.

