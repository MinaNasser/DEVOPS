const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
// app.use(
//   cors({
//     origin: "http://localhost",
//   }),
// );
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3001;
const pool = new Pool({
  host: process.env.DB_HOST || "db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "admin",
  database: process.env.DB_NAME || "postgres",
  port: process.env.DB_PORT || 5432,
});

// 🔹 Retry logic للـ DB
const waitForDB = async () => {
  let connected = false;
  while (!connected) {
    try {
      await pool.query("SELECT 1");
      connected = true;
    } catch (err) {
      console.log("Waiting for DB...");
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
};

// 🔹 إنشاء جدول users لو مش موجود
const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      isDeleted BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP
    );
  `;
  await pool.query(query);
  console.log("Users table ready ✅");
};

// 🔹 Init backend
(async () => {
  console.log("Connecting to database...");
  await waitForDB();
  console.log("Database connected ✅");
  await createTable();
})();

// 🔹 Test endpoint
app.get("/api/test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "Backend working 🚀", time: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Create User
app.post("/api/users", async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email)
      return res.status(400).json({ error: "Name and email required" });

    const existing = await pool.query(
      "SELECT * FROM users WHERE email=$1 AND isDeleted=FALSE",
      [email],
    );
    if (existing.rows.length > 0)
      return res.status(400).json({ error: "Email already exists" });

    const result = await pool.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      [name, email],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Get all users (supports query ?deleted=true)
app.get("/api/users", async (req, res) => {
  try {
    const { deleted } = req.query;
    const condition = deleted === "true" ? "isDeleted=TRUE" : "isDeleted=FALSE";
    const result = await pool.query(
      `SELECT * FROM users WHERE ${condition} ORDER BY id ASC`,
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Get Deleted Users
app.get("/api/users/deleted", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE isDeleted=TRUE ORDER BY deleted_at DESC",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Get One User by ID (if not deleted)
app.get("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM users WHERE id=$1 AND isDeleted=FALSE",
      [id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Update User by ID
app.put("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    if (!name || !email)
      return res.status(400).json({ error: "Name and email required" });

    const existing = await pool.query(
      "SELECT * FROM users WHERE email=$1 AND id<>$2 AND isDeleted=FALSE",
      [email, id],
    );
    if (existing.rows.length > 0)
      return res.status(400).json({ error: "Email already exists" });

    const result = await pool.query(
      "UPDATE users SET name=$1, email=$2 WHERE id=$3 AND isDeleted=FALSE RETURNING *",
      [name, email, id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Soft Delete User by ID
app.delete("/api/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE users SET isDeleted=TRUE, deleted_at=NOW() WHERE id=$1 AND isDeleted=FALSE RETURNING *",
      [id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted ✅", user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 🔹 Restore deleted user by ID
app.put("/api/users/:id/restore", async (req, res) => {
  try {
    const { id } = req.params;

    // تحديث الـ isDeleted للـ FALSE
    const result = await pool.query(
      "UPDATE users SET isDeleted=FALSE, deleted_at=NULL WHERE id=$1 AND isDeleted=TRUE RETURNING *",
      [id],
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Deleted user not found" });

    res.json({ message: "User restored ✅", user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
