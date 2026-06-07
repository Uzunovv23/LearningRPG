(() => {
  "use strict";

  const canvas = document.getElementById("qr-particles");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const isVictory = document.querySelector(".qr-banner--victory") !== null;

    const PARTICLE_COUNT = 60;
    const particles = [];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function randomBetween(a, b) {
      return a + Math.random() * (b - a);
    }

    function createParticle() {
      return {
        x: randomBetween(0, canvas.width),
        y: randomBetween(0, canvas.height),
        r: randomBetween(0.6, 2.2),
        vx: randomBetween(-0.15, 0.15),
        vy: randomBetween(-0.3, -0.05),
        alpha: randomBetween(0.1, 0.6),
        hue: isVictory ? randomBetween(40, 55) : randomBetween(0, 10),
      };
    }

    function initParticles() {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(createParticle());
      }
    }

    function tickParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, ${p.alpha})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.0008;

        if (p.y < -4 || p.alpha <= 0) {
          Object.assign(p, createParticle());
          p.y = canvas.height + 4;
          p.alpha = randomBetween(0.1, 0.6);
        }
      }

      requestAnimationFrame(tickParticles);
    }

    resize();
    initParticles();
    tickParticles();
    window.addEventListener("resize", () => {
      resize();
      initParticles();
    });
  }

  function burstGold() {
    const canvas = document.getElementById("qr-particles");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const burst = [];

    for (let i = 0; i < 80; i++) {
      const angle = (Math.PI * 2 * i) / 80 + Math.random() * 0.2;
      const speed = 2 + Math.random() * 5;
      burst.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 1.5 + Math.random() * 3,
        alpha: 1,
        hue: 42 + Math.random() * 18,
      });
    }

    function draw() {
      let alive = false;
      for (const p of burst) {
        if (p.alpha <= 0) continue;
        alive = true;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 95%, 65%, ${p.alpha})`;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.alpha -= 0.018;
        p.r *= 0.98;
      }
      if (alive) requestAnimationFrame(draw);
    }

    draw();
  }

  function animateCount(el, target, duration) {
    if (!el || target === 0) {
      if (el) el.textContent = "0";
      return;
    }

    let start = null;

    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }

    requestAnimationFrame(step);
  }

  function animateRing(el, percent) {
    if (!el) return;
    const circumference = 327;
    const offset = circumference - (circumference * percent) / 100;

    requestAnimationFrame(() => {
      el.style.strokeDashoffset = offset;
    });
  }

  function animatePercent(el, target) {
    animateCount(el, target, 1400);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const scoreEl = document.getElementById("scoreDisplay");
    if (scoreEl) {
      const target = parseInt(scoreEl.dataset.target, 10) || 0;
      animateCount(scoreEl, target, 1500);
    }

    const ringEl = document.getElementById("qr-ring-fill");
    const percentEl = document.getElementById("percentDisplay");
    if (ringEl) {
      const pct = parseInt(ringEl.dataset.percent, 10) || 0;
      setTimeout(() => animateRing(ringEl, pct), 300);
      animatePercent(percentEl, pct);
    }

    const xpEl = document.getElementById("xpDisplay");
    if (xpEl) {
      const target = parseInt(xpEl.dataset.target, 10) || 0;
      setTimeout(() => animateCount(xpEl, target, 1000), 1200);
    }

    const coinsEl = document.getElementById("coinsDisplay");
    if (coinsEl) {
      const target = parseInt(coinsEl.dataset.target, 10) || 0;
      setTimeout(() => animateCount(coinsEl, target, 1000), 1200);
    }

    if (document.querySelector(".qr-banner--victory")) {
      setTimeout(burstGold, 600);
    }
  });
})();
