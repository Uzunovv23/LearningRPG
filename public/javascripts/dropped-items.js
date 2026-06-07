document.addEventListener("DOMContentLoaded", () => {
  initializeItemCards();
  initializeScrollAnimations();
});

function initializeItemCards() {
  const itemCards = document.querySelectorAll(".item-card-wrapper");

  itemCards.forEach((cardWrapper, index) => {
    const card = cardWrapper.querySelector(".item-card");

    cardWrapper.style.animationDelay = `${index * 0.05}s`;
    cardWrapper.style.animation = "slideInUp 0.6s ease-out both";

    card.addEventListener("mouseenter", () => {
      handleCardEnter(card);
    });

    card.addEventListener("mouseleave", () => {
      handleCardLeave(card);
    });

    card.addEventListener("click", () => {
      handleCardClick(cardWrapper);
    });
  });
}

function handleCardEnter(card) {
  const iconWrapper = card.querySelector(".item-icon-wrapper");

  if (iconWrapper) {
    iconWrapper.style.animation = "floatIntense 0.4s ease-in-out infinite";
  }

  createParticles(card);
}

function handleCardLeave(card) {
  const iconWrapper = card.querySelector(".item-icon-wrapper");

  if (iconWrapper) {
    iconWrapper.style.animation = "float 3s ease-in-out infinite";
  }
}

function handleCardClick(cardWrapper) {
  const itemName =
    cardWrapper.querySelector(".item-name")?.textContent || "Item";
  const itemDescription =
    cardWrapper.querySelector(".item-description")?.textContent || "";

  addRippleEffect(cardWrapper);

  console.log("Item clicked:", itemName);
}

function createParticles(card) {
  const particleCount = 3;
  const card_rect = card.getBoundingClientRect();

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.style.position = "fixed";
    particle.style.pointerEvents = "none";
    particle.style.width = "4px";
    particle.style.height = "4px";
    particle.style.background = "#fbbf24";
    particle.style.borderRadius = "50%";
    particle.style.boxShadow = "0 0 8px rgba(251, 191, 36, 0.8)";

    const startX = card_rect.left + card_rect.width / 2;
    const startY = card_rect.top + card_rect.height / 2;

    particle.style.left = startX + "px";
    particle.style.top = startY + "px";

    document.body.appendChild(particle);

    const angle = (Math.PI * 2 * i) / particleCount;
    const velocity = 2;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity;

    let x = startX;
    let y = startY;
    let life = 1;

    const animate = () => {
      life -= 0.02;
      x += vx;
      y += vy;

      particle.style.left = x + "px";
      particle.style.top = y + "px";
      particle.style.opacity = life.toString();

      if (life > 0) {
        requestAnimationFrame(animate);
      } else {
        particle.remove();
      }
    };

    animate();
  }
}

function addRippleEffect(element) {
  const ripple = document.createElement("span");
  ripple.style.position = "absolute";
  ripple.style.borderRadius = "50%";
  ripple.style.background = "rgba(251, 191, 36, 0.5)";
  ripple.style.transform = "scale(0)";
  ripple.style.animation = "ripple 0.6s ease-out";
  ripple.style.pointerEvents = "none";

  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);

  ripple.style.width = size + "px";
  ripple.style.height = size + "px";
  ripple.style.left = rect.width / 2 - size / 2 + "px";
  ripple.style.top = rect.height / 2 - size / 2 + "px";

  if (!element.style.position || element.style.position === "static") {
    element.style.position = "relative";
  }

  element.appendChild(ripple);

  setTimeout(() => {
    ripple.remove();
  }, 600);
}

function initializeScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll(".item-card-wrapper").forEach((el) => {
    observer.observe(el);
  });
}

if (!document.querySelector("style[data-ripple-animation]")) {
  const styleSheet = document.createElement("style");
  styleSheet.setAttribute("data-ripple-animation", "true");
  styleSheet.textContent = `
    @keyframes ripple {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}
