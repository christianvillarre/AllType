(() => {
  document.querySelectorAll('form.lead-form, form.estimate-start').forEach(form => {
    let scheduled = false;
    let nextId = 0;
    const isField = field => field.matches('input:not([type="hidden"]):not([type="file"]), select, textarea') && !field.closest('.campaign-recaptcha');
    function update(field) {
      if (!isField(field)) return;
      const invalid = !field.validity.valid;
      field.classList.toggle('field-invalid', invalid);
      if (invalid) field.setAttribute('aria-invalid', 'true');
      else field.removeAttribute('aria-invalid');
      let message = field.nextElementSibling;
      if (!message || !message.classList.contains('field-error')) {
        if (!invalid) return;
        message = document.createElement('span');
        message.className = 'field-error';
        message.id = `${form.id || 'form'}-error-${++nextId}`;
        field.after(message);
        const descriptions = (field.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
        field.setAttribute('aria-describedby', [...descriptions, message.id].join(' '));
      }
      message.textContent = invalid ? field.validationMessage : '';
      message.hidden = !invalid;
    }
    form.addEventListener('invalid', event => {
      const field = event.target;
      if (!isField(field)) return;
      // Replace the browser tooltip with inline errors and one controlled scroll.
      event.preventDefault();
      update(field);
      if (scheduled) return;
      scheduled = true;
      queueMicrotask(() => {
        scheduled = false;
        const first = Array.from(form.elements).find(field => isField(field) && !field.validity.valid);
        if (!first) return;
        first.focus({ preventScroll: true });
        first.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
      });
    }, true);
    function recheck(event) {
      const field = event.target;
      if (!field.classList.contains('field-invalid')) return;
      // Phone and email validators finish before the error state is refreshed.
      queueMicrotask(() => update(field));
    }
    form.addEventListener('input', recheck);
    form.addEventListener('change', recheck);
  });
})();
