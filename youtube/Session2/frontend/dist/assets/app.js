// backend/frontend/assets/app.js

const API = "/api/users";
const loader = document.getElementById("loader");
const tbody = document.querySelector("#usersTable tbody");
const addForm = document.getElementById("addUserForm");

// 🔹 دالة مركزية لتحويل الأخطاء لصفحة error.html
function redirectToError(message) {
  window.location.href = `error.html?msg=${encodeURIComponent(message)}`;
}

// 🔹 جلب المستخدمين
async function fetchUsers() {
  loader.style.display = "block";
  tbody.innerHTML = "";

  try {
    const res = await fetch(API);
    if (!res.ok) {
      const error = await res.json();
      redirectToError(error.error || "Failed to fetch users");
      return;
    }

    const users = await res.json();

    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4">No users found.</td></tr>`;
      return;
    }

    users.forEach((u) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.id}</td>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>
          <button class="edit-button" onclick="editUser(${u.id})">Edit</button>
          <button class="delete-button" onclick="deleteUser(${u.id})">Delete</button>
          <button class="view-button" onclick="viewUser(${u.id})">View</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    redirectToError(err.message || "Error loading users");
  } finally {
    loader.style.display = "none";
  }
}

// 🔹 إضافة مستخدم جديد
async function addUser(e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!name || !email) return redirectToError("All fields are required");

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    if (!res.ok) {
      const error = await res.json();
      redirectToError(error.error || "Failed to add user");
      return;
    }

    fetchUsers();
    e.target.reset();
  } catch (err) {
    redirectToError(err.message || "Error adding user");
  }
}

// 🔹 حذف مستخدم (Soft Delete)
async function deleteUser(id) {
  if (!confirm("Delete this user?")) return;

  try {
    const res = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const error = await res.json();
      redirectToError(error.error || "Failed to delete user");
      return;
    }
    fetchUsers();
  } catch (err) {
    redirectToError(err.message || "Error deleting user");
  }
}

// 🔹 استرجاع مستخدم محذوف
async function retrieveUser(id) {
  try {
    const res = await fetch(`${API}/retrieve/${id}`, { method: "PUT" });
    if (!res.ok) {
      const error = await res.json();
      redirectToError(error.error || "Failed to retrieve user");
      return;
    }
    fetchDeleted(); // لو صفحة deleted.html
  } catch (err) {
    redirectToError(err.message || "Error retrieving user");
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
addForm.addEventListener("submit", addUser);

// 🔹 Initial load
fetchUsers();
