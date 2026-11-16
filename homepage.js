(() => {
  const script = document.createElement('script');
  script.src = '/navigation.js?v=20261116-dark-menu';
  document.head.append(script);
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
