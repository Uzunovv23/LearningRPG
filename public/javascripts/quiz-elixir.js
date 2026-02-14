document.addEventListener("DOMContentLoaded", () => {
  const elixirButtons = document.querySelectorAll(".btn-elixir");

  elixirButtons.forEach((btn) => {
    btn.addEventListener("click", async function () {
      if (this.disabled || this.classList.contains("used")) return;

      const questionId = this.getAttribute("data-question-id");
      const btnElement = this;
      const originalText = btnElement.innerHTML;

      btnElement.disabled = true;
      btnElement.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

      try {
        const response = await fetch("/quests/use-elixir", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId: questionId }),
        });

        const data = await response.json();

        if (data.success) {
          const correctInput = document.querySelector(
            `#question-card-${questionId} input[value="${data.correctAnswerId}"]`,
          );

          if (correctInput) {
            const box = correctInput.closest(".answer-box");

            if (box) {
              box.classList.add("answer-revealed");

              box.classList.remove("bg-white");

              correctInput.checked = true;
              correctInput.disabled = false;
            } else {
              console.error("Не намерих .answer-box елемента!");
            }

            const allInputs = document.querySelectorAll(
              `#question-card-${questionId} input[name^="answers"]`,
            );
            allInputs.forEach((input) => {
              if (input.value != data.correctAnswerId) {
                input.disabled = true;
                const parentBox = input.closest(".answer-box");
                if (parentBox) parentBox.style.opacity = "0.5";
              }
            });
          } else {
            console.error(
              `Не намерих input с value=${data.correctAnswerId} в карта #question-card-${questionId}`,
            );
            alert("Грешка: Не можах да намеря верния отговор в HTML-а.");
          }

          const badge = document.getElementById("globalElixirCount");
          if (badge) {
            badge.innerHTML = `<i class="fas fa-flask me-2"></i> Еликсири: ${data.remainingElixirs}`;
            if (data.remainingElixirs === 0) {
              badge.style.backgroundColor = "#6c757d";
            }
          }

          btnElement.className = "btn btn-sm btn-secondary used";
          btnElement.innerHTML = "Разкрит";

          if (data.remainingElixirs <= 0) {
            document.querySelectorAll(".btn-elixir:not(.used)").forEach((b) => {
              b.disabled = true;
              b.title = "Нямаш повече еликсири";
            });
          }
        } else {
          alert(data.message || "Грешка при използване на еликсира.");
          btnElement.disabled = false;
          btnElement.innerHTML = originalText;
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        alert("Възникна грешка със сървъра. Виж конзолата (F12).");
        btnElement.disabled = false;
        btnElement.innerHTML = originalText;
      }
    });
  });
});
