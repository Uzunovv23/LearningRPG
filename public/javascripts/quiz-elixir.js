document.addEventListener("DOMContentLoaded", () => {
  const elixirButtons = document.querySelectorAll(".rpg-action-elixir");

  elixirButtons.forEach((btn) => {
    btn.addEventListener("click", async function () {
      if (this.disabled || this.classList.contains("used")) return;

      const questionId = this.getAttribute("data-question-id");
      const btnElement = this;
      const originalHTML = btnElement.innerHTML;

      btnElement.disabled = true;
      btnElement.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i><span>...</span>';

      try {
        const response = await fetch("/quests/use-elixir", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId }),
        });

        const data = await response.json();

        if (data.success) {
          const correctInput = document.querySelector(
            `#question-card-${questionId} .rpg-answer-input[value="${data.correctAnswerId}"]`,
          );

          if (correctInput) {
            const wrapper = correctInput.closest(".rpg-answer-wrap");
            if (wrapper) wrapper.classList.add("answer-revealed");
            correctInput.checked = true;
            correctInput.disabled = false;

            const allInputs = document.querySelectorAll(
              `#question-card-${questionId} .rpg-answer-input`,
            );
            allInputs.forEach((input) => {
              if (input.value != data.correctAnswerId) {
                input.disabled = true;
                const wrap = input.closest(".rpg-answer-wrap");
                if (wrap) wrap.classList.add("answer-eliminated");
              }
            });
          }

          const slot = document.getElementById("globalElixirCount");
          if (slot) {
            const countEl = slot.querySelector(".rpg-item-count");
            if (countEl) countEl.textContent = data.remainingElixirs;
            if (data.remainingElixirs === 0) {
              slot.classList.remove("rpg-item-elixir");
              slot.classList.add("rpg-item-empty");
            }
          }

          btnElement.className = "rpg-action-btn rpg-action-disabled used";
          btnElement.innerHTML =
            '<i class="fas fa-eye"></i><span>Разкрит</span>';

          if (data.remainingElixirs <= 0) {
            document
              .querySelectorAll(".rpg-action-elixir:not(.used)")
              .forEach((b) => {
                b.className = "rpg-action-btn rpg-action-disabled";
                b.disabled = true;
                b.title = "Нямаш повече еликсири";
              });
          }
        } else {
          alert(data.message || "Грешка при използване на еликсира.");
          btnElement.disabled = false;
          btnElement.innerHTML = originalHTML;
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        alert("Възникна грешка със сървъра. Виж конзолата (F12).");
        btnElement.disabled = false;
        btnElement.innerHTML = originalHTML;
      }
    });
  });
});
