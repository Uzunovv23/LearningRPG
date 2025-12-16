document.addEventListener("DOMContentLoaded", () => {
  const scoreElement = document.getElementById("scoreDisplay");
  const xpElement = document.getElementById("xpDisplay");

  if (scoreElement) {
    const targetScore = parseInt(scoreElement.getAttribute("data-target"));
    animateValue(scoreElement, 0, targetScore, 1500);
  }

  if (xpElement) {
    const targetXP = parseInt(xpElement.getAttribute("data-target"));
    setTimeout(() => {
      animateValue(xpElement, 0, targetXP, 1000);
    }, 1000);
  }
});

function animateValue(obj, start, end, duration) {
  if (end === 0) return;

  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);

    obj.innerHTML = Math.floor(progress * (end - start) + start);

    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      obj.innerHTML = end;
    }
  };
  window.requestAnimationFrame(step);
}
