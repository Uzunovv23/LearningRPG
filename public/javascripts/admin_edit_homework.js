(function () {
  "use strict";

  function initFileInput(wrapper) {
    const input = wrapper.querySelector('input[type="file"]');
    const dropZone = wrapper.querySelector(".rpg-file-drop-zone");
    const fileList = wrapper.querySelector(".rpg-file-list");

    if (!input || !dropZone || !fileList) return;

    function formatBytes(bytes) {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    }

    function iconForFile(name) {
      const ext = name.split(".").pop().toLowerCase();
      if (["pdf"].includes(ext)) return "fa-file-pdf";
      if (["doc", "docx"].includes(ext)) return "fa-file-word";
      if (["xls", "xlsx"].includes(ext)) return "fa-file-excel";
      if (["ppt", "pptx"].includes(ext)) return "fa-file-powerpoint";
      if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext))
        return "fa-file-image";
      if (["zip", "rar", "7z"].includes(ext)) return "fa-file-archive";
      return "fa-file-alt";
    }

    let dt = new DataTransfer();

    function renderList() {
      fileList.innerHTML = "";
      Array.from(dt.files).forEach(function (file, idx) {
        const item = document.createElement("div");
        item.className = "rpg-file-item";
        item.innerHTML =
          '<i class="fas ' +
          iconForFile(file.name) +
          '"></i>' +
          '<span class="file-name" title="' +
          file.name +
          '">' +
          file.name +
          "</span>" +
          '<span class="file-size">' +
          formatBytes(file.size) +
          "</span>" +
          '<button type="button" class="file-remove" title="Премахни" aria-label="Премахни файл">' +
          '<i class="fas fa-times"></i></button>';

        item
          .querySelector(".file-remove")
          .addEventListener("click", function (e) {
            e.stopPropagation();
            const newDt = new DataTransfer();
            Array.from(dt.files).forEach(function (f, i) {
              if (i !== idx) newDt.items.add(f);
            });
            dt = newDt;
            input.files = dt.files;
            renderList();
            updateDropLabel();
            input.dispatchEvent(new Event("change", { bubbles: true }));
          });

        fileList.appendChild(item);
      });
    }

    function updateDropLabel() {
      const label = dropZone.querySelector(".drop-label");
      if (!label) return;
      const count = dt.files.length;
      if (count === 0) {
        label.innerHTML =
          "<strong>Кликни за избор</strong> или провлачи новите файлове тук";
      } else {
        label.innerHTML =
          "<strong>" +
          count +
          " " +
          (count === 1 ? "нов файл избран" : "нови файла избрани") +
          "</strong> &mdash; кликни за добавяне на още";
      }
    }

    input.addEventListener("change", function () {
      Array.from(input.files).forEach(function (file) {
        const exists = Array.from(dt.files).some(function (f) {
          return f.name === file.name && f.size === file.size;
        });
        if (!exists) dt.items.add(file);
      });
      input.files = dt.files;
      renderList();
      updateDropLabel();
    });

    dropZone.addEventListener("dragover", function (e) {
      e.preventDefault();
      dropZone.classList.add("drag-over");
    });

    dropZone.addEventListener("dragleave", function () {
      dropZone.classList.remove("drag-over");
    });

    dropZone.addEventListener("drop", function (e) {
      e.preventDefault();
      dropZone.classList.remove("drag-over");
      Array.from(e.dataTransfer.files).forEach(function (file) {
        const exists = Array.from(dt.files).some(function (f) {
          return f.name === file.name && f.size === file.size;
        });
        if (!exists) dt.items.add(file);
      });
      input.files = dt.files;
      renderList();
      updateDropLabel();
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  var MONTHS_BG = [
    "Януари",
    "Февруари",
    "Март",
    "Април",
    "Май",
    "Юни",
    "Юли",
    "Август",
    "Септември",
    "Октомври",
    "Ноември",
    "Декември",
  ];

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function toLocalDatetimeValue(y, mo, d, h, mi) {
    return y + "-" + pad(mo + 1) + "-" + pad(d) + "T" + pad(h) + ":" + pad(mi);
  }

  function formatDisplay(y, mo, d, h, mi) {
    return pad(d) + "." + pad(mo + 1) + "." + y + "  " + pad(h) + ":" + pad(mi);
  }

  function initDatetimePicker(wrapper) {
    var hidden = wrapper.querySelector(".rpg-datetime-hidden");
    var trigger = wrapper.querySelector(".rpg-datetime-trigger");
    var panel = wrapper.querySelector(".rpg-datetime-panel");
    var valueEl = trigger.querySelector(".dt-value");

    if (!hidden || !trigger || !panel) return;

    var now = new Date();
    var selYear = now.getFullYear();
    var selMonth = now.getMonth();
    var selDay = null;
    var selHour = now.getHours();
    var selMin = now.getMinutes();

    if (hidden.value) {
      var existing = new Date(hidden.value);
      if (!isNaN(existing)) {
        selYear = existing.getFullYear();
        selMonth = existing.getMonth();
        selDay = existing.getDate();
        selHour = existing.getHours();
        selMin = existing.getMinutes();
      }
    }

    var viewYear = selYear;
    var viewMonth = selMonth;

    var hourInput = panel.querySelector(".rpg-hour");
    var minInput = panel.querySelector(".rpg-min");
    hourInput.value = pad(selHour);
    minInput.value = pad(selMin);

    function clamp(val, min, max) {
      return Math.max(min, Math.min(max, val));
    }

    function syncHidden() {
      if (selDay === null) return;
      hidden.value = toLocalDatetimeValue(
        selYear,
        selMonth,
        selDay,
        selHour,
        selMin,
      );
      hidden.dispatchEvent(new Event("change", { bubbles: true }));
    }

    function updateTriggerText() {
      if (selDay === null) {
        valueEl.textContent =
          trigger.dataset.placeholder || "Избери дата и час";
        valueEl.classList.add("placeholder");
      } else {
        valueEl.textContent = formatDisplay(
          selYear,
          selMonth,
          selDay,
          selHour,
          selMin,
        );
        valueEl.classList.remove("placeholder");
      }
    }

    function buildCalendar() {
      var label = panel.querySelector(".rpg-cal-month-label");
      label.textContent = MONTHS_BG[viewMonth] + " " + viewYear;

      var grid = panel.querySelector(".rpg-cal-days");
      grid.innerHTML = "";

      var firstDay = new Date(viewYear, viewMonth, 1).getDay();
      var startOffset = firstDay === 0 ? 6 : firstDay - 1;
      var daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

      var todayObj = new Date();
      var todayY = todayObj.getFullYear();
      var todayM = todayObj.getMonth();
      var todayD = todayObj.getDate();

      for (var i = 0; i < startOffset; i++) {
        var empty = document.createElement("div");
        empty.className = "rpg-cal-day empty";
        grid.appendChild(empty);
      }

      for (var d = 1; d <= daysInMonth; d++) {
        var cell = document.createElement("div");
        cell.className = "rpg-cal-day";
        cell.textContent = d;

        var isToday =
          viewYear === todayY && viewMonth === todayM && d === todayD;
        var isSelected =
          selDay !== null &&
          viewYear === selYear &&
          viewMonth === selMonth &&
          d === selDay;

        if (isToday) cell.classList.add("today");
        if (isSelected) cell.classList.add("selected");

        (function (day) {
          cell.addEventListener("click", function () {
            selDay = day;
            selYear = viewYear;
            selMonth = viewMonth;
            syncHidden();
            updateTriggerText();
            buildCalendar();
          });
        })(d);

        grid.appendChild(cell);
      }
    }

    panel.querySelector(".rpg-cal-prev").addEventListener("click", function () {
      viewMonth--;
      if (viewMonth < 0) {
        viewMonth = 11;
        viewYear--;
      }
      buildCalendar();
    });

    panel.querySelector(".rpg-cal-next").addEventListener("click", function () {
      viewMonth++;
      if (viewMonth > 11) {
        viewMonth = 0;
        viewYear++;
      }
      buildCalendar();
    });

    hourInput.addEventListener("input", function () {
      selHour = clamp(parseInt(this.value, 10) || 0, 0, 23);
      this.value = pad(selHour);
      syncHidden();
      updateTriggerText();
    });
    hourInput.addEventListener("blur", function () {
      this.value = pad(selHour);
    });

    minInput.addEventListener("input", function () {
      selMin = clamp(parseInt(this.value, 10) || 0, 0, 59);
      this.value = pad(selMin);
      syncHidden();
      updateTriggerText();
    });
    minInput.addEventListener("blur", function () {
      this.value = pad(selMin);
    });

    function attachScroll(el, min, max, getter, setter) {
      el.addEventListener(
        "wheel",
        function (e) {
          e.preventDefault();
          var delta = e.deltaY < 0 ? 1 : -1;
          setter(clamp(getter() + delta, min, max));
          el.value = pad(getter());
          syncHidden();
          updateTriggerText();
        },
        { passive: false },
      );
    }

    attachScroll(
      hourInput,
      0,
      23,
      function () {
        return selHour;
      },
      function (v) {
        selHour = v;
      },
    );
    attachScroll(
      minInput,
      0,
      59,
      function () {
        return selMin;
      },
      function (v) {
        selMin = v;
      },
    );

    panel
      .querySelector(".rpg-cal-confirm")
      .addEventListener("click", function () {
        closePanel();
      });

    function openPanel() {
      buildCalendar();
      panel.classList.add("open");
      trigger.classList.add("active");
    }

    function closePanel() {
      panel.classList.remove("open");
      trigger.classList.remove("active");
    }

    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      var isOpen = panel.classList.contains("open");

      document
        .querySelectorAll(".rpg-datetime-panel.open")
        .forEach(function (p) {
          p.classList.remove("open");
          p.closest(".rpg-datetime-wrapper")
            .querySelector(".rpg-datetime-trigger")
            .classList.remove("active");
        });
      if (!isOpen) openPanel();
    });

    panel.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    updateTriggerText();
    buildCalendar();
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".rpg-file-wrapper").forEach(initFileInput);
    document
      .querySelectorAll(".rpg-datetime-wrapper")
      .forEach(initDatetimePicker);

    document.addEventListener("click", function () {
      document
        .querySelectorAll(".rpg-datetime-panel.open")
        .forEach(function (p) {
          p.classList.remove("open");
          p.closest(".rpg-datetime-wrapper")
            .querySelector(".rpg-datetime-trigger")
            .classList.remove("active");
        });
    });

    var form = document.querySelector('form[action*="/edit"]');
    if (form) {
      var submitBtn = form.querySelector('button[type="submit"]');
      var errorBox = null;

      function ensureErrorBox() {
        if (errorBox) return errorBox;
        errorBox = document.createElement("div");
        errorBox.className = "rpg-alert rpg-alert-danger mb-3";
        errorBox.style.display = "none";
        form.insertBefore(errorBox, form.firstChild);
        return errorBox;
      }

      submitBtn.disabled = true;
      submitBtn.style.opacity = "0.5";
      submitBtn.style.cursor = "not-allowed";

      setTimeout(function () {
        var initialTitle = form
          .querySelector('input[name="title"]')
          .value.trim();
        var initialDesc = form
          .querySelector('textarea[name="description"]')
          .value.trim();
        var initialStart = form
          .querySelector('input[name="startDate"]')
          .value.trim();
        var initialEnd = form
          .querySelector('input[name="endDate"]')
          .value.trim();

        function evaluateFormState() {
          var currentTitle = form
            .querySelector('input[name="title"]')
            .value.trim();
          var currentDesc = form
            .querySelector('textarea[name="description"]')
            .value.trim();
          var currentStart = form
            .querySelector('input[name="startDate"]')
            .value.trim();
          var currentEnd = form
            .querySelector('input[name="endDate"]')
            .value.trim();

          var fileInput = form.querySelector('input[name="materials"]');
          var currentFilesCount = fileInput ? fileInput.files.length : 0;

          var isChanged =
            currentTitle !== initialTitle ||
            currentDesc !== initialDesc ||
            currentStart !== initialStart ||
            currentEnd !== initialEnd ||
            currentFilesCount > 0;

          var isValidDate = true;
          var box = ensureErrorBox();

          if (currentStart && currentEnd) {
            if (new Date(currentStart) >= new Date(currentEnd)) {
              isValidDate = false;
              box.innerHTML =
                '<i class="fas fa-exclamation-circle"></i> Началната дата трябва да бъде преди крайния срок!';
              box.style.display = "flex";
            } else {
              box.style.display = "none";
            }
          } else {
            box.style.display = "none";
          }

          if (isChanged && isValidDate) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = "1";
            submitBtn.style.cursor = "pointer";
          } else {
            submitBtn.disabled = true;
            submitBtn.style.opacity = "0.5";
            submitBtn.style.cursor = "not-allowed";
          }

          return { isChanged: isChanged, isValidDate: isValidDate };
        }

        evaluateFormState();

        form
          .querySelector('input[name="title"]')
          .addEventListener("input", evaluateFormState);
        form
          .querySelector('textarea[name="description"]')
          .addEventListener("input", evaluateFormState);
        form
          .querySelector('input[name="startDate"]')
          .addEventListener("change", evaluateFormState);
        form
          .querySelector('input[name="endDate"]')
          .addEventListener("change", evaluateFormState);

        var fileInput = form.querySelector('input[name="materials"]');
        if (fileInput) {
          fileInput.addEventListener("change", evaluateFormState);
        }

        form.addEventListener("submit", function (e) {
          var state = evaluateFormState();
          if (!state.isValidDate || !state.isChanged) {
            e.preventDefault();
          }
        });
      }, 100);
    }
  });
})();
