AOS.init({ duration: 600, once: true });

const API_BASE = "http://localhost:5000/api";
const AUTH_KEY = "jwt"; // store token under this key

// ===== AUTH HELPERS =====
function getToken() {
  return localStorage.getItem(AUTH_KEY);
}

function isLoggedIn() {
  return !!getToken();
}

function setToken(token) {
  localStorage.setItem(AUTH_KEY, token);
}

function clearToken() {
  localStorage.removeItem(AUTH_KEY);
}

function logout() {
  clearToken();
  window.location.reload();
}

// ===== AUTHENTICATED FETCH =====
async function authFetch(url, options = {}) {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    // Token expired or invalid
    clearToken();
    // Show login modal again
    showLoginModal(() => {
      document.getElementById("adminContent").style.display = "block";
      initAdmin();
    });
    throw new Error("Session expired. Please login again.");
  }
  return res;
}

// ===== LOGIN MODAL =====
const loginOverlay = document.getElementById("loginOverlay");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
let pendingAction = null;

function showLoginModal(callback) {
  pendingAction = callback;
  loginError.classList.remove("show");
  loginForm.reset();
  loginOverlay.classList.add("active");
  document.getElementById("loginUsername").focus();
}

function hideLoginModal() {
  loginOverlay.classList.remove("active");
  pendingAction = null;
}

// Login form submit – calls API
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok && data.token) {
      setToken(data.token);
      hideLoginModal();
      if (typeof pendingAction === "function") {
        pendingAction();
        pendingAction = null;
      }
      showToast("Login successful!", "success");
      document.getElementById("adminContent").style.display = "block";
      initAdmin();
    } else {
      loginError.classList.add("show");
      loginError.textContent = data.message || "Invalid credentials.";
    }
  } catch (err) {
    loginError.classList.add("show");
    loginError.textContent = "Network error. Please try again.";
  }
});

loginOverlay.addEventListener("click", (e) => {
  if (e.target === loginOverlay) {
    hideLoginModal();
    pendingAction = null;
  }
});

// ===== TOAST =====
function showToast(msg, type = "success") {
  const toast = document.getElementById("toast");
  const icon = toast.querySelector("i");
  const message = document.getElementById("toastMessage");
  message.textContent = msg;
  toast.className = "toast " + type;
  icon.className =
    type === "success" ? "fas fa-check-circle" : "fas fa-exclamation-circle";
  void toast.offsetWidth;
  toast.classList.add("show");
  clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => toast.classList.remove("show"), 3500);
}

// ===== ADMIN LOGIC =====
async function loadConfig() {
  try {
    const res = await fetch(`${API_BASE}/config`);
    if (!res.ok) throw new Error("Failed to load config");
    const config = await res.json();
    renderConfig(config);
  } catch (err) {
    showToast("Error loading config: " + err.message, "error");
  }
}

function renderConfig(config) {
  const container = document.getElementById("configForm");
  container.innerHTML = "";
  for (const [key, value] of Object.entries(config)) {
    const div = document.createElement("div");
    div.className = "form-group";
    div.setAttribute("data-aos", "fade-up");
    const label = document.createElement("label");
    label.textContent = key.replace(/_/g, " ").toUpperCase();
    const input = document.createElement("input");
    input.type = "text";
    input.value = value;
    input.dataset.key = key;
    div.appendChild(label);
    div.appendChild(input);
    container.appendChild(div);
  }
}

async function saveConfig() {
  const inputs = document.querySelectorAll("#configForm input");
  const updates = [];
  inputs.forEach((inp) => {
    const key = inp.dataset.key;
    const value = inp.value;
    updates.push(
      authFetch(`${API_BASE}/config/${key}`, {
        method: "PUT",
        body: JSON.stringify({ value }),
      }),
    );
  });
  try {
    await Promise.all(updates);
    showToast("All settings saved!", "success");
  } catch (err) {
    showToast("Error saving config: " + err.message, "error");
  }
}

async function loadProjects() {
  try {
    const res = await fetch(`${API_BASE}/projects`);
    if (!res.ok) throw new Error("Failed to load projects");
    const data = await res.json();
    renderProjects(data);
  } catch (err) {
    showToast("Error loading projects: " + err.message, "error");
  }
}

function renderProjects(projects) {
  const container = document.getElementById("projectList");
  if (projects.length === 0) {
    container.innerHTML = '<p style="color:#888;">No projects yet.</p>';
    return;
  }
  container.innerHTML = projects
    .map(
      (p) => `
                <div class="project-item" data-id="${p.id}" data-aos="fade-up">
                    <div class="project-info">
                        <h3>${escapeHtml(p.title)}</h3>
                        <p>${escapeHtml(p.description || "")}</p>
                        <small>Tech: ${escapeHtml(p.technologies || "")}</small>
                    </div>
                    <div class="project-actions">
                        <button class="btn-edit-project" data-id="${p.id}"><i class="fas fa-edit"></i> Edit</button>
                        <button class="btn-delete-project" data-id="${p.id}"><i class="fas fa-trash"></i> Delete</button>
                    </div>
                </div>
            `,
    )
    .join("");

  document.querySelectorAll(".btn-edit-project").forEach((btn) => {
    btn.addEventListener("click", () => editProject(btn.dataset.id));
  });
  document.querySelectorAll(".btn-delete-project").forEach((btn) => {
    btn.addEventListener("click", () => deleteProject(btn.dataset.id));
  });

  // Refresh AOS
  AOS.refresh();
}

function escapeHtml(str) {
  if (!str) return "";
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

async function deleteProject(id) {
  if (!confirm("Delete this project?")) return;
  try {
    const res = await authFetch(`${API_BASE}/projects/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Delete failed");
    showToast("Project deleted", "success");
    loadProjects();
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function editProject(id) {
  try {
    const res = await fetch(`${API_BASE}/projects/${id}`);
    if (!res.ok) throw new Error("Failed to load project");
    const project = await res.json();
    document.getElementById("newTitle").value = project.title;
    document.getElementById("newDesc").value = project.description || "";
    document.getElementById("newTech").value = project.technologies || "";
    document.getElementById("newGithub").value = project.github_url || "";
    document.getElementById("newLive").value = project.live_url || "";
    document.getElementById("newImage").value = project.image_url || "";
    const btn = document.querySelector('#addProjectForm button[type="submit"]');
    btn.textContent = "Update Project";
    btn.classList.remove("btn-success");
    btn.classList.add("btn-primary");
    btn.dataset.editId = id;
  } catch (err) {
    showToast("Failed to load project: " + err.message, "error");
  }
}

async function handleProjectSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  const editId = btn.dataset.editId;

  const data = {
    title: document.getElementById("newTitle").value.trim(),
    description: document.getElementById("newDesc").value.trim(),
    technologies: document.getElementById("newTech").value.trim(),
    github_url: document.getElementById("newGithub").value.trim(),
    live_url: document.getElementById("newLive").value.trim(),
    image_url: document.getElementById("newImage").value.trim(),
  };

  try {
    let url = `${API_BASE}/projects`;
    let method = "POST";
    if (editId) {
      url += `/${editId}`;
      method = "PUT";
    }
    const res = await authFetch(url, {
      method,
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Save failed");
    showToast(editId ? "Project updated!" : "Project added!", "success");
    form.reset();
    btn.textContent = "Add Project";
    btn.classList.remove("btn-primary");
    btn.classList.add("btn-success");
    delete btn.dataset.editId;
    loadProjects();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ===== SSE AUTO-UPDATE =====
function connectSSE() {
  const eventSource = new EventSource(`${API_BASE.replace("/api", "")}/events`);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("Admin SSE event:", data);
      if (data.type === "config-update") {
        loadConfig();
      } else if (data.type === "projects-update") {
        loadProjects();
      }
    } catch (e) {
      console.error("SSE parse error:", e);
    }
  };

  eventSource.onerror = (err) => {
    console.error("SSE connection error, reconnecting in 3s...", err);
    eventSource.close();
    setTimeout(connectSSE, 3000);
  };
}

function initAdmin() {
  loadConfig();
  loadProjects();
  document
    .getElementById("saveConfigBtn")
    .addEventListener("click", saveConfig);
  document
    .getElementById("addProjectForm")
    .addEventListener("submit", handleProjectSubmit);
  document.getElementById("logoutBtn").addEventListener("click", logout);
  connectSSE(); // start SSE after login
}

// ===== ON LOAD =====
document.addEventListener("DOMContentLoaded", () => {
  if (isLoggedIn()) {
    document.getElementById("adminContent").style.display = "block";
    initAdmin();
  } else {
    showLoginModal(() => {
      document.getElementById("adminContent").style.display = "block";
      initAdmin();
    });
  }
});
