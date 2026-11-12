(() => {
  const carousel = document.querySelector(".case-carousel");
  if (!carousel) return;
  const viewport = carousel.querySelector(".case-carousel-viewport");
  const track = carousel.querySelector(".project-gallery-grid");
  const originals = Array.from(track.children);
  if (originals.length < 2) return;

  // Copies on both sides keep the visible track continuous at each wrap.
  function copyPhotos() {
    const fragment = document.createDocumentFragment();
    originals.forEach(original => {
      const copy = original.cloneNode(true);
      copy.tabIndex = -1;
      copy.setAttribute("aria-hidden", "true");
      copy.addEventListener("click", event => {
        event.preventDefault();
        original.click();
      });
      fragment.append(copy);
    });
    return fragment;
  }
  track.prepend(copyPhotos());
  track.append(copyPhotos());
  let cycleWidth = 0;
  function measure() {
    cycleWidth = originals[0].offsetLeft - track.children[0].offsetLeft;
    viewport.scrollLeft = cycleWidth;
  }
  new ResizeObserver(measure).observe(viewport);
  measure();

  let hovering = false;
  let dragging = false;
  let moved = false;
  let lastX = 0;
  let startX = 0;
  let arrowDistance = 0;
  let previousTime = 0;
  let resumeAt = 0;
  function wrap() {
    if (!cycleWidth) return;
    while (viewport.scrollLeft < cycleWidth) viewport.scrollLeft += cycleWidth;
    while (viewport.scrollLeft >= cycleWidth * 2) viewport.scrollLeft -= cycleWidth;
  }
  carousel.addEventListener("mouseenter", () => { hovering = true; });
  carousel.addEventListener("mouseleave", () => { hovering = false; });
  viewport.addEventListener("dragstart", event => event.preventDefault());
  viewport.addEventListener("pointerdown", event => {
    if (event.button !== 0) return;
    dragging = true;
    moved = false;
    startX = lastX = event.clientX;
    arrowDistance = 0;
  });
  viewport.addEventListener("pointermove", event => {
    if (!dragging) return;
    if (Math.abs(event.clientX - startX) > 6) {
      moved = true;
      viewport.classList.add("is-dragging");
      viewport.setPointerCapture(event.pointerId);
    }
    if (moved) {
      viewport.scrollLeft -= event.clientX - lastX;
      wrap();
    }
    lastX = event.clientX;
  });
  function finishDrag() {
    dragging = false;
    viewport.classList.remove("is-dragging");
    resumeAt = performance.now() + 1200;
  }
  viewport.addEventListener("pointerup", finishDrag);
  viewport.addEventListener("pointercancel", finishDrag);
  window.addEventListener("pointerup", finishDrag);
  viewport.addEventListener("click", event => {
    if (!moved) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    moved = false;
  }, true);
  carousel.querySelectorAll(".case-carousel-arrow").forEach(button => {
    button.addEventListener("click", () => {
      const photoWidth = originals[0].getBoundingClientRect().width + 14;
      arrowDistance += button.classList.contains("case-carousel-prev") ? -photoWidth : photoWidth;
      resumeAt = performance.now() + 1200;
    });
  });
  function animate(now) {
    const elapsed = Math.min(now - previousTime, 50);
    previousTime = now;
    const paused = hovering || dragging || carousel.matches(":focus-within") ||
      document.hidden || document.querySelector(".photo-lightbox[open]");
    if (!dragging && Math.abs(arrowDistance) > 0.5) {
      const distance = arrowDistance * (1 - Math.exp(-elapsed / 90));
      viewport.scrollLeft += distance;
      arrowDistance -= distance;
    } else if (!paused && now > resumeAt) {
      viewport.scrollLeft += elapsed * 0.035;
    }
    wrap();
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();