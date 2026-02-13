document.addEventListener("DOMContentLoaded", () => {
  const jokerButtons = document.querySelectorAll(".btn-joker");

  jokerButtons.forEach((btn) => {
    btn.addEventListener("click", async function () {
      if (this.disabled || this.classList.contains("used")) return;

      const questionId = this.getAttribute("data-question-id");
      const btnElement = this;

      const originalText = btnElement.innerHTML;
      btnElement.disabled = true;
      btnElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

      try {
        const response = await fetch("/quests/use-joker", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId: questionId }),
        });

        const data = await response.json();

        if (data.success) {
          const allAnswerContainers = document.querySelectorAll(
            `#question-card-${questionId} div[id^='answer-container-']`,
          );

          allAnswerContainers.forEach((container) => {
            const answerId = parseInt(
              container.id.replace("answer-container-", ""),
            );

            if (!data.keepIds.includes(answerId)) {
              container.classList.add("answer-eliminated");
              const input = container.querySelector("input");
              if (input) {
                input.disabled = true;
                input.checked = false;
              }
            }
          });

          const badge = document.getElementById("globalJokerCount");
          if (badge) {
            badge.innerHTML = `<i class="fas fa-dice-d20 me-2"></i> Жокери: ${data.remainingJokers}`;

            if (data.remainingJokers === 0) {
              badge.classList.remove("bg-indigo");
              badge.classList.add("bg-secondary");
              badge.style.backgroundColor = "";
            }
          }

          btnElement.className = "btn btn-sm btn-secondary used";
          btnElement.innerHTML = "Използван";

          if (data.remainingJokers <= 0) {
            document.querySelectorAll(".btn-joker:not(.used)").forEach((b) => {
              b.disabled = true;
              b.title = "Нямаш повече жокери";
            });
          }
        } else {
          alert(data.message || "Грешка при използване на жокера.");
          btnElement.disabled = false;
          btnElement.innerHTML = originalText;
        }
      } catch (err) {
        console.error(err);
        alert("Възникна грешка със сървъра.");
        btnElement.disabled = false;
        btnElement.innerHTML = originalText;
      }
    });
  });
});
