const express = require("express");
const router = express.Router();
const db = require("../utils/db");
const authenticate = require("../middlewares/auth");

// GET all – public
router.get("/", async (req, res, next) => {
  try {
    const [rows] = await db.query("SELECT * FROM projects ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET single – public
router.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT * FROM projects WHERE id = ?", [id]);
    if (rows.length === 0) {
      const err = new Error("Project not found");
      err.status = 404;
      throw err;
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST – protected
router.post("/", authenticate, async (req, res, next) => {
  const { title, description, technologies, github_url, live_url, image_url } =
    req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO projects (title, description, technologies, github_url, live_url, image_url) VALUES (?, ?, ?, ?, ?, ?)",
      [title, description, technologies, github_url, live_url, image_url],
    );
    const newProject = {
      id: result.insertId,
      title,
      description,
      technologies,
      github_url,
      live_url,
      image_url,
    };
    req.app.locals.broadcast({ type: "projects-update" });
    res.status(201).json(newProject);
  } catch (err) {
    next(err);
  }
});

// PUT – protected
router.put("/:id", authenticate, async (req, res, next) => {
  const { id } = req.params;
  const { title, description, technologies, github_url, live_url, image_url } =
    req.body;
  try {
    const [result] = await db.query(
      "UPDATE projects SET title = ?, description = ?, technologies = ?, github_url = ?, live_url = ?, image_url = ? WHERE id = ?",
      [title, description, technologies, github_url, live_url, image_url, id],
    );
    if (result.affectedRows === 0) {
      const err = new Error("Project not found");
      err.status = 404;
      throw err;
    }
    req.app.locals.broadcast({ type: "projects-update" });
    res.json({
      id,
      title,
      description,
      technologies,
      github_url,
      live_url,
      image_url,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE – protected
router.delete("/:id", authenticate, async (req, res, next) => {
  const { id } = req.params;
  try {
    const [result] = await db.query("DELETE FROM projects WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      const err = new Error("Project not found");
      err.status = 404;
      throw err;
    }
    req.app.locals.broadcast({ type: "projects-update" });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
