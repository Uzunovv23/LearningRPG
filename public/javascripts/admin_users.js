document.addEventListener("DOMContentLoaded", function () {
  const editModal = document.getElementById("editUserModal");

  if (editModal) {
    editModal.addEventListener("show.bs.modal", function (event) {
      const button = event.relatedTarget;
      const id = button.getAttribute("data-id");
      const username = button.getAttribute("data-username");
      const email = button.getAttribute("data-email");

      document.getElementById("modalUsername").value = username;
      document.getElementById("modalEmail").value = email;

      const form = document.getElementById("editUserForm");
      form.action = `/admin/users/${id}/update`;
    });
  }

  document.querySelectorAll(".role-btn").forEach((btn) => {
    btn.addEventListener("click", async function () {
      if (this.disabled) return;

      const userId = this.getAttribute("data-id");
      const newRole = this.getAttribute("data-new-role");

      if (newRole === "user") {
        const adminRows = document.querySelectorAll(".rpg-badge-admin");
        if (adminRows.length <= 1) {
          alert("Не може да премахнете последния администратор!");
          return;
        }
      }

      const actionText =
        newRole === "admin" ? "администратор" : "обикновен потребител";

      if (
        !confirm(
          `Сигурни ли сте, че искате да промените ролята на този потребител на "${actionText}"?`,
        )
      )
        return;

      try {
        const res = await fetch(`/admin/users/${userId}/role`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newRole }),
        });

        const result = await res.json();

        if (result.success) {
          location.reload();
        } else {
          alert("Грешка: " + (result.message || "Неизвестна грешка"));
        }
      } catch (error) {
        console.error("Rolle change error:", error);
        alert("Сървърна грешка при промяна на ролята.");
      }
    });
  });

  document.querySelectorAll(".delete-user-btn").forEach((btn) => {
    btn.addEventListener("click", async function () {
      const userId = this.getAttribute("data-id");

      if (
        !confirm(
          "ВНИМАНИЕ! Това ще изтрие потребителя и всички негови резултати завинаги! Наистина ли искаш да продължиш?",
        )
      )
        return;

      try {
        const res = await fetch(`/admin/users/${userId}`, {
          method: "DELETE",
        });

        const result = await res.json();

        if (result.success) {
          const row = document.getElementById(`user-row-${userId}`);
          if (row) {
            row.style.animation = "fadeOut 0.3s ease-out forwards";
            setTimeout(() => row.remove(), 300);
          }
        } else {
          alert("Грешка: " + (result.message || "Неизвестна грешка"));
        }
      } catch (error) {
        console.error("Delete error:", error);
        alert("Сървърна грешка при изтриване на потребител.");
      }
    });
  });
});
