document.addEventListener("DOMContentLoaded", function () {
  const quizzesContainer = document.getElementById("quizzesContainer");
  const questIdInput = document.getElementById("questId");
  const questId = questIdInput ? questIdInput.value : null;

  let quizCounter = document.querySelectorAll(".quiz-section").length;

  const addQuizBtn = document.getElementById("addQuizBtn");
  if (addQuizBtn) {
    addQuizBtn.addEventListener("click", function () {
      quizCounter++;
      const html = `
          <div class="card mb-5 quiz-section border-success shadow new-quiz">
              <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
                  <h5 class="mb-0">НОВ Раздел (Ще бъде добавен)</h5>
                  <button type="button" class="btn btn-danger btn-sm remove-btn">X</button>
              </div>
              <div class="card-body bg-light">
                  <div class="row">
                      <div class="col-md-8">
                          <div class="mb-3">
                              <label class="form-label fw-bold">Заглавие:</label>
                              <input type="text" class="form-control quiz-title" placeholder="Име на теста...">
                          </div>
                      </div>
                      <div class="col-md-4">
                          <div class="mb-3">
                              <label class="form-label fw-bold">XP Награда:</label>
                              <input type="number" class="form-control quiz-xp" value="50" min="0">
                          </div>
                      </div>
                  </div>
                  <div class="questions-container ms-3 border-start border-3 border-success ps-3"></div>
                  <button type="button" class="btn btn-outline-success btn-sm mt-3 add-question-btn">
                      + Добави Въпрос
                  </button>
              </div>
          </div>`;
      quizzesContainer.insertAdjacentHTML("beforeend", html);
    });
  }

  quizzesContainer.addEventListener("click", async function (e) {
    if (e.target.classList.contains("remove-btn")) {
      e.target.closest(".card").remove();
    }

    if (e.target.closest(".delete-existing-quiz-btn")) {
      const btn = e.target.closest(".delete-existing-quiz-btn");
      const card = btn.closest(".card");
      const quizIdToDelete = card.getAttribute("data-id");

      const confirmed = confirm(
        "ВНИМАНИЕ! Сигурни ли сте, че искате да изтриете този раздел?\n\nТова ще изтрие всички въпроси в него и резултатите на учениците! Действието е необратимо."
      );

      if (confirmed) {
        try {
          const res = await fetch(`/admin/quizzes/${quizIdToDelete}`, {
            method: "DELETE",
          });
          const result = await res.json();
          if (result.success) {
            card.remove();
            alert("Разделът беше изтрит успешно.");
          } else {
            alert("Грешка: " + result.message);
          }
        } catch (err) {
          console.error(err);
          alert("Грешка при свързване.");
        }
      }
    }

    if (e.target.classList.contains("add-question-btn")) {
      const questionsContainer = e.target.previousElementSibling;
      const qIndex = Date.now() + Math.random().toString(36).substr(2, 5);

      const questionHtml = `
              <div class="card mb-3 question-card mt-3">
                  <div class="card-body">
                      <div class="d-flex justify-content-between">
                          <label class="form-label fw-bold">Въпрос:</label>
                          <button type="button" class="btn btn-outline-danger btn-sm remove-btn">X</button>
                      </div>
                      <input type="text" class="form-control mb-2 q-text" placeholder="Текст на въпроса...">
                      <div class="row g-2">
                          <div class="col-md-3"><input type="number" class="form-control q-points" value="10"></div>
                      </div>
                      <label class="form-label mt-2 small text-muted">Отговори:</label>
                      <div class="answers-box">
                          ${[0, 1, 2, 3]
                            .map(
                              (i) => `
                              <div class="input-group mb-1">
                                  <div class="input-group-text">
                                      <input class="form-check-input mt-0 q-correct" type="radio" name="correct_${qIndex}" value="${i}">
                                  </div>
                                  <input type="text" class="form-control q-answer" placeholder="Отговор ${
                                    i + 1
                                  }">
                              </div>`
                            )
                            .join("")}
                      </div>
                  </div>
              </div>`;
      questionsContainer.insertAdjacentHTML("beforeend", questionHtml);
    }
  });

  document
    .getElementById("saveQuestBtn")
    .addEventListener("click", async function () {
      const title = document.getElementById("questTitle").value;
      const quizzesData = [];
      let calculatedTotalXP = 0;

      document.querySelectorAll(".quiz-section").forEach((quizCard) => {
        const existingId = quizCard.getAttribute("data-id");
        const isLocked = quizCard.classList.contains("locked-quiz");

        const quizTitle = quizCard.querySelector(".quiz-title").value;
        const xpInput = quizCard.querySelector(".quiz-xp");
        const quizXP = xpInput ? parseInt(xpInput.value) || 0 : 0;
        calculatedTotalXP += quizXP;

        const quizQuestions = [];

        if (!existingId || (existingId && !isLocked)) {
          quizCard.querySelectorAll(".question-card").forEach((qCard) => {
            const qText = qCard.querySelector(".q-text").value;
            const qPoints = qCard.querySelector(".q-points").value;
            const answers = [];
            const answerInputs = qCard.querySelectorAll(".q-answer");
            const radioInputs = qCard.querySelectorAll(".q-correct");

            answerInputs.forEach((inp, idx) => {
              if (inp.value.trim() !== "") {
                answers.push({
                  text: inp.value,
                  isCorrect: radioInputs[idx].checked,
                });
              }
            });

            if (qText) {
              quizQuestions.push({
                text: qText,
                points: qPoints,
                Answers: answers,
              });
            }
          });
        }

        if (quizTitle) {
          const quizObj = {
            title: quizTitle,
            xpReward: quizXP,
            Questions: quizQuestions,
          };
          if (existingId) quizObj.id = existingId;
          quizzesData.push(quizObj);
        }
      });

      const data = {
        title: title,
        description: document.getElementById("questDesc").value,
        xpReward: calculatedTotalXP,
        quizzes: quizzesData,
      };

      try {
        const res = await fetch(`/admin/quests/${questId}/edit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await res.json();

        if (result.success) {
          alert("Промените са запазени успешно!");
          window.location.href = "/quests";
        } else {
          alert("Грешка: " + result.message);
        }
      } catch (e) {
        console.error(e);
        alert("Сървърна грешка");
      }
    });
});
