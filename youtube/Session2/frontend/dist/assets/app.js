const API = "/api/users";

const loader = document.getElementById("loader");
const tbody = document.querySelector("#usersTable tbody");
const addForm = document.getElementById("addUserForm");

// جلب المستخدمين
async function fetchUsers() {
  loader.style.display = "block";
  tbody.innerHTML = "";

  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error("Failed to fetch users");

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
    tbody.innerHTML = `<tr><td colspan="4">Error loading users.</td></tr>`;
    console.error(err);
  } finally {
    loader.style.display = "none";
  }
}

// إضافة مستخدم جديد
async function addUser(e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!name || !email) return alert("All fields are required");

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    if (res.ok) {
      fetchUsers();
      e.target.reset();
    } else {
      const error = await res.json();
      alert(error.error || "Failed to add user");
      window.location.href = "error.html";
    }
  } catch (err) {
    alert("Error adding user");
    window.location.href = "error.html";
    console.error(err);
  }
}

// حذف مستخدم
async function deleteUser(id) {
  if (!confirm("Delete this user?")) return;
  try {
    const res = await fetch(`${API}/${id}`, { method: "DELETE" });
    if (res.ok) fetchUsers();
    else {
      const error = await res.json();
      alert(error.error || "Failed to delete user");
    }
  } catch (err) {
    alert("Error deleting user");
    window.location.href = "error.html";
    console.error(err);
  }
}

// التنقل للصفحات الأخرى
function editUser(id) {
  window.location.href = `edit.html?id=${id}`;
}
function viewUser(id) {
  window.location.href = `detail.html?id=${id}`;
}

addForm.addEventListener("submit", addUser);
fetchUsers();
