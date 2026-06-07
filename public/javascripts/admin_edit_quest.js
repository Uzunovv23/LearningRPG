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
          <div class="card mb-5 quiz-section rpg-card shadow new-quiz">
              <div class="card-header rpg-card-header d-flex justify-content-between align-items-center">
                  <h5 class="mb-0"><i class="fas fa-magic me-2"></i>НОВ Раздел (Ще бъде добавен)</h5>
                  <button type="button" class="btn rpg-btn rpg-btn-delete btn-sm remove-btn">
                      <i class="fas fa-times me-1"></i>Премахни
                  </button>
              </div>
              <div class="card-body">
                  <div class="row">
                      <div class="col-md-8">
                          <div class="mb-3">
                              <label class="form-label rpg-label">Заглавие на раздела:</label>
                              <input type="text" class="form-control rpg-input quiz-title" placeholder="Име на теста...">
                          </div>
                      </div>
                      <div class="col-md-4">
                          <div class="mb-3">
                              <label class="form-label rpg-label">XP Награда:</label>
                              <div class="input-group">
                                  <span class="input-group-text rpg-input-group-text"><i class="fas fa-star text-warning"></i></span>
                                  <input type="number" class="form-control rpg-input quiz-xp" value="50" min="0">
                              </div>
                          </div>
                      </div>
                  </div>
                  <div class="questions-container"></div>
                  <button type="button" class="btn rpg-btn rpg-btn-edit btn-sm mt-3 add-question-btn">
                      <i class="fas fa-plus me-1"></i>Добави Въпрос
                  </button>
              </div>
          </div>`;
      quizzesContainer.insertAdjacentHTML("beforeend", html);
    });
  }

  quizzesContainer.addEventListener("click", async function (e) {
    if (e.target.closest(".remove-btn")) {
      e.target.closest(".card").remove();
    }

    if (e.target.closest(".delete-existing-quiz-btn")) {
      const btn = e.target.closest(".delete-existing-quiz-btn");
      const card = btn.closest(".card");
      const quizIdToDelete = card.getAttribute("data-id");

      const confirmed = confirm(
        "ВНИМАНИЕ! Сигурни ли сте, че искате да изтриете този раздел?\n\nТова ще изтрие всички въпроси в него и резултатите на учениците! Действието е необратимо.",
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

    if (e.target.closest(".add-question-btn")) {
      const btn = e.target.closest(".add-question-btn");
      const questionsContainer = btn.previousElementSibling;
      const qIndex = Date.now() + Math.random().toString(36).substr(2, 5);

      const questionHtml = `
              <div class="card mb-3 question-card rpg-card mt-3">
                  <div class="card-body">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                          <label class="form-label rpg-label text-warning mb-0"><i class="fas fa-question-circle me-1"></i>Въпрос:</label>
                          <button type="button" class="btn rpg-btn rpg-btn-delete btn-sm py-1 px-2 remove-btn" title="Изтрий въпроса">
                              <i class="fas fa-times"></i>
                          </button>
                      </div>
                      <input type="text" class="form-control rpg-input mb-3 q-text" placeholder="Текст на въпроса...">
                      <div class="row g-2 mb-3">
                          <div class="col-md-4">
                              <div class="input-group">
                                  <span class="input-group-text rpg-input-group-text"><i class="fas fa-bullseye text-info"></i></span>
                                  <input type="number" class="form-control rpg-input q-points" value="10" placeholder="Точки">
                              </div>
                          </div>
                      </div>
                      <label class="form-label rpg-label mt-2 small"><i class="fas fa-check-circle me-1 text-success"></i>Отговори (маркирай верния):</label>
                      <div class="answers-box">
                          ${[0, 1, 2, 3]
                            .map(
                              (i) => `
                              <div class="input-group mb-2">
                                  <div class="input-group-text rpg-input-group-text">
                                      <input class="form-check-input mt-0 rpg-radio q-correct" type="radio" name="correct_${qIndex}" value="${i}">
                                  </div>
                                  <input type="text" class="form-control rpg-input q-answer" placeholder="Отговор ${
                                    i + 1
                                  }">
                              </div>`,
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
