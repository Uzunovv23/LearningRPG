document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const inputs = document.querySelectorAll(".input-custom");
  const submitBtn = document.querySelector(".btn-register");

  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const showPasswordCheckbox = document.getElementById("showPassword");

  const strengthFill = document.getElementById("strengthFill");
  const reqLength = document.getElementById("reqLength");
  const reqLower = document.getElementById("reqLower");
  const reqUpper = document.getElementById("reqUpper");
  const reqNumber = document.getElementById("reqNumber");
  const reqSpecial = document.getElementById("reqSpecial");
  const passwordMatchHint = document.getElementById("passwordMatchHint");

  function checkPasswordStrength(password) {
    const requirements = {
      length: password.length >= 6,
      lower: /[a-z]/.test(password),
      upper: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'`~]/.test(password),
    };

    updateRequirement(reqLength, requirements.length);
    updateRequirement(reqLower, requirements.lower);
    updateRequirement(reqUpper, requirements.upper);
    updateRequirement(reqNumber, requirements.number);
    updateRequirement(reqSpecial, requirements.special);

    const metRequirements = Object.values(requirements).filter(Boolean).length;
    updateStrengthBar(metRequirements);

    return requirements;
  }

  function updateRequirement(element, isMet) {
    if (isMet) {
      element.classList.add("met");
    } else {
      element.classList.remove("met");
    }
  }

  function updateStrengthBar(metCount) {
    strengthFill.className = "strength-fill";

    if (metCount === 0) {
      strengthFill.style.width = "0%";
    } else if (metCount === 1) {
      strengthFill.classList.add("weak");
    } else if (metCount === 2) {
      strengthFill.classList.add("fair");
    } else if (metCount === 3) {
      strengthFill.classList.add("good");
    } else if (metCount >= 4) {
      strengthFill.classList.add("strong");
    }
  }

  showPasswordCheckbox.addEventListener("change", () => {
    const type = showPasswordCheckbox.checked ? "text" : "password";
    passwordInput.type = type;
    confirmPasswordInput.type = type;
  });

  passwordInput.addEventListener("input", () => {
    checkPasswordStrength(passwordInput.value);
    validateField(passwordInput);
    checkPasswordMatch();
  });

  confirmPasswordInput.addEventListener("input", () => {
    checkPasswordMatch();
  });

  function checkPasswordMatch() {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const fieldGroup = confirmPasswordInput.parentElement.parentElement;

    if (confirmPassword.length > 0) {
      if (password === confirmPassword && password.length > 0) {
        fieldGroup.classList.add("input-valid");
        fieldGroup.classList.remove("input-invalid");
        passwordMatchHint.textContent = "Паролите съвпадат";
        passwordMatchHint.style.color = "var(--rpg-green)";
      } else {
        fieldGroup.classList.add("input-invalid");
        fieldGroup.classList.remove("input-valid");
        passwordMatchHint.textContent = "Паролите не съвпадат";
        passwordMatchHint.style.color = "var(--rpg-red)";
      }
    } else {
      fieldGroup.classList.remove("input-valid", "input-invalid");
      passwordMatchHint.textContent = "Паролите трябва да съвпадат";
      passwordMatchHint.style.color = "#64748b";
    }
  }

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

    const password = passwordInput.value;
    const requirements = checkPasswordStrength(password);
    const allRequirementsMet = Object.values(requirements).every(Boolean);

    if (!allRequirementsMet) {
      e.preventDefault();
      passwordInput.parentElement.parentElement.classList.add("input-invalid");
      passwordInput.focus();
      return;
    }

    if (password !== confirmPasswordInput.value) {
      e.preventDefault();
      confirmPasswordInput.parentElement.parentElement.classList.add(
        "input-invalid",
      );
      confirmPasswordInput.focus();
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

    if (input.id === "username") {
      if (value.length < 6) {
        isValid = false;
      } else if (value.length > 20) {
        isValid = false;
      } else if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
        isValid = false;
      }
    }

    if (input.id === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
      }
    }

    if (input.id === "password") {
      const requirements = {
        length: value.length >= 6,
        lower: /[a-z]/.test(value),
        upper: /[A-Z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;'`~]/.test(value),
      };
      isValid = Object.values(requirements).every(Boolean);
    }

    if (input.id === "confirmPassword") {
      if (value.length === 0) {
        fieldGroup.classList.remove("input-valid", "input-invalid");
        return;
      }
    }

    if (isValid && value.length > 0) {
      fieldGroup.classList.add("input-valid");
      fieldGroup.classList.remove("input-invalid");
    } else if (value.length > 0) {
      fieldGroup.classList.add("input-invalid");
      fieldGroup.classList.remove("input-valid");
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

    const username = usernameInput.value.trim();
    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!username || !email || !password || !confirmPassword) {
      allValid = false;
    }

    return allValid;
  }
});
