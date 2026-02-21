const API = "/api/users/deleted";

const loader = document.getElementById("loader");
const tbody = document.querySelector("#deletedTable tbody");

async function fetchDeleted() {
  loader.style.display = "block";
  tbody.innerHTML = "";

  try {
    const res = await fetch(API);

    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

    const users = await res.json();

    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5">No deleted users found.</td></tr>`;
      return;
    }

    users.forEach((u) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.id}</td>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${new Date(u.deleted_at).toLocaleDateString()}</td>
        <td>
          <button class="restore-button" onclick="restoreUser(${u.id})">Restore</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error fetching deleted users:", err);
    window.location.href = "error.html";
    tbody.innerHTML = `<tr><td colspan="5">Failed to load deleted users.</td></tr>`;
  } finally {
    loader.style.display = "none";
  }
}

async function restoreUser(id) {
  if (!confirm("Restore this user?")) return;
  try {
    const res = await fetch(`/api/users/${id}/restore`, { method: "PUT" });
    if (res.ok) {
      fetchDeleted(); // تحديث الجدول بعد الاسترجاع
      window.location.href = "index.html"; // العودة إلى الصفحة الرئيسية
    } else {
      const error = await res.json();
      window.location.href = "error.html";
      alert(error.error || "Failed to restore user.");
    }
  } catch (err) {
    alert("Error restoring user.");
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", fetchDeleted);
