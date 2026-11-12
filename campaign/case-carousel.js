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
  let position = 0;
  function measure() {
    cycleWidth = originals[0].getBoundingClientRect().left - track.children[0].getBoundingClientRect().left;
    position = cycleWidth;
    viewport.scrollLeft = position;
  }
  new ResizeObserver(measure).observe(viewport);
  measure();



  let dragging = false;
  let moved = false;
  let lastX = 0;
  let startX = 0;
  let arrowDistance = 0;
  let previousTime = 0;

  function wrap() {
    if (!cycleWidth) return;
    while (position < cycleWidth) position += cycleWidth;
    while (position >= cycleWidth * 2) position -= cycleWidth;
    viewport.scrollLeft = position;
  }


  viewport.addEventListener("dragstart", event => event.preventDefault());
  viewport.addEventListener("pointerdown", event => {
    if (event.button !== 0) return;
    dragging = true;
    viewport.setPointerCapture(event.pointerId);

    moved = false;
    startX = lastX = event.clientX;
    arrowDistance = 0;
  });
  viewport.addEventListener("pointermove", event => {
    if (!dragging) return;
    if (Math.abs(event.clientX - startX) > 6) {
      moved = true;

      viewport.classList.add("is-dragging");

    }
    if (moved) {
      position -= event.clientX - lastX;
      wrap();
    }
    lastX = event.clientX;
  });
  function finishDrag() {
    dragging = false;
    viewport.classList.remove("is-dragging");

  }
  viewport.addEventListener("pointerup", finishDrag);
  viewport.addEventListener("pointercancel", finishDrag);
  viewport.addEventListener("lostpointercapture", finishDrag);
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

    });
  });
  function animate(now) {
    const elapsed = Math.min(now - previousTime, 50);
    previousTime = now;
    if (!dragging && Math.abs(arrowDistance) > 0.5) {
      const distance = arrowDistance * (1 - Math.exp(-elapsed / 90));
      position += distance;
      arrowDistance -= distance;
    } else if (!dragging) {
      // Keep fractional progress even when a browser rounds scrollLeft.
      position += elapsed * 0.05;
    }
    wrap();
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();