// ============================================================
// DEBUG VERSION – logs every step
// ============================================================
const API_BASE = "http://localhost:5000/api";

console.log("🚀 index.js loaded!");

// ===== AOS =====
AOS.init({ duration: 800, easing: "ease-out-cubic", once: true, offset: 50 });
console.log("✅ AOS initialized");

// ===== PARTICLES =====
if (typeof particlesJS !== "undefined") {
  particlesJS("particles-js", {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: "#3b82f6" },
      shape: { type: "circle" },
      opacity: { value: 0.3, random: true },
      size: { value: 3, random: true },
      line_linked: {
        enable: true,
        distance: 150,
        color: "#3b82f6",
        opacity: 0.2,
        width: 1,
      },
      move: {
        enable: true,
        speed: 2,
        direction: "none",
        random: true,
        straight: false,
        out_mode: "out",
      },
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: true, mode: "grab" },
        onclick: { enable: true, mode: "push" },
        resize: true,
      },
    },
    retina_detect: true,
  });
  console.log("✅ Particles initialized");
} else {
  console.warn("⚠️ particlesJS not available");
}

// ============================================================
// SIMPLIFIED LOAD FUNCTIONS (with logging)
// ============================================================
async function loadConfig() {
  console.log("🔍 loadConfig() called...");
  try {
    const res = await fetch(`${API_BASE}/config`);
    console.log(`📡 Config response status: ${res.status}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const config = await res.json();
    console.log("✅ Config data:", config);

    // Update DOM
    document.getElementById("navName").textContent = config.nav_name || "Lucky";
    document.getElementById("heroTitle").textContent =
      config.hero_title || "Creative Web Developer";
    document.getElementById("heroDesc").textContent =
      config.hero_subtitle || "Bringing ideas to life through code and design";

    const aboutContainer = document.getElementById("aboutText");
    if (config.about_text) {
      const paragraphs = config.about_text.split("\n").filter((p) => p.trim());
      aboutContainer.innerHTML = paragraphs
        .map((p) => `<p>${escapeHtml(p.trim())}</p>`)
        .join("");
      console.log(`✅ About rendered (${paragraphs.length} paragraphs)`);
    } else {
      aboutContainer.innerHTML = "<p>Hi, I'm Lucky...</p>";
      console.warn("⚠️ No about_text from API – using fallback.");
    }

    const img = document.getElementById("profileImg");
    if (config.profile_image) img.src = config.profile_image;

    document.getElementById("footerAbout").textContent =
      config.footer_about ||
      "I'm passionate about creating beautiful and functional websites...";

    console.log("✅ Config loaded and rendered.");
  } catch (err) {
    console.error("❌ loadConfig error:", err);
    showToast("Failed to load site content", "error");
  }
}

async function loadProjects() {
  console.log("📦 loadProjects() called...");
  try {
    const res = await fetch(`${API_BASE}/projects`);
    console.log(`📡 Projects response status: ${res.status}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const projects = await res.json();
    console.log("✅ Projects data:", projects);
    renderProjects(projects);
  } catch (err) {
    console.error("❌ loadProjects error:", err);
    showToast("Failed to load projects", "error");
    renderProjects([]);
  }
}

function renderProjects(projects) {
  const grid = document.getElementById("projectsGrid");
  if (!grid) {
    console.error("❌ projectsGrid not found!");
    return;
  }
  if (!projects || projects.length === 0) {
    grid.innerHTML = `<div style="text-align:center;padding:2rem;color:#888;width:100%;"><p>No projects yet.</p></div>`;
    console.warn("⚠️ No projects to render.");
    return;
  }
  grid.innerHTML = projects
    .map(
      (p, idx) => `
        <div class="project-card" data-id="${p.id}" data-aos="fade-up" data-aos-delay="${idx * 80}">
            <h3>${escapeHtml(p.title)}</h3>
            <p>${escapeHtml(p.description || "")}</p>
            <div style="margin:0.5rem 0;">
                ${(p.technologies || "")
                  .split(",")
                  .filter(Boolean)
                  .map(
                    (t) =>
                      `<span class="tech-tag">${escapeHtml(t.trim())}</span>`,
                  )
                  .join("")}
            </div>
            <div class="project-actions">
                ${p.github_url ? `<a href="${p.github_url}" target="_blank" class="btn-github"><i class="fab fa-github"></i> Code</a>` : ""}
                ${p.live_url ? `<a href="${p.live_url}" target="_blank" class="btn-live"><i class="fas fa-external-link-alt"></i> Live</a>` : ""}
            </div>
        </div>
    `,
    )
    .join("");
  console.log(`✅ Projects rendered (${projects.length} projects)`);
}

function escapeHtml(str) {
  if (!str) return "";
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

// ============================================================
// SKILLS (static)
// ============================================================
function renderSkills() {
  console.log("🎨 renderSkills() called...");
  const container = document.getElementById("skillsContainer");
  if (!container) {
    console.error("❌ skillsContainer not found!");
    return;
  }
  const skillData = [
    {
      category: "Frontend",
      skills: [
        { name: "HTML5", level: 90 },
        { name: "CSS3", level: 85 },
        { name: "JavaScript", level: 80 },
      ],
    },
    {
      category: "Libraries",
      skills: [
        { name: "React", level: 75 },
        { name: "Bootstrap", level: 85 },
        { name: "Tailwind", level: 80 },
      ],
    },
    {
      category: "Backend",
      skills: [
        { name: "Node.js", level: 70 },
        { name: "Express.js", level: 75 },
        { name: "MongoDB", level: 65 },
        { name: "MySQL", level: 70 },
        { name: "Python", level: 60 },
        { name: "PHP", level: 55 },
      ],
    },
    {
      category: "Tools & Others",
      skills: [
        { name: "Git/GitHub", level: 85 },
        { name: "WordPress", level: 80 },
        { name: "Wix", level: 70 },
        { name: "Figma", level: 75 },
        { name: "Canva", level: 60 },
      ],
    },
  ];
  container.innerHTML = "";
  skillData.forEach((cat) => {
    const div = document.createElement("div");
    div.className = "skill-category";
    div.setAttribute("data-aos", "fade-up");
    div.innerHTML = `<h3>${cat.category}</h3>`;
    cat.skills.forEach((skill) => {
      const item = document.createElement("div");
      item.className = "skill-item";
      item.innerHTML = `
                <div class="skill-name"><span>${skill.name}</span><span>${skill.level}%</span></div>
                <div class="skill-bar"><div class="fill" data-width="${skill.level}"></div></div>
            `;
      div.appendChild(item);
    });
    container.appendChild(div);
  });
  // Animate bars
  setTimeout(() => {
    document.querySelectorAll(".skill-bar .fill").forEach((bar) => {
      bar.style.width = bar.dataset.width + "%";
    });
  }, 600);
  console.log("✅ Skills rendered.");
}

// ============================================================
// TOAST (simple)
// ============================================================
function showToast(msg, type = "success") {
  console.log(`📢 Toast: ${type} – ${msg}`);
}

// ============================================================
// INIT
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 DOM ready – initializing...");
  renderSkills();
  loadConfig();
  loadProjects();
  console.log("✅ Initialization complete.");
});
