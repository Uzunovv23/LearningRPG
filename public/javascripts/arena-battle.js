"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const answerInputs = document.querySelectorAll(
    "#battleForm .arena-form-check-input",
  );

  answerInputs.forEach(function (input) {
    input.addEventListener("change", function () {
      const siblings = document.querySelectorAll(
        '#battleForm input[name="' + this.name + '"]',
      );
      siblings.forEach(function (sibling) {
        const box = sibling.closest(".arena-answer-box");
        if (box) box.classList.remove("selected");
      });

      if (this.checked) {
        const box = this.closest(".arena-answer-box");
        if (box) box.classList.add("selected");
      }
    });
  });

  const battleForm = document.getElementById("battleForm");
  if (battleForm) {
    battleForm.addEventListener("submit", function (e) {
      const allRadios = battleForm.querySelectorAll(
        'input[type="radio"]:not([name="duelId"])',
      );
      const questionNames = new Set();
      allRadios.forEach(function (r) {
        questionNames.add(r.name);
      });

      let unanswered = 0;
      questionNames.forEach(function (name) {
        const answered = battleForm.querySelector(
          'input[name="' + name + '"]:checked',
        );
        if (!answered) unanswered++;
      });

      if (unanswered > 0) {
        e.preventDefault();
        alert(
          "Имаш " +
            unanswered +
            " неотговорен" +
            (unanswered === 1 ? " въпрос" : " въпроса") +
            "! Отговори на всички преди да нанесеш удар.",
        );
        return;
      }

      if (
        !confirm("Готов ли си да предадеш отговорите си и да нанесеш удар?")
      ) {
        e.preventDefault();
        return;
      }

      const btn = document.getElementById("submitBattleBtn");
      if (btn) {
        btn.innerHTML =
          '<i class="fas fa-spinner fa-spin me-2"></i> Нанасяне на удар...';
        btn.disabled = true;
        btn.classList.add("disabled");
      }
    });
  }
});
