// backend/frontend/assets/app.js

const API_BASE = "/api"; // ✅ استخدام base path
const API = `${API_BASE}/users`;
const loader = document.getElementById("loader");
const tbody = document.querySelector("#usersTable tbody");
const addForm = document.getElementById("addUserForm");

// 🔹 دالة مركزية لتحويل الأخطاء لصفحة error.html
function redirectToError(message) {
  window.location.href = `error.html?msg=${encodeURIComponent(message)}`;
}

// 🔹 جلب المستخدمين
async function fetchUsers() {
  if (!loader || !tbody) return; // ✅ تأكد من وجود العناصر

  loader.style.display = "block";
  tbody.innerHTML = "";

  try {
    const res = await fetch(API);
    if (!res.ok) {
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const error = await res.json();
        redirectToError(error.error || "Failed to fetch users");
      } else {
        const text = await res.text();
        redirectToError(`Server returned: ${text.substring(0, 50)}...`);
      }
      return;
    }

    const users = await res.json();

    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center;">No users found.</td></tr>`;
      return;
    }

    users.forEach((u) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.id}</td>
        <td>${escapeHtml(u.name)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td>
          <button class="edit-button" onclick="editUser(${u.id})">Edit</button>
          <button class="delete-button" onclick="deleteUser(${u.id})">Delete</button>
          <button class="view-button" onclick="viewUser(${u.id})">View</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Fetch error:", err);
    redirectToError(err.message || "Error loading users");
  } finally {
    loader.style.display = "none";
  }
}

// 🔹 دالة للحماية من XSS
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// 🔹 إضافة مستخدم جديد
async function addUser(e) {
  e.preventDefault();
  const name = document.getElementById("name")?.value.trim();
  const email = document.getElementById("email")?.value.trim();

  if (!name || !email) {
    redirectToError("All fields are required");
    return;
  }

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    if (!res.ok) {
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const error = await res.json();
        redirectToError(error.error || "Failed to add user");
      } else {
        const text = await res.text();
        redirectToError(`Server returned: ${text.substring(0, 50)}...`);
      }
      return;
    }

    await fetchUsers();
    e.target.reset();
  } catch (err) {
    console.error("Add error:", err);
    redirectToError(err.message || "Error adding user");
  }
}

// 🔹 حذف مستخدم (Soft Delete)
async function deleteUser(id) {
  if (!confirm("Delete this user?")) return;

  try {
    const res = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const error = await res.json();
        redirectToError(error.error || "Failed to delete user");
      } else {
        const text = await res.text();
        redirectToError(`Server returned: ${text.substring(0, 50)}...`);
      }
      return;
    }
    await fetchUsers();
  } catch (err) {
    console.error("Delete error:", err);
    redirectToError(err.message || "Error deleting user");
  }
}

// 🔹 التنقل للصفحات الأخرى
function editUser(id) {
  window.location.href = `edit.html?id=${id}`;
}
function viewUser(id) {
  window.location.href = `detail.html?id=${id}`;
}

// 🔹 Event Listener
if (addForm) {
  addForm.addEventListener("submit", addUser);
}

// 🔹 Initial load
document.addEventListener("DOMContentLoaded", fetchUsers);
