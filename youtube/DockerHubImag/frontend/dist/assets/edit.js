// backend/frontend/assets/edit.js

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// 🔹 استخدم المتغير من window (أو fallback للـ localhost)
const API = `http://localhost:3001/api/users/${id}`;
console.log("API endpoint:", API);
const loader = document.getElementById("loader");
const form = document.getElementById("editUserForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");

// 🔹 دالة لإعادة التوجيه لصفحة الأخطاء مع رسالة
function redirectToError(message) {
  window.location.href = `error.html?msg=${encodeURIComponent(message)}`;
}

// 🔹 جلب بيانات المستخدم
async function loadUser() {
  if (!loader || !form || !nameInput || !emailInput) return;

  loader.style.display = "block";
  form.style.display = "none";

  if (!id) {
    redirectToError("User ID not provided in URL");
    return;
  }

  try {
    const res = await fetch(API);

    if (!res.ok) {
      const error = await res
        .json()
        .catch(() => ({ error: "Failed to load user" }));
      throw new Error(res.status === 404 ? "User not found" : error.error);
    }

    const u = await res.json();
    nameInput.value = u.name;
    emailInput.value = u.email;

    form.style.display = "flex"; // أظهر الفورم بعد التحميل
  } catch (err) {
    console.error(err);
    redirectToError(err.message);
  } finally {
    loader.style.display = "none";
  }
}

// 🔹 حفظ التعديلات
async function saveUser(e) {
  e.preventDefault();
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();

  if (!name || !email) {
    redirectToError("All fields are required");
    return;
  }

  try {
    const res = await fetch(API, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    if (res.ok) {
      window.location.href = "index.html"; // العودة للصفحة الرئيسية
    } else {
      const error = await res
        .json()
        .catch(() => ({ error: "Failed to update user" }));
      throw new Error(error.error || "Failed to update user");
    }
  } catch (err) {
    console.error(err);
    redirectToError(err.message);
  }
}

// 🔹 Event listener
if (form) form.addEventListener("submit", saveUser);

// 🔹 Load page
document.addEventListener("DOMContentLoaded", loadUser);
