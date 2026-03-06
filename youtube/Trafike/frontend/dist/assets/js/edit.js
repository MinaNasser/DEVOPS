const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const API = `/api/users/${id}`;

const loader = document.getElementById("loader");
const form = document.getElementById("editUserForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");

// دالة لإعادة التوجيه لصفحة الأخطاء مع رسالة
function redirectToError(message) {
  window.location.href = `error.html?msg=${encodeURIComponent(message)}`;
}

// جلب بيانات المستخدم
async function loadUser() {
  loader.style.display = "block";
  form.style.display = "none";

  try {
    const res = await fetch(API);
    if (!res.ok) {
      throw new Error(
        res.status === 404 ? "User not found" : "Failed to load user",
      );
    }

    const u = await res.json();
    nameInput.value = u.name;
    emailInput.value = u.email;

    form.style.display = "flex";
  } catch (err) {
    console.error(err);
    redirectToError(err.message);
  } finally {
    loader.style.display = "none";
  }
}

// حفظ التعديلات
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
      window.location.href = "index.html";
    } else {
      const error = await res.json();
      throw new Error(error.error || "Failed to update user");
    }
  } catch (err) {
    console.error(err);
    redirectToError(err.message);
  }
}

form.addEventListener("submit", saveUser);
document.addEventListener("DOMContentLoaded", loadUser);
