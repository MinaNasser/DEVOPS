const API_BASE = "/api";
const API = `${API_BASE}/users/deleted`;

const loader = document.getElementById("loader");
const tbody = document.querySelector("#deletedTable tbody");

// دالة مركزية لإعادة التوجيه لصفحة الأخطاء مع رسالة
function redirectToError(message) {
  window.location.href = `error.html?msg=${encodeURIComponent(message)}`;
}

async function fetchDeleted() {
  if (!loader || !tbody) return;

  loader.style.display = "block";
  tbody.innerHTML = "";

  try {
    const res = await fetch(API);

    if (!res.ok) {
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const error = await res.json();
        redirectToError(error.error || `HTTP error! Status: ${res.status}`);
      } else {
        const text = await res.text();
        redirectToError(
          `Server returned HTML instead of JSON: ${text.substring(0, 50)}...`,
        );
      }
      return;
    }

    const users = await res.json();

    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No deleted users found.</td></tr>`;
      return;
    }

    users.forEach((u) => {
      const tr = document.createElement("tr");
      const deletedDate = u.deleted_at
        ? new Date(u.deleted_at).toLocaleDateString()
        : "Unknown";

      tr.innerHTML = `
        <td>${u.id}</td>
        <td>${escapeHtml(u.name)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td>${deletedDate}</td>
        <td>
          <button class="restore-button" onclick="restoreUser(${u.id})">Restore</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Error fetching deleted users:", err);
    redirectToError("Failed to load deleted users: " + err.message);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Failed to load deleted users.</td></tr>`;
  } finally {
    loader.style.display = "none";
  }
}

// دالة للحماية من XSS
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

async function restoreUser(id) {
  if (!confirm("Restore this user?")) return;
  try {
    const res = await fetch(`${API_BASE}/users/${id}/restore`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      await fetchDeleted();
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    } else {
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const error = await res.json();
        redirectToError(error.error || "Failed to restore user.");
      } else {
        const text = await res.text();
        redirectToError(`Server returned: ${text.substring(0, 50)}...`);
      }
    }
  } catch (err) {
    console.error(err);
    redirectToError("Error restoring user: " + err.message);
  }
}

document.addEventListener("DOMContentLoaded", fetchDeleted);

// // 🔹 Event Listener
// const restoreButton = document.querySelector(".restore-button");
// if (restoreButton) {
//   restoreButton.addEventListener("click", restoreUser);
// }
