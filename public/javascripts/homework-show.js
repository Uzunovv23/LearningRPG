document.addEventListener("DOMContentLoaded", () => {
  const deleteForms = document.querySelectorAll(".delete-file-form");
  deleteForms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      if (
        !confirm(
          "Внимание! Сигурни ли сте, че искате да изтриете този файл? Действието не може да бъде отменено.",
        )
      ) {
        e.preventDefault();
      }
    });
  });

  const submitForms = document.querySelectorAll(".submission-form");
  submitForms.forEach((form) => {
    form.addEventListener("submit", function () {
      const submitBtn = this.querySelector("button[type='submit']");
      if (submitBtn) {
        const originalText = submitBtn.innerText;
        submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i> Предава се...`;
        submitBtn.classList.add("rpg-btn-disabled");
      }
    });
  });
});
