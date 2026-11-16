(() => {
  const dialog = document.querySelector('.roof-system-dialog');
  if (!dialog) return;
  const email = dialog.querySelector('[name="emailAddress"]');
  let opener;
  let bodyOverflow;
  let rootOverflow;
  let resumeScroll = false;
  document.addEventListener('click', event => {
      const card = event.target.closest('[data-roof-estimate]');
      if (!card || event.defaultPrevented || dialog.open) return;
      event.preventDefault();
      opener = card;
      bodyOverflow = document.body.style.overflow;
      rootOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      resumeScroll = window.lenis && !window.lenis.isStopped;
      if (resumeScroll) window.lenis.stop();
      dialog.showModal();
      email.focus({ preventScroll: true });
  });
  dialog.querySelector('.roof-system-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = bodyOverflow;
    document.documentElement.style.overflow = rootOverflow;
    if (resumeScroll && window.lenis) window.lenis.start();
    opener?.focus({ preventScroll: true });
  });
})();
