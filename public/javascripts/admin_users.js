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
      const userId = this.getAttribute("data-id");
      const newRole = this.getAttribute("data-new-role");

      if (
        !confirm(
          `Сигурни ли сте, че искате да промените ролята на този потребител на "${newRole}"?`
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
          alert("Грешка: " + result.message);
        }
      } catch (e) {
        console.error(e);
        alert("Сървърна грешка.");
      }
    });
  });

  document.querySelectorAll(".delete-user-btn").forEach((btn) => {
    btn.addEventListener("click", async function () {
      const userId = this.getAttribute("data-id");

      if (
        !confirm(
          "ВНИМАНИЕ! Това ще изтрие потребителя и всички негови резултати завинаги! Продължи?"
        )
      )
        return;

      try {
        const res = await fetch(`/admin/users/${userId}`, {
          method: "DELETE",
        });
        const result = await res.json();

        if (result.success) {
          document.getElementById(`user-row-${userId}`).remove();
        } else {
          alert("Грешка: " + result.message);
        }
      } catch (e) {
        console.error(e);
        alert("Сървърна грешка.");
      }
    });
  });
});
