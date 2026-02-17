document.addEventListener("DOMContentLoaded", () => {
  const chronoButtons = document.querySelectorAll(".btn-chrono");

  chronoButtons.forEach((btn) => {
    btn.addEventListener("click", async function (e) {
      e.preventDefault();

      const confirmed = confirm(
        "⏳ Искаш ли да използваш Пясъчен часовник?\n\nТова ще удължи крайния срок на това домашно с 24 часа. Предметът ще бъде изразходван.",
      );

      if (!confirmed) return;

      const homeworkId = this.getAttribute("data-homework-id");
      const btnElement = this;
      const originalText = btnElement.innerHTML;

      btnElement.disabled = true;
      btnElement.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Обработка...';

      try {
        const response = await fetch("/users/homework/use-chrono", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ homeworkId: homeworkId }),
        });

        const data = await response.json();

        if (data.success) {
          alert(`✅ Успех!\n${data.message}`);

          location.reload();
        } else {
          alert(`❌ Грешка: ${data.message}`);
          btnElement.disabled = false;
          btnElement.innerHTML = originalText;
        }
      } catch (err) {
        console.error("Chrono Error:", err);
        alert("Възникна грешка при връзката със сървъра.");
        btnElement.disabled = false;
        btnElement.innerHTML = originalText;
      }
    });
  });
});
