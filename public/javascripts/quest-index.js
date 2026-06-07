(function () {
  "use strict";

  function initParticles() {
    const canvas = document.getElementById("rpg-particles");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const PARTICLE_COUNT = 60;
    const particles = [];

    function Particle() {
      this.reset(true);
    }

    Particle.prototype.reset = function (randomY) {
      this.x = Math.random() * W;
      this.y = randomY ? Math.random() * H : H + 10;
      this.radius = Math.random() * 1.5 + 0.4;
      this.speedY = -(Math.random() * 0.4 + 0.1);
      this.speedX = (Math.random() - 0.5) * 0.15;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.fadeSpeed = Math.random() * 0.003 + 0.001;
      this.fadingIn = true;

      const roll = Math.random();
      if (roll < 0.55) {
        this.r = 251;
        this.g = 191;
        this.b = 36;
      } else if (roll < 0.85) {
        this.r = 59;
        this.g = 130;
        this.b = 246;
      } else {
        this.r = 34;
        this.g = 197;
        this.b = 94;
      }
    };

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      particles.forEach(function (p) {
        if (p.fadingIn) {
          p.opacity += p.fadeSpeed;
          if (p.opacity >= 0.55) p.fadingIn = false;
        } else {
          p.opacity -= p.fadeSpeed * 0.5;
        }

        p.x += p.speedX;
        p.y += p.speedY;

        if (p.y < -10 || p.opacity <= 0) {
          p.reset(false);
          return;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgb(" + p.r + "," + p.g + "," + p.b + ")";
        ctx.fill();

        if (p.radius > 1) {
          const grd = ctx.createRadialGradient(
            p.x,
            p.y,
            0,
            p.x,
            p.y,
            p.radius * 4,
          );
          grd.addColorStop(0, "rgba(" + p.r + "," + p.g + "," + p.b + ",0.15)");
          grd.addColorStop(1, "rgba(" + p.r + "," + p.g + "," + p.b + ",0)");
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }

        ctx.restore();
      });

      requestAnimationFrame(draw);
    }

    draw();

    window.addEventListener("resize", function () {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    });
  }

  function initCardEntrance() {
    const cards = document.querySelectorAll(".quest-card");
    if (!cards.length) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const card = entry.target;
            const idx = parseInt(card.dataset.cardIndex, 10) || 0;
            setTimeout(function () {
              card.classList.add("card-visible");
            }, idx * 80);
            observer.unobserve(card);
          }
        });
      },
      { threshold: 0.1 },
    );

    cards.forEach(function (card, i) {
      card.dataset.cardIndex = i;
      observer.observe(card);
    });
  }

  function initFinalizeConfirm() {
    document.querySelectorAll(".finalize-quest-form").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        var msg =
          "СИГУРНИ ЛИ СТЕ?\n\nСлед приключване, предметът НЕ МОЖЕ да се отключва повече и оценките влизат в магазина!";
        if (!confirm(msg)) e.preventDefault();
      });
    });
  }

  function initDeleteConfirm() {
    document.querySelectorAll(".delete-quest-form").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        var msg =
          "ВНИМАНИЕ!\n\nНаистина ли искате да изтриете целия предмет и всички данни/оценки към него? Действието е необратимо.";
        if (!confirm(msg)) e.preventDefault();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initParticles();
    initCardEntrance();
    initFinalizeConfirm();
    initDeleteConfirm();
  });
})();
