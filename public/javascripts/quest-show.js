document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll(".rpg-quest-card, .rpg-hw-card")
    .forEach((card, i) => {
      card.style.animationDelay = `${0.05 + i * 0.07}s`;
    });

  document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".btn-chrono");
    if (!btn) return;

    e.preventDefault();

    const confirmed = confirm(
      "Искаш ли да използваш Пясъчен часовник?\n\nТова ще удължи крайния срок на това домашно с 24 часа. Предметът ще бъде изразходван.",
    );
    if (!confirmed) return;

    const homeworkId = btn.getAttribute("data-homework-id");
    const originalHTML = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Обработка...';

    try {
      const response = await fetch("/users/homework/use-chrono", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homeworkId }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Успех!\n${data.message}`);
        location.reload();
      } else {
        alert(`Грешка: ${data.message}`);
        btn.disabled = false;
        btn.innerHTML = originalHTML;
      }
    } catch (err) {
      console.error("Chrono error:", err);
      alert("Възникна грешка при връзката със сървъра.");
      btn.disabled = false;
      btn.innerHTML = originalHTML;
    }
  });

  const hero = document.querySelector(".rpg-hero");
  if (hero) {
    hero.addEventListener("mousemove", (e) => {
      const rect = hero.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      hero.style.transform = `perspective(1200px) rotateY(${dx * 3}deg) rotateX(${-dy * 2}deg)`;
    });
    hero.addEventListener("mouseleave", () => {
      hero.style.transform = "perspective(1200px) rotateY(0deg) rotateX(0deg)";
    });
    hero.style.transition = "transform 0.15s ease";
  }
});
