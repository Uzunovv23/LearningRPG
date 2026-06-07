"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const quizCheckboxes = document.querySelectorAll(
    '#arenaForm input[name="quizIds"]',
  );

  quizCheckboxes.forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
      const box = this.closest(".arena-answer-box");
      if (!box) return;

      if (this.checked) {
        box.classList.add("selected");
      } else {
        box.classList.remove("selected");
      }
    });
  });

  const arenaForm = document.getElementById("arenaForm");
  if (arenaForm) {
    arenaForm.addEventListener("submit", function (e) {
      const checked = document.querySelectorAll(
        '#arenaForm input[name="quizIds"]:checked',
      );

      if (checked.length === 0) {
        e.preventDefault();
        alert("Моля, избери поне един тест за двубоя!");
        return;
      }

      const btn = document.getElementById("submitBtn");
      if (btn) {
        btn.innerHTML =
          '<i class="fas fa-spinner fa-spin me-2"></i> Търсене...';
        btn.disabled = true;
        btn.classList.add("disabled");
      }
    });
  }

  const declineForms = document.querySelectorAll(".decline-duel-form");
  declineForms.forEach(function (form) {
    form.addEventListener("submit", function (e) {
      if (!confirm("Сигурен ли си, че искаш да избягаш от битката?")) {
        e.preventDefault();
      }
    });
  });
});
