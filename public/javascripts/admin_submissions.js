document.addEventListener("DOMContentLoaded", function () {
  const gradeButtons = document.querySelectorAll(".grade-btn");

  gradeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const submissionId = this.getAttribute("data-id");
      const currentGrade = this.getAttribute("data-grade");
      const currentFeedback = this.getAttribute("data-feedback");

      const form = document.getElementById("gradeForm");
      form.action = `/admin/submission/${submissionId}/grade`;

      const select = document.getElementById("gradeSelect");
      select.value = currentGrade || "";

      const textarea = document.getElementById("feedbackText");
      textarea.value = currentFeedback || "";

      const modalElement = document.getElementById("gradeModal");
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    });
  });
});
