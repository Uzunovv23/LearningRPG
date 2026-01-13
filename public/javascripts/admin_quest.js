document.addEventListener("DOMContentLoaded", function () {
  const quizzesContainer = document.getElementById("quizzesContainer");
  let quizCounter = 0;

  document.getElementById("addQuizBtn").addEventListener("click", function () {
    quizCounter++;
    const quizId = quizCounter;

    const html = `
        <div class="card mb-5 quiz-section border-dark shadow">
            <div class="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Раздел #${quizId}</h5>
                <button type="button" class="btn btn-danger btn-sm remove-btn">Изтрий раздел</button>
            </div>
            <div class="card-body bg-light">
                
                <div class="row">
                    <div class="col-md-8">
                        <div class="mb-3">
                            <label class="form-label fw-bold">Заглавие на раздела (напр. "Събиране"):</label>
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

                <div class="questions-container ms-3 border-start border-3 border-primary ps-3"></div>

                <button type="button" class="btn btn-outline-primary btn-sm mt-3 add-question-btn">
                    + Добави Въпрос към този раздел
                </button>
            </div>
        </div>`;

    quizzesContainer.insertAdjacentHTML("beforeend", html);
  });

  quizzesContainer.addEventListener("click", function (e) {
    if (e.target.classList.contains("remove-btn")) {
      e.target.closest(".card").remove();
    }

    if (e.target.classList.contains("add-question-btn")) {
      const questionsContainer = e.target.previousElementSibling;
      const qIndex = Date.now();

      const questionHtml = `
            <div class="card mb-3 question-card mt-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between">
                        <label class="form-label fw-bold text-primary">Въпрос:</label>
                        <button type="button" class="btn btn-outline-danger btn-sm remove-btn">X</button>
                    </div>
                    <input type="text" class="form-control mb-2 q-text" placeholder="Текст на въпроса...">
                    
                    <div class="row g-2">
                        <div class="col-md-3"><input type="number" class="form-control q-points" value="10" placeholder="Точки"></div>
                    </div>

                    <label class="form-label mt-2 small text-muted">Отговори (маркирай верния):</label>
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
                            </div>
                        `
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
      if (!title) return alert("Моля, въведете заглавие на куеста!");

      const quizzesData = [];
      let calculatedTotalXP = 0;

      document.querySelectorAll(".quiz-section").forEach((quizCard) => {
        const quizTitle = quizCard.querySelector(".quiz-title").value;
        
        const xpInput = quizCard.querySelector(".quiz-xp");
        const quizXP = xpInput ? (parseInt(xpInput.value) || 0) : 0;
        
        calculatedTotalXP += quizXP;

        const quizQuestions = [];

        quizCard.querySelectorAll(".question-card").forEach((qCard) => {
          const qText = qCard.querySelector(".q-text").value;
          const qPoints = qCard.querySelector(".q-points").value;
          const answers = [];

          const answerInputs = qCard.querySelectorAll(".q-answer");
          const correctRadios = qCard.querySelectorAll(".q-correct");

          answerInputs.forEach((inp, idx) => {
            if (inp.value.trim() !== "") {
              answers.push({
                text: inp.value,
                isCorrect: correctRadios[idx].checked,
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

        if (quizTitle) {
          quizzesData.push({
            title: quizTitle,
            xpReward: quizXP,
            Questions: quizQuestions,
          });
        }
      });

      const data = {
        title: title,
        description: document.getElementById("questDesc").value,
        xpReward: calculatedTotalXP, 
        quizzes: quizzesData,
      };

      try {
        const res = await fetch("/admin/create-quest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await res.json();

        if (result.success) {
          alert("Успех! Куестът е създаден.");
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