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
  form.addEventListener('submit', event => {
    if (!validateUploads()) {
      event.preventDefault();
      error.textContent = 'Please select up to 10 files with a combined size under 7 MB.';
      return;
    }
    const container = form.querySelector('.campaign-recaptcha');
    const widgetId = container.dataset.widgetId;
    if (!window.grecaptcha || widgetId === undefined || !window.grecaptcha.getResponse(Number(widgetId))) {
      event.preventDefault();
      document.querySelector('#captcha-error').textContent = 'Please complete the CAPTCHA before sending your request.';
      container.scrollIntoView({ block: 'center' });
    } else {
      document.querySelector('#captcha-error').textContent = '';
    }
  });
})();
