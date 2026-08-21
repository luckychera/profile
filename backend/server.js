const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


// MySQL connection – reads from environment variables (falls back to local dev defaults)
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "#Chera246",
  database: process.env.DB_NAME || "portfolio",
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL connected");

  // Create tables if they don't exist
  const createConfigTable = `
        CREATE TABLE IF NOT EXISTS site_config (
            id INT AUTO_INCREMENT PRIMARY KEY,
            config_key VARCHAR(50) UNIQUE NOT NULL,
            config_value TEXT
        )
    `;
  db.query(createConfigTable);

  const createProjectsTable = `
        CREATE TABLE IF NOT EXISTS projects (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            technologies VARCHAR(255),
            github_url VARCHAR(255),
            live_url VARCHAR(255),
            image_url VARCHAR(255)
        )
    `;
  db.query(createProjectsTable);

  // ===== INSERT DEFAULT PROJECTS =====
  db.query("SELECT COUNT(*) as count FROM projects", (err, results) => {
    if (err) {
      console.error("Error checking projects:", err);
      return;
    }
    if (results[0].count === 0) {
      const defaultProjects = [
        [
          "E-commerce Platform",
          "A full-featured online store with payment integration, product management, and order tracking. Built with modern technologies to provide a seamless shopping experience.",
          "React, Node.js, Stripe, MongoDB",
          "https://github.com/example/ecommerce",
          "https://example-shop.com",
          "",
        ],
        [
          "School Management Web App",
          "Complete school management system for administrators, teachers, and students. Features include attendance tracking, grade management, and parent communication.",
          "Vue.js, Django, PostgreSQL",
          "https://github.com/example/school-mgmt",
          "https://school-demo.com",
          "",
        ],
        [
          "Result View System",
          "Interactive dashboard for viewing and analyzing student results with beautiful charts and filters. Teachers can upload results and students can view their performance.",
          "PHP, MySQL, Bootstrap, Chart.js",
          "https://github.com/example/result-view",
          "https://results-demo.com",
          "",
        ],
        [
          "Barbershop Platform",
          "Booking and management platform for barbershops. Clients can book appointments, view services, and make payments online. Includes admin dashboard for staff management.",
          "React, Node.js, MongoDB, Socket.io",
          "https://github.com/example/barbershop",
          "https://barber-demo.com",
          "",
        ],
        [
          "Digital E-learning Website",
          "Online learning platform with video courses, interactive quizzes, and student progress tracking. Features include course creation, enrollment, and certificate generation.",
          "Next.js, Tailwind CSS, Firebase, Stripe",
          "https://github.com/example/e-learning",
          "https://learn-demo.com",
          "",
        ],
        [
          "TelPital Healthcare",
          "Telemedicine and patient management platform. Includes video consultations, electronic health records, appointment scheduling, and prescription management.",
          "React Native, Node.js, Express, MySQL",
          "https://github.com/example/telpital",
          "https://health-demo.com",
          "",
        ],
      ];

      defaultProjects.forEach((proj) => {
        db.query(
          "INSERT INTO projects (title, description, technologies, github_url, live_url, image_url) VALUES (?, ?, ?, ?, ?, ?)",
          proj,
          (err) => {
            if (err) console.error("Error inserting project:", err);
          },
        );
      });
      console.log("✅ Default projects inserted successfully!");
    }
  });

  // ===== INSERT DEFAULT CONFIG =====
  const defaults = [
      ["nav_name", "Lucky"],
      ["hero_title", "Creative Web Developer"],
      ["hero_subtitle", "Bringing ideas to life through code and design"],
      [
          "about_text",
          "Hi, I'm Lucky. I'm a web developer who loves turning ideas into clean, clickable websites. I got into coding because I enjoy solving puzzles—and building stuff people actually use.\n\n" +
          "My journey in web development started with a curiosity for how things work on the internet, and it has evolved into a fulfilling career where I get to solve problems and create digital solutions every day.\n\n" +
          "I specialize in full-stack development with modern technologies like React, Node.js, and MySQL. I'm passionate about creating responsive, user-friendly interfaces that provide an excellent experience across all devices.\n\n" +
          "Outside of development, I also run a live stream and digital content hub. I design custom graphics, manage interactive broadcasts across platforms like TikTok and YouTube, and build engaging spaces for gaming and tech communities. This lets me blend my technical skills with creative media production.\n\n" +
          "I'm constantly learning new technologies and techniques to stay at the forefront of the industry. Whether it's crafting a pixel-perfect UI or optimizing a database query, I'm always excited to take on new challenges and deliver high-quality work."
      ],
      ["profile_image", "./image/lu.jpg"],
      [
          "footer_about",
          "I'm passionate about creating beautiful and functional websites that help businesses grow and succeed online. Let's build something amazing together!"
      ],
  ];
  defaults.forEach(([key, value]) => {
    db.query(
      "INSERT IGNORE INTO site_config (config_key, config_value) VALUES (?, ?)",
      [key, value],
    );
  });
});

// ===== REST API ENDPOINTS =====
app.get("/api/config", (req, res) => {
  db.query(
    "SELECT config_key, config_value FROM site_config",
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      const config = {};
      results.forEach((row) => {
        config[row.config_key] = row.config_value;
      });
      res.json(config);
    },
  );
});

app.put("/api/config/:key", (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  db.query(
    "UPDATE site_config SET config_value = ? WHERE config_key = ?",
    [value, key],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0) {
        db.query(
          "INSERT INTO site_config (config_key, config_value) VALUES (?, ?)",
          [key, value],
          (err2) => {
            if (err2) return res.status(500).json({ error: err2.message });
            res.json({ success: true, key, value });
          },
        );
      } else {
        res.json({ success: true, key, value });
      }
    },
  );
});

app.get("/api/projects", (req, res) => {
  db.query("SELECT * FROM projects ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.get("/api/projects/:id", (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM projects WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ error: "Project not found" });
    res.json(results[0]);
  });
});

app.post("/api/projects", (req, res) => {
  const { title, description, technologies, github_url, live_url, image_url } =
    req.body;
  db.query(
    "INSERT INTO projects (title, description, technologies, github_url, live_url, image_url) VALUES (?, ?, ?, ?, ?, ?)",
    [title, description, technologies, github_url, live_url, image_url],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: result.insertId, ...req.body });
    },
  );
});

app.put("/api/projects/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, technologies, github_url, live_url, image_url } =
    req.body;
  db.query(
    "UPDATE projects SET title = ?, description = ?, technologies = ?, github_url = ?, live_url = ?, image_url = ? WHERE id = ?",
    [title, description, technologies, github_url, live_url, image_url, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (result.affectedRows === 0)
        return res.status(404).json({ error: "Project not found" });
      res.json({ id, ...req.body });
    },
  );
});

app.delete("/api/projects/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM projects WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Project not found" });
    res.json({ success: true });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
