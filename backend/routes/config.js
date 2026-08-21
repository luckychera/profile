const express = require("express");
const router = express.Router();
const db = require("../utils/db");
const authenticate = require("../middlewares/auth");

// GET all config – public
router.get("/", async (req, res, next) => {
  try {
    const [rows] = await db.query(
      "SELECT config_key, config_value FROM site_config",
    );
    const config = {};
    rows.forEach((row) => {
      config[row.config_key] = row.config_value;
    });
    res.json(config);
  } catch (err) {
    next(err);
  }
});

// PUT update config – protected
router.put("/:key", authenticate, async (req, res, next) => {
  const { key } = req.params;
  const { value } = req.body;
  try {
    const [result] = await db.query(
      "UPDATE site_config SET config_value = ? WHERE config_key = ?",
      [value, key],
    );
    if (result.affectedRows === 0) {
      await db.query(
        "INSERT INTO site_config (config_key, config_value) VALUES (?, ?)",
        [key, value],
      );
    }
    req.app.locals.broadcast({ type: "config-update" });
    res.json({ success: true, key, value });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
