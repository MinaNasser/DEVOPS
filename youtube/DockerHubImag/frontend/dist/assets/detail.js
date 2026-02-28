// backend/frontend/assets/detail.js

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const API = `http://localhost:3001/api/users/${id}`;
console.log("API endpoint:", API);
const loader = document.getElementById("loader");
const userDetail = document.getElementById("userDetail");

// 🔹 دالة لإعادة التوجيه لصفحة الأخطاء مع رسالة
function redirectToError(message) {
  window.location.href = `error.html?msg=${encodeURIComponent(message)}`;
}

// 🔹 جلب تفاصيل المستخدم
async function loadDetail() {
  if (!loader || !userDetail) return;

  loader.style.display = "block"; // أظهر Loader
  userDetail.innerHTML = "";

  if (!id) {
    redirectToError("User ID not provided in URL");
    return;
  }

  try {
    const res = await fetch(API);

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "User not found" }));
      throw new Error(error.error || "User not found");
    }

    const u = await res.json();

    userDetail.innerHTML = `
      <p><strong>ID:</strong> ${u.id}</p>
      <p><strong>Name:</strong> ${u.name}</p>
      <p><strong>Email:</strong> ${u.email}</p>
      <p><strong>Created At:</strong> ${u.created_at ? new Date(u.created_at).toLocaleDateString() : "-"}</p>
      <p><strong>Deleted At:</strong> ${u.deleted_at ? new Date(u.deleted_at).toLocaleDateString() : "-"}</p>
      <p><strong>Deleted:</strong> ${u.isDeleted ? "Yes" : "No"}</p>
    `;
  } catch (err) {
    console.error(err);
    redirectToError(err.message);
  } finally {
    loader.style.display = "none"; // أخفي Loader
  }
}

document.addEventListener("DOMContentLoaded", loadDetail);
