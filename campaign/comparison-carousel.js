(() => {
  const section = document.querySelector('.roofing-comparisons');
  if (!section) return;
  const track = section.querySelector('.comparison-grid');
  const slides = Array.from(track.querySelectorAll('.comparison'));
  if (slides.length < 2) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  section.setAttribute('aria-roledescription', 'carousel');
  const controls = document.createElement('div');
  controls.className = 'comparison-controls';
  const dots = document.createElement('div');
  dots.className = 'comparison-dots';
  dots.setAttribute('role', 'group');
  dots.setAttribute('aria-label', 'Choose a before and after project');
  const pause = document.createElement('button');
  pause.type = 'button';
  pause.className = 'comparison-pause';
  let current = 0;
  let timer;
  const duration = 4000;
  let elapsed = 0;
  let previousTime = null;
  let paused = reducedMotion.matches;
  function stop() {
    cancelAnimationFrame(timer);
    previousTime = null;
  }
  function schedule() {
    stop();
    if (paused || document.hidden || document.querySelector('.roof-system-dialog[open]')) return;
    timer = requestAnimationFrame(advance);
  }
  function advance(now) {
    if (previousTime !== null) elapsed += Math.min(now - previousTime, 100);
    previousTime = now;
    if (elapsed >= duration) show(current + 1);
    buttons[current].style.setProperty('--comparison-progress', String(elapsed / duration));
    timer = requestAnimationFrame(advance);
  }
  function show(index) {
    elapsed = 0;
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.hidden = i !== current;
      buttons[i].setAttribute('aria-current', String(i === current));
      buttons[i].style.setProperty('--comparison-progress', '0');
    });
  }
  const buttons = slides.map((slide, i) => {
    slide.id = `roof-comparison-${i + 1}`;
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `${i + 1} of ${slides.length}`);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'comparison-dot';
    const meter = document.createElement('span');
    meter.className = 'comparison-dot-meter';
    meter.setAttribute('aria-hidden', 'true');
    button.append(meter);
    button.setAttribute('aria-label', `Show ${slide.querySelector('h3').textContent.trim()}`);
    button.setAttribute('aria-controls', slide.id);
    button.addEventListener('click', () => { show(i); schedule(); });
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (i + 1) % slides.length;
      if (event.key === 'ArrowLeft') next = (i - 1 + slides.length) % slides.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = slides.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      show(next);
      buttons[next].focus();
    });
    dots.append(button);
    return button;
  });
  function updatePause() {
    pause.textContent = paused ? 'Play slideshow' : 'Pause slideshow';
    pause.setAttribute('aria-label', pause.textContent);
  }
  pause.addEventListener('click', () => { paused = !paused; updatePause(); schedule(); });
  controls.append(dots, pause);
  track.after(controls);
  section.classList.add('comparison-carousel-ready');
  document.addEventListener('visibilitychange', schedule);
  const lightbox = document.querySelector('.roof-system-dialog');
  if (lightbox) new MutationObserver(schedule).observe(lightbox, { attributes: true, attributeFilter: ['open'] });
  reducedMotion.addEventListener('change', () => { paused = reducedMotion.matches; updatePause(); schedule(); });
  show(0);
  updatePause();
  schedule();
})();
