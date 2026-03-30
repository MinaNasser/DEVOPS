const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const os = require("os");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || "postgresql://app:secret@localhost:5432/myapp",
});

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later." },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/", limiter);

// Health check
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      status: "healthy",
      hostname: os.hostname(),
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: "unhealthy",
      hostname: os.hostname(),
      database: "disconnected",
      error: err.message,
    });
  }
});

// Get all active items (not deleted)
app.get("/api/items", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM items WHERE is_deleted = false ORDER BY created_at DESC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// Get deleted items (soft deleted)
app.get("/api/items/deleted", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM items WHERE is_deleted = true ORDER BY deleted_at DESC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching deleted items:", err);
    res.status(500).json({ error: "Failed to fetch deleted items" });
  }
});

// Get all items including deleted (admin view)
app.get("/api/items/all", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM items ORDER BY created_at DESC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching all items:", err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// Create new item
app.post("/api/items", async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO items (name, created_at, updated_at, is_deleted) 
       VALUES ($1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false) 
       RETURNING *`,
      [name.trim()],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating item:", err);
    res.status(500).json({ error: "Failed to create item" });
  }
});

// Soft delete item (set is_deleted = true and deleted_at timestamp)
app.delete("/api/items/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE items 
       SET is_deleted = true, 
           deleted_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND is_deleted = false 
       RETURNING *`,
      [id],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Item not found or already deleted" });
    }

    res.json({
      message: "Item deleted successfully",
      item: result.rows[0],
    });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

// Restore deleted item
app.put("/api/items/:id/restore", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE items 
       SET is_deleted = false, 
           deleted_at = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND is_deleted = true 
       RETURNING *`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found or not deleted" });
    }

    res.json({
      message: "Item restored successfully",
      item: result.rows[0],
    });
  } catch (err) {
    console.error("Error restoring item:", err);
    res.status(500).json({ error: "Failed to restore item" });
  }
});

// Permanent delete (hard delete) - removes from database completely
app.delete("/api/items/:id/permanent", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM items WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json({
      message: "Item permanently deleted",
      item: result.rows[0],
    });
  } catch (err) {
    console.error("Error permanently deleting item:", err);
    res.status(500).json({ error: "Failed to permanently delete item" });
  }
});

// Update item
app.put("/api/items/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    const result = await pool.query(
      `UPDATE items 
       SET name = $1, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND is_deleted = false 
       RETURNING *`,
      [name.trim(), id],
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Item not found or has been deleted" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).json({ error: "Failed to update item" });
  }
});

// Retrieve item by id
app.get("/api/items/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM items WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching item:", err);
    res.status(500).json({ error: "Failed to fetch item" });
  }
});

// Get items statistics
app.get("/api/items/stats", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_deleted = false THEN 1 END) as active,
        COUNT(CASE WHEN is_deleted = true THEN 1 END) as deleted
      FROM items
    `);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Hostname: ${os.hostname()}`);
  console.log(
    `Database: ${process.env.DATABASE_URL || "postgresql://app:secret@localhost:5432/myapp"}`,
  );
});
