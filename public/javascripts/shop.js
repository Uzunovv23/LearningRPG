class ShopManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupAnimations();
  }

  setupEventListeners() {
    this.setupBuyButtons();

    this.setupTabNavigation();

    this.setupAlertDismissal();
  }

  setupBuyButtons() {
    const buyButtons = document.querySelectorAll(".btn-buy");

    buyButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        if (!button.disabled) {
          this.handlePurchase(button);
        }
      });

      button.addEventListener("mouseenter", () => {
        if (!button.disabled) {
          button.style.transform = "translateY(-3px)";
        }
      });

      button.addEventListener("mouseleave", () => {
        button.style.transform = "translateY(0)";
      });
    });
  }

  handlePurchase(button) {
    const loadingHTML = `
      <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      Обработване...
    `;

    button.innerHTML = loadingHTML;

    const form = button.closest("form");
    if (form) {
      form.submit();
    }

    button.disabled = true;
  }

  showPurchaseAnimation(button) {
    const card = button.closest(".shop-card");
    if (!card) return;

    card.style.animation = "none";
    setTimeout(() => {
      card.style.animation = "purchaseFlash 0.6s ease-out";
    }, 10);
  }

  setupTabNavigation() {
    const tabs = document.querySelectorAll('[data-bs-toggle="pill"]');

    tabs.forEach((tab) => {
      tab.addEventListener("shown.bs.tab", (e) => {
        const targetId = e.target.getAttribute("data-bs-target");
        const targetPane = document.querySelector(targetId);

        if (targetPane) {
          targetPane.style.animation = "fadeIn 0.3s ease-out";
        }
      });
    });
  }

  setupAlertDismissal() {
    const alerts = document.querySelectorAll(".alert");

    alerts.forEach((alert) => {
      const closeButton = alert.querySelector(".btn-close");
      if (closeButton) {
        closeButton.addEventListener("click", () => {
          alert.style.animation = "slideOutUp 0.3s ease-in forwards";
          setTimeout(() => alert.remove(), 300);
        });
      }

      if (alert.classList.contains("alert-success")) {
        setTimeout(() => {
          if (alert.parentElement) {
            alert.style.animation = "slideOutUp 0.3s ease-in forwards";
            setTimeout(() => alert.remove(), 300);
          }
        }, 5000);
      }
    });
  }

  setupAnimations() {
    this.observeElements();
    this.addCustomAnimations();
  }

  observeElements() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.animationPlayState = "running";
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      },
    );

    document.querySelectorAll(".shop-card").forEach((card) => {
      card.style.animationPlayState = "paused";
      observer.observe(card);
    });
  }

  addCustomAnimations() {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes purchaseFlash {
        0% {
          box-shadow: 0 20px 50px rgba(251, 191, 36, 0.2), 0 0 30px rgba(251, 191, 36, 0.1);
        }
        50% {
          box-shadow: 0 20px 50px rgba(16, 185, 129, 0.4), 0 0 30px rgba(16, 185, 129, 0.2);
        }
        100% {
          box-shadow: 0 20px 50px rgba(251, 191, 36, 0.2), 0 0 30px rgba(251, 191, 36, 0.1);
        }
      }

      @keyframes slideOutUp {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(-20px);
        }
      }
    `;
    document.head.appendChild(style);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ShopManager();
});

function formatCurrency(amount) {
  return new Intl.NumberFormat("bg-BG", {
    style: "currency",
    currency: "BGN",
  }).format(amount);
}

function checkBalanceAvailability() {
  const balanceElement = document.querySelector(".balance-amount");
  if (balanceElement) {
    const balance = parseInt(balanceElement.textContent.match(/\d+/)?.[0] || 0);
    return balance;
  }
  return 0;
}
