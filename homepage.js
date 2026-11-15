(() => {
  const nav = document.querySelector('.primary-nav');
  const toggle = document.querySelector('.mobile-toggle');
  const groups = [...nav.querySelectorAll('.nav-group')];
  const closeGroups = (except) => groups.forEach(group => { if (group !== except) group.open = false; });
  const closeMobile = () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    closeGroups();
  };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    if (!open) closeGroups();
  });
  groups.forEach(group => {
    let closeTimer;
    let pointerHovering = false;
    const cancelClose = () => window.clearTimeout(closeTimer);
    group.querySelector('summary').addEventListener('click', () => {
      cancelClose();
      closeGroups(group);
    });
    group.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      pointerHovering = true;
      cancelClose();
      closeGroups(group);
      group.open = true;
    });
    group.addEventListener('pointerleave', () => {
      if (!pointerHovering) return;
      pointerHovering = false;
      cancelClose();
      closeTimer = window.setTimeout(() => {
        if (!group.contains(document.activeElement)) group.open = false;
      }, 150);
    });
    group.addEventListener('focusout', () => {
      cancelClose();
      closeTimer = window.setTimeout(() => {
        if (!group.contains(document.activeElement) && !group.matches(':hover')) group.open = false;
      }, 150);
    });
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeMobile();
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const openGroup = groups.find(group => group.open);
    if (openGroup) {
      openGroup.open = false;
      openGroup.querySelector('summary').focus();
    } else if (nav.classList.contains('is-open')) {
      closeMobile();
      toggle.focus();
    }
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) closeMobile(); });
  window.matchMedia('(min-width: 801px)').addEventListener('change', closeMobile);
})();

(() => {
  const video = document.querySelector('.hero-video');
  if (!video) return;
  video.muted = true;
  video.defaultMuted = true;
  video.autoplay = true;
  video.playsInline = true;
  let pendingPlay = false;
  const play = () => {
    if (pendingPlay || document.hidden || video.error) return;
    video.muted = true;
    video.hidden = false;
    pendingPlay = true;
    const attempt = video.play();
    if (attempt) attempt.catch(() => {}).finally(() => { pendingPlay = false; });
    else pendingPlay = false;
  };
  video.addEventListener('loadeddata', play);
  video.addEventListener('canplay', play);
  window.addEventListener('pageshow', play);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) play(); });
  const gesturePlay = () => { if (video.paused) play(); };
  document.addEventListener('pointerdown', gesturePlay, { passive: true });
  document.addEventListener('touchend', gesturePlay, { passive: true });
  document.addEventListener('keydown', gesturePlay);
  const fallback = () => { video.hidden = true; };
  video.addEventListener('error', fallback);
  video.querySelector('source').addEventListener('error', fallback);
  play();
})();

(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
  window.addEventListener('scroll', updateHeader, { passive: true });
  window.addEventListener('pageshow', updateHeader);
  updateHeader();
})();

(() => {
  if (typeof window.Lenis !== 'function') return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = window.matchMedia('(min-width: 1025px) and (hover: hover) and (pointer: fine)');
  const setup = () => {
    if (window.lenis) {
      window.lenis.destroy();
      window.lenis = null;
    }
    if (motion.matches || !desktop.matches) return;
    window.lenis = new window.Lenis({
      autoRaf: true,
      duration: 1.1,
      smoothWheel: true,
      syncTouch: false,
      anchors: {
        offset: -110,
        duration: 1.1
      }
    });
  };
  motion.addEventListener('change', setup);
  desktop.addEventListener('change', setup);
  setup();
})();
