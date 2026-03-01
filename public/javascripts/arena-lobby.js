"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const arenaForm = document.getElementById("arenaForm");

  if (arenaForm) {
    arenaForm.addEventListener("submit", function (e) {
      const checkboxes = document.querySelectorAll(
        'input[name="quizIds"]:checked',
      );

      if (checkboxes.length === 0) {
        e.preventDefault(); 

        alert("Моля, избери поне един тест за двубоя!");
      }
    });
  }
});
