const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const API = `/api/users/${id}`;

const loader = document.getElementById("loader");
const form = document.getElementById("editUserForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");

// جلب بيانات المستخدم
async function loadUser() {
  loader.style.display = "block";
  form.style.display = "none";

  try {
    const res = await fetch(API);
    if (!res.ok) {
      if (res.status === 404) {
        alert("User not found");
        window.location.href = "error.html";
        return;
      }
    }
      

    const u = await res.json();
    nameInput.value = u.name;
    emailInput.value = u.email;

    form.style.display = "flex";
  } catch (err) {
    alert(err.message);
    window.location.href = "index.html";
  } finally {
    loader.style.display = "none";
  }
}

// حفظ التعديلات
async function saveUser(e) {
  e.preventDefault();
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();

  if (!name || !email) return alert("All fields are required");

  try {
    const res = await fetch(API, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    if (res.ok) {
      alert("User updated successfully!");
      window.location.href = "index.html";
    } else {
      const error = await res.json();
      alert(error.error || "Failed to update user");
    }
  } catch (err) {
    alert("Error updating user");
    console.error(err);
  }
}

form.addEventListener("submit", saveUser);
loadUser();
