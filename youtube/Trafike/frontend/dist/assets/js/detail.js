const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const API = `/api/users/${id}`;

const loader = document.getElementById("loader");
const userDetail = document.getElementById("userDetail");

// دالة لإعادة التوجيه لصفحة الأخطاء مع رسالة
function redirectToError(message) {
  window.location.href = `error.html?msg=${encodeURIComponent(message)}`;
}

async function loadDetail() {
  loader.style.display = "block"; // أظهر Loader
  userDetail.innerHTML = "";

  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error("User not found");

    const u = await res.json();

    userDetail.innerHTML = `
      <p><strong>ID:</strong> ${u.id}</p>
      <p><strong>Name:</strong> ${u.name}</p>
      <p><strong>Email:</strong> ${u.email}</p>
      <p><strong>Created At:</strong> ${new Date(u.created_at).toLocaleDateString()}</p>
    `;
  } catch (err) {
    console.error(err);
    redirectToError(err.message);
  } finally {
    loader.style.display = "none"; // أخفي Loader
  }
}

document.addEventListener("DOMContentLoaded", loadDetail);
