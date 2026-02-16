document.addEventListener("DOMContentLoaded", () => {
  const scrollSwitch = document.getElementById("useScrollSwitch");

  const midasSwitch = document.getElementById("useMidasSwitch");

  if (scrollSwitch && midasSwitch) {
    scrollSwitch.addEventListener("change", () => {
      if (scrollSwitch.checked) {
        midasSwitch.checked = false;
      }
    });

    midasSwitch.addEventListener("change", () => {
      if (midasSwitch.checked) {
        scrollSwitch.checked = false;
      }
    });
  }
});
