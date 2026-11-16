(() => {
  document.querySelectorAll('.estimate-start').forEach(start => {
  const email = start.elements.emailAddress;
  const button = start.querySelector('button');
  const status = start.querySelector('.capture-status');
  const buttonContent = button.innerHTML;
  start.addEventListener('submit', async event => {
    event.preventDefault();
    email.value = email.value.trim();
    if (!start.reportValidity()) return;
    button.disabled = true;
    button.textContent = 'Starting your estimate…';
    status.textContent = '';
    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(start)).toString(),
        signal: AbortSignal.timeout(15000)
      });
      if (!response.ok) throw new Error('Email capture failed');
      let destination = '/campaign/estimate';
      try {
        sessionStorage.setItem('commercial-roofing-email', email.value);
      } catch (_) {
        // A fragment stays out of server requests when browser storage is blocked.
        destination += '#email=' + encodeURIComponent(email.value);
      }
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'roof_estimate_started' });
      window.location.assign(destination);
    } catch (_) {
      status.textContent = 'We couldn’t save your email yet. Please try again, or call (281) 397-6614.';
      button.disabled = false;
      button.innerHTML = buttonContent;
    }
  });
  });
})();
