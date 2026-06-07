// leaderboard.js
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  animateRankRows();
  animateProgressBars();
});

function animateRankRows() {
  const rows = document.querySelectorAll(".lb-rank-row");
  rows.forEach((row) => {
    const idx = parseInt(row.dataset.index ?? "0", 10);
    row.style.animationDelay = `${0.05 + idx * 0.08}s`;
  });
}

function animateProgressBars() {
  const bars = document.querySelectorAll(".lb-rank-row__bar");
  bars.forEach((bar) => {
    const pct = bar.dataset.pct ?? "0";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        bar.style.width = `${pct}%`;
      });
    });
  });
}
