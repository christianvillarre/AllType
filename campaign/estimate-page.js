(() => {
  const form = document.querySelector('#estimate-details');
  if (!form) return;
  let captured = '';
  const fragment = new URLSearchParams(window.location.hash.slice(1));
  if (fragment.has('email')) {
    captured = fragment.get('email');
    history.replaceState(null, '', window.location.pathname + window.location.search);
  } else {
    try { captured = sessionStorage.getItem('commercial-roofing-email') || ''; } catch (_) {}
  }
  if (captured) {
    const email = form.elements.emailAddress;
    email.value = captured;
    if (email.checkValidity()) document.querySelector('#email-captured').hidden = false;
    else email.value = '';
  }
  const slots = Array.from(form.querySelectorAll('.upload-slot'));
  const picker = document.querySelector('#upload-picker');
  const dropzone = document.querySelector('#upload-dropzone');
  const list = document.querySelector('#upload-list');
  const error = document.querySelector('#upload-error');
  const status = document.querySelector('#upload-status');
  let files = [];
  function validateUploads() {
    return files.length <= slots.length && files.reduce((total, file) => total + file.size, 0) <= 7 * 1024 * 1024;
  }
  function renderFiles() {
    slots.forEach((input, i) => {
      const transfer = new DataTransfer();
      if (files[i]) transfer.items.add(files[i]);
      input.files = transfer.files;
    });
    list.replaceChildren();
    files.forEach((file, index) => {
      const item = document.createElement('li');
      const name = document.createElement('span');
      name.textContent = file.name;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'upload-remove';
      remove.textContent = 'Remove';
      remove.setAttribute('aria-label', `Remove ${file.name}`);
      remove.addEventListener('click', () => {
        files.splice(index, 1);
        error.textContent = '';
        renderFiles();
        document.querySelector('#upload-browse').focus();
      });
      item.append(name, remove);
      list.append(item);
    });
    status.textContent = files.length ? `${files.length} file${files.length === 1 ? '' : 's'} ready to upload` : '';
  }
  function addFiles(incoming) {
    const next = files.slice();
    for (const file of incoming) {
      if (!file.type.startsWith('image/') && !/\.(pdf|doc|docx)$/i.test(file.name)) {
        error.textContent = 'Please choose photos, PDFs, or Word documents.';
        return;
      }
      if (!next.some(existing => existing.name === file.name && existing.size === file.size && existing.lastModified === file.lastModified)) next.push(file);
    }
    if (next.length > slots.length || next.reduce((total, file) => total + file.size, 0) > 7 * 1024 * 1024) {
      error.textContent = 'Please select up to 10 files with a combined size under 7 MB.';
      return;
    }
    files = next;
    error.textContent = '';
    renderFiles();
  }
  document.querySelector('#upload-browse').addEventListener('click', () => picker.click());
  picker.addEventListener('change', () => { addFiles(Array.from(picker.files)); picker.value = ''; });
  let dragDepth = 0;
  dropzone.addEventListener('dragenter', event => { event.preventDefault(); dragDepth++; dropzone.classList.add('is-dragover'); });
  dropzone.addEventListener('dragover', event => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; });
  dropzone.addEventListener('dragleave', () => { if (--dragDepth <= 0) { dragDepth = 0; dropzone.classList.remove('is-dragover'); } });
  dropzone.addEventListener('drop', event => {
    event.preventDefault();
    dragDepth = 0;
    dropzone.classList.remove('is-dragover');
    addFiles(Array.from(event.dataTransfer.files));
  });
  let submitting = false;
  form.addEventListener('submit', async event => {
    // Shared contact validation runs first and can cancel the submission.
    if (event.defaultPrevented) return;
    event.preventDefault();
    if (submitting || !form.reportValidity()) return;
    if (!validateUploads()) {
      error.textContent = 'Please select up to 10 files with a combined size under 7 MB.';
      return;
    }
    const captchaError = document.querySelector('#captcha-error');
    const response = form.querySelector('[name="g-recaptcha-response"]');
    if (!response || !response.value.trim()) {
      captchaError.textContent = 'Please complete the CAPTCHA before sending your request.';
      form.querySelector('.campaign-recaptcha').scrollIntoView({ block: 'center' });
      return;
    }
    captchaError.textContent = '';
    const submit = form.querySelector('button[type="submit"]');
    const message = document.querySelector('#submission-status');
    const originalText = submit.textContent;
    submitting = true;
    submit.disabled = true;
    submit.textContent = 'Sending your request…';
    message.textContent = '';
    try {
      const body = new FormData(form);
      body.set('form-name', form.getAttribute('name'));
      // Empty file slots do not need to be sent in the multipart request.
      slots.forEach(input => { if (!input.files.length) body.delete(input.name); });
      const result = await fetch('/', {
        method: 'POST', body, signal: AbortSignal.timeout(30000)
      });
      if (!result.ok) throw new Error(`Submission failed (${result.status})`);
      window.location.assign('/campaign/thank-you');
    } catch (_) {
      message.textContent = 'Your request could not be confirmed. Your entries are still here. Please complete the CAPTCHA again and retry, or call (281) 397-6614.';
      if (window.grecaptcha) window.grecaptcha.reset();
      submitting = false;
      submit.disabled = false;
      submit.textContent = originalText;
    }
  });
})();
