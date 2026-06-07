document.addEventListener("DOMContentLoaded", () => {
  const jokerButtons = document.querySelectorAll(".rpg-action-joker");

  jokerButtons.forEach((btn) => {
    btn.addEventListener("click", async function () {
      if (this.disabled || this.classList.contains("used")) return;

      const questionId = this.getAttribute("data-question-id");
      const btnElement = this;
      const originalHTML = btnElement.innerHTML;

      btnElement.disabled = true;
      btnElement.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i><span>...</span>';

      try {
        const response = await fetch("/quests/use-joker", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId }),
        });

        const data = await response.json();

        if (data.success) {
          const allWrappers = document.querySelectorAll(
            `#question-card-${questionId} div[id^='answer-container-']`,
          );

          allWrappers.forEach((wrapper) => {
            const answerId = parseInt(
              wrapper.id.replace("answer-container-", ""),
            );
            if (!data.keepIds.includes(answerId)) {
              wrapper.classList.add("answer-eliminated");
              const input = wrapper.querySelector(".rpg-answer-input");
              if (input) {
                input.disabled = true;
                input.checked = false;
              }
            }
          });

          const slot = document.getElementById("globalJokerCount");
          if (slot) {
            const countEl = slot.querySelector(".rpg-item-count");
            if (countEl) countEl.textContent = data.remainingJokers;
            if (data.remainingJokers === 0) {
              slot.classList.remove("rpg-item-joker");
              slot.classList.add("rpg-item-empty");
            }
          }

          btnElement.className = "rpg-action-btn rpg-action-disabled used";
          btnElement.innerHTML =
            '<i class="fas fa-check"></i><span>Използван</span>';

          if (data.remainingJokers <= 0) {
            document
              .querySelectorAll(".rpg-action-joker:not(.used)")
              .forEach((b) => {
                b.className = "rpg-action-btn rpg-action-disabled";
                b.disabled = true;
                b.title = "Нямаш повече жокери";
              });
          }
        } else {
          alert(data.message || "Грешка при използване на жокера.");
          btnElement.disabled = false;
          btnElement.innerHTML = originalHTML;
        }
      } catch (err) {
        console.error(err);
        alert("Възникна грешка със сървъра.");
        btnElement.disabled = false;
        btnElement.innerHTML = originalHTML;
      }
    });
  });
});
