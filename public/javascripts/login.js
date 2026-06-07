document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const inputs = document.querySelectorAll(".input-custom");
  const submitBtn = document.querySelector(".btn-login");

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const showPasswordCheckbox = document.getElementById("showPassword");

  showPasswordCheckbox.addEventListener("change", () => {
    const type = showPasswordCheckbox.checked ? "text" : "password";
    passwordInput.type = type;
  });

  inputs.forEach((input) => {
    input.addEventListener("focus", () => {
      input.parentElement.parentElement.classList.add("input-focused");
    });

    input.addEventListener("blur", () => {
      if (!input.value) {
        input.parentElement.parentElement.classList.remove("input-focused");
      }
    });

    input.addEventListener("input", () => {
      validateField(input);
    });
  });

  form.addEventListener("submit", (e) => {
    if (!validateForm()) {
      e.preventDefault();
      return;
    }
  });

  submitBtn.addEventListener("mouseenter", () => {
    submitBtn.style.animation = "pulse 0.6s ease-in-out";
  });

  submitBtn.addEventListener("mouseleave", () => {
    submitBtn.style.animation = "none";
  });

  function validateField(input) {
    const fieldGroup = input.parentElement.parentElement;
    const value = input.value.trim();
    let isValid = true;

    if (input.id === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
      }
    }

    if (input.id === "password") {
      if (value.length < 6) {
        isValid = false;
      }
    }

    if (isValid && value.length > 0) {
      fieldGroup.classList.add("input-valid");
      fieldGroup.classList.remove("input-invalid");
    } else if (value.length > 0) {
      fieldGroup.classList.add("input-invalid");
      fieldGroup.classList.remove("input-valid");
    } else {
      fieldGroup.classList.remove("input-valid", "input-invalid");
    }
  }

  function validateForm() {
    let allValid = true;

    inputs.forEach((input) => {
      validateField(input);
      const fieldGroup = input.parentElement.parentElement;
      if (fieldGroup.classList.contains("input-invalid")) {
        allValid = false;
      }
    });

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      allValid = false;
    }

    return allValid;
  }
});
