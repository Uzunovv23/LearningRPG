"use strict";

(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const initProgressBar = () => {
      const progressBar = document.querySelector(".rpg-progress-fill");
      if (!progressBar) return;

      const targetWidth =
        parseFloat(progressBar.getAttribute("aria-valuenow")) || 0;

      let currentWidth = 0;
      const frameCount = 50;
      let frame = 0;

      const animateProgress = () => {
        frame++;

        const easeProgress = 1 - Math.pow(1 - frame / frameCount, 3);
        currentWidth = Math.min(targetWidth * easeProgress, targetWidth);

        progressBar.style.width = `${currentWidth}%`;

        if (frame < frameCount) {
          requestAnimationFrame(animateProgress);
        }
      };

      requestAnimationFrame(animateProgress);
    };

    initProgressBar();

    const avatarButtons = document.querySelectorAll(".avatar-btn");

    if (avatarButtons.length > 0) {
      avatarButtons.forEach((button) => {
        button.addEventListener("click", async function (e) {
          e.preventDefault();

          if (this.disabled) return;

          const selectedIcon = this.getAttribute("data-icon");
          const originalHTML = this.innerHTML;
          const originalContent = this.textContent;

          this.disabled = true;
          this.innerHTML = '<i class="fas fa-spinner fa-spin fa-2x"></i>';

          try {
            const response = await fetch("/users/my-hero/avatar", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({ avatarIcon: selectedIcon }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
              const avatarElement =
                document.getElementById("currentHeroAvatar");
              if (avatarElement) {
                avatarElement.style.transition =
                  "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)";
                avatarElement.style.opacity = "0";
                avatarElement.style.transform = "scale(0.5) rotateY(180deg)";

                setTimeout(() => {
                  avatarElement.className = `fas fa-6x text-rpg-gold ${selectedIcon}`;
                  avatarElement.style.opacity = "1";
                  avatarElement.style.transform = "scale(1) rotateY(0)";

                  document.querySelectorAll(".avatar-btn").forEach((btn) => {
                    btn.classList.remove("active", "border-3");
                    if (btn.classList.contains("border-warning")) {
                      btn.classList.add("border-warning");
                    }
                  });

                  this.classList.add("active", "border-3");

                  showNotification(
                    result.message || "Аватарът е обновен успешно!",
                    "success",
                  );

                  setTimeout(() => {
                    this.disabled = false;
                    this.innerHTML = originalHTML;
                  }, 600);
                }, 600);
              }
            } else {
              this.disabled = false;
              this.innerHTML = originalHTML;
              const errorMsg =
                result.message || "Възникна проблем при смяната на аватара.";
              showNotification(errorMsg, "error");
            }
          } catch (error) {
            console.error("Avatar Update Error:", error);
            this.disabled = false;
            this.innerHTML = originalHTML;
            showNotification(
              "Грешка при връзката със сървъра. Моля, опитайте отново.",
              "error",
            );
          }
        });
      });
    }

    const showNotification = (message, type = "info") => {
      const alertDiv = document.createElement("div");
      const typeClass =
        type === "error"
          ? "alert-danger"
          : type === "success"
            ? "alert-success"
            : "alert-info";

      alertDiv.className = `alert ${typeClass} alert-dismissible fade show position-fixed`;
      alertDiv.setAttribute("role", "alert");
      alertDiv.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        max-width: 400px;
        animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      `;

      const icon =
        type === "error"
          ? "fa-exclamation-circle"
          : type === "success"
            ? "fa-check-circle"
            : "fa-info-circle";

      alertDiv.innerHTML = `
        <i class="fas ${icon} me-2"></i>
        <span>${message}</span>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Затвори"></button>
      `;

      document.body.appendChild(alertDiv);

      const timeout = setTimeout(() => {
        alertDiv.classList.remove("show");
        setTimeout(() => alertDiv.remove(), 300);
      }, 5000);

      const closeBtn = alertDiv.querySelector(".btn-close");
      if (closeBtn) {
        closeBtn.addEventListener("click", () => {
          clearTimeout(timeout);
          alertDiv.classList.remove("show");
          setTimeout(() => alertDiv.remove(), 300);
        });
      }
    };

    const initTooltips = () => {
      const tooltipTriggerList = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="tooltip"]'),
      );
      tooltipTriggerList.map((tooltipTriggerEl) => {
        if (typeof bootstrap !== "undefined" && bootstrap.Tooltip) {
          new bootstrap.Tooltip(tooltipTriggerEl);
        }
      });
    };

    initTooltips();

    const inventoryCards = document.querySelectorAll(".inventory-item-card");
    inventoryCards.forEach((card) => {
      card.addEventListener("mouseenter", function () {
        this.style.zIndex = "5";
      });

      card.addEventListener("mouseleave", function () {
        this.style.zIndex = "auto";
      });

      const description = card.querySelector(".item-description");
      if (description) {
        card.title = description.textContent;
      }
    });

    const journalCards = document.querySelectorAll(".journal-entry-card");
    journalCards.forEach((card, index) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
      card.style.transition = "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)";

      setTimeout(() => {
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }, index * 100);
    });

    document.documentElement.style.scrollBehavior = "smooth";

    const interactiveElements = document.querySelectorAll(
      "button:not(:disabled), a, input:not(:disabled), select:not(:disabled), textarea:not(:disabled)",
    );

    interactiveElements.forEach((element) => {
      element.addEventListener("focus", function () {
        if (!this.classList.contains("btn-close")) {
          this.style.outline = "2px solid var(--rpg-blue)";
          this.style.outlineOffset = "2px";
        }
      });

      element.addEventListener("blur", function () {
        this.style.outline = "none";
      });

      if (
        element.tagName === "BUTTON" ||
        element.classList.contains("avatar-btn")
      ) {
        element.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this.click();
          }
        });
      }
    });

    const heroPanel = document.querySelector(".rpg-panel");
    if (heroPanel) {
      heroPanel.style.animation =
        "slideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)";
    }

    const cards = document.querySelectorAll(".card");
    cards.forEach((card, index) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
      card.style.transition = "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)";

      setTimeout(
        () => {
          card.style.opacity = "1";
          card.style.transform = "translateY(0)";
        },
        (index + 1) * 150,
      );
    });

    console.log("RPG Hero Interface loaded successfully!");
  });
})();
