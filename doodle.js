(function () {
  const wrap = document.getElementById("doodle-wrap");
  if (!wrap) return;

  const img = document.getElementById("doodle-image");
  const canvas = document.getElementById("doodle-canvas");
  const toggle = document.getElementById("doodle-toggle");
  const ctx = canvas.getContext("2d");

  let active = false;
  let drawing = false;

  function sizeCanvas() {
    canvas.width = img.clientWidth;
    canvas.height = img.clientHeight;
  }

  function setActive(value) {
    active = value;
    toggle.classList.toggle("is-active", active);
    toggle.setAttribute("aria-pressed", String(active));
    canvas.style.pointerEvents = active ? "auto" : "none";
    canvas.style.cursor = active ? "crosshair" : "default";
  }

  function pointFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function startStroke(event) {
    if (!active) return;
    drawing = true;
    const { x, y } = pointFromEvent(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function extendStroke(event) {
    if (!drawing) return;
    const { x, y } = pointFromEvent(event);
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#e63946";
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function endStroke() {
    drawing = false;
  }

  if (img.complete) {
    sizeCanvas();
  } else {
    img.addEventListener("load", sizeCanvas);
  }
  window.addEventListener("resize", sizeCanvas);

  toggle.addEventListener("click", function () {
    setActive(!active);
  });

  canvas.addEventListener("pointerdown", startStroke);
  canvas.addEventListener("pointermove", extendStroke);
  canvas.addEventListener("pointerup", endStroke);
  canvas.addEventListener("pointerleave", endStroke);
  canvas.addEventListener("pointercancel", endStroke);
})();
