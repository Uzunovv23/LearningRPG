document.addEventListener("DOMContentLoaded", function () {
  const addBtn = document.getElementById("addQBtn");
  const container = document.getElementById("questionsContainer");

  addBtn.addEventListener("click", function () {
    const qIndex = document.querySelectorAll(".question-card").length;

    const html = `
        <div class="card mb-4 question-card">
            <div class="card-header bg-white d-flex justify-content-between align-items-center">
                <span>Въпрос #${qIndex + 1}</span>
                <button type="button" class="btn btn-outline-danger btn-sm remove-q-btn">Изтрий</button>
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <label class="form-label">Текст на въпроса:</label>
                    <input type="text" class="form-control q-text" placeholder="Напиши въпроса тук...">
                </div>
                <div class="mb-3">
                    <label class="form-label">Точки за верен отговор:</label>
                    <input type="number" class="form-control q-points" value="10">
                </div>
                
                <div class="answers-box">
                    <label class="form-label mb-2">Отговори (маркирай кръгчето на верния):</label>
                    ${[0, 1, 2, 3]
                      .map(
                        (i) => `
                        <div class="input-group mb-2">
                            <div class="input-group-text">
                                <input class="form-check-input mt-0 q-correct" type="radio" name="correct_${qIndex}" value="${i}">
                            </div>
                            <input type="text" class="form-control q-answer" placeholder="Отговор ${
                              i + 1
                            }">
                        </div>
                    `
                      )
                      .join("")}
                </div>
            </div>
        </div>
        `;

    container.insertAdjacentHTML("beforeend", html);
  });

  container.addEventListener("click", function (e) {
    if (e.target.classList.contains("remove-q-btn")) {
      e.target.closest(".question-card").remove();
    }
  });

  document
    .getElementById("saveBtn")
    .addEventListener("click", async function () {
      // Валидация
      const title = document.getElementById("title").value;
      if (!title) return alert("Моля, въведете заглавие на куеста!");

      const data = {
        title: title,
        description: document.getElementById("desc").value,
        xpReward: document.getElementById("xp").value,
        quizzes: [],
      };

      const cards = document.querySelectorAll(".question-card");

      if (cards.length === 0) return alert("Моля, добавете поне един въпрос!");

      cards.forEach((card) => {
        const questionText = card.querySelector(".q-text").value;
        const points = card.querySelector(".q-points").value;

        const answers = [];
        const answerInputs = card.querySelectorAll(".q-answer");
        const correctRadios = card.querySelectorAll(".q-correct");

        answerInputs.forEach((input, i) => {
          if (input.value.trim() !== "") {
            answers.push({
              answer: input.value,
              isCorrect: correctRadios[i].checked,
            });
          }
        });

        if (questionText) {
          data.quizzes.push({
            question: questionText,
            points: points,
            QuizAnswers: answers,
          });
        }
      });

      try {
        const response = await fetch("/admin/create-quest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (result.success) {
          alert("Успех! Куестът е създаден.");
          window.location.href = "/";
        } else {
          alert("Грешка: " + result.message);
        }
      } catch (err) {
        console.error(err);
        alert("Възникна грешка при връзката.");
      }
    });
});
