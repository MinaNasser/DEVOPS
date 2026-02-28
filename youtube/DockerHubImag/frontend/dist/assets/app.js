// 🔹 استخدام الـ template literal صح
const API = `http://localhost:3001/api/users`;

console.log("API endpoint:", API);
const loader = document.getElementById("loader");
const tbody = document.querySelector("#usersTable tbody");
const addForm = document.getElementById("addUserForm");

// 🔹 إنشاء عنصر الخطأ
const errorDiv = document.createElement("div");
errorDiv.id = "error-message";
errorDiv.style.cssText = `
    color: var(--danger);
    margin: 10px 0;
    padding: 15px;
    border-radius: 4px;
    background: rgba(231, 76, 60, 0.2);
    border: 1px solid var(--danger);
    display: none;
    text-align: center;
    font-weight: bold;
    position: relative;
    z-index: 1000;
`;

// إضافة زر الإغلاق
const closeBtn = document.createElement("span");
closeBtn.innerHTML = "&times;";
closeBtn.style.cssText = `
    position: absolute;
    right: 10px;
    top: 5px;
    cursor: pointer;
    font-size: 20px;
    color: var(--danger);
    font-weight: bold;
`;
closeBtn.onclick = () => {
  errorDiv.style.display = "none";
};
errorDiv.appendChild(closeBtn);

// إضافة مكان للخطأ في الصفحة
if (addForm && addForm.parentNode) {
  addForm.parentNode.insertBefore(errorDiv, addForm);
}

// 🔹 دالة لعرض الأخطاء في الصفحة
function showError(message, isSuccess = false) {
  console.error("❌ Error:", message);

  if (!errorDiv) return;

  errorDiv.innerHTML = "";
  errorDiv.appendChild(closeBtn);

  const msgSpan = document.createElement("span");
  msgSpan.textContent = message;
  msgSpan.style.marginRight = "25px";
  errorDiv.appendChild(msgSpan);

  if (isSuccess) {
    errorDiv.style.background = "rgba(46, 204, 113, 0.2)";
    errorDiv.style.borderColor = "var(--success)";
    errorDiv.style.color = "var(--success)";
  } else {
    errorDiv.style.background = "rgba(231, 76, 60, 0.2)";
    errorDiv.style.borderColor = "var(--danger)";
    errorDiv.style.color = "var(--danger)";
  }

  errorDiv.style.display = "block";

  setTimeout(() => {
    if (errorDiv.style.display !== "none") {
      errorDiv.style.display = "none";
    }
  }, 5000);
}

// 🔹 جلب المستخدمين
async function fetchUsers() {
  if (!loader || !tbody) {
    console.warn("Loader or tbody not found");
    return;
  }

  loader.style.display = "block";
  tbody.innerHTML = "";

  try {
    console.log("📡 Fetching users from:", API);
    const res = await fetch(API);
    console.log("📊 Response status:", res.status);

    const contentType = res.headers.get("content-type") || "";
    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}`);
    }

    if (!contentType.includes("application/json")) {
      throw new Error(
        `Expected JSON, but got ${contentType}. Did the API URL change?`,
      );
    }

    const users = await res.json();
    console.log("✅ Users loaded:", users);

    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center;">📭 No users found. Add one below 👇</td></tr>`;
      return;
    }

    users.forEach((u) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.id}</td>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>
          <button class="edit-button" onclick="editUser(${u.id})">✏️ Edit</button>
          <button class="delete-button" onclick="deleteUser(${u.id})">🗑️ Delete</button>
          <button class="view-button" onclick="viewUser(${u.id})">👁️ View</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("🔥 Fetch error:", err);
    showError("Error loading users. Check console for details.");
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--danger);">⚠️ Failed to load users</td></tr>`;
  } finally {
    loader.style.display = "none";
  }
}
// 🔹 إضافة مستخدم جديد
async function addUser(e) {
  e.preventDefault();

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const name = nameInput?.value.trim();
  const email = emailInput?.value.trim();

  if (!name || !email) {
    showError("⚠️ All fields are required");
    return;
  }

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to add user");
    }

    nameInput.value = "";
    emailInput.value = "";
    showError("✅ User added successfully!", true);
    fetchUsers();
  } catch (err) {
    showError(err.message || "Error adding user");
  }
}

// 🔹 حذف مستخدم
async function deleteUser(id) {
  if (!confirm("🗑️ Delete this user?")) return;

  try {
    const res = await fetch(`${API}/${id}`, { method: "DELETE" });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to delete user");
    }

    showError("✅ User deleted successfully!", true);
    fetchUsers();
  } catch (err) {
    showError(err.message || "Error deleting user");
  }
}

// 🔹 التنقل للصفحات الأخرى
function editUser(id) {
  window.location.href = `edit.html?id=${id}`;
}

function viewUser(id) {
  window.location.href = `detail.html?id=${id}`;
}

// 🔹 Event Listeners
if (addForm) {
  addForm.addEventListener("submit", addUser);
  console.log("✅ Add form listener attached");
}

// 🔹 Export functions
window.editUser = editUser;
window.viewUser = viewUser;
window.deleteUser = deleteUser;

// 🔹 Initial load
console.log("🚀 Starting initial fetch...");
fetchUsers();
