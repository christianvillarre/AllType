(() => {
  const header = document.querySelector('.site-header');
  if (!header || header.classList.contains('nav-refreshed')) return;
  const inner = header.querySelector('.header-inner');
  if (!inner) return;
  const mobile = matchMedia('(max-width: 800px)');
  let nav = header.querySelector('.primary-nav');
  if (!nav) {
    nav = document.createElement('nav');
    nav.className = 'primary-nav';
    nav.setAttribute('aria-label', 'Primary navigation');
    const call = inner.querySelector('a[href^="tel:"]');
    if (call) { call.classList.add('nav-call'); nav.append(call); }
    inner.append(nav);
  }
  nav.id = nav.id || 'primary-nav';
  nav.setAttribute('data-lenis-prevent', '');
  let contact = nav.querySelector('a[href="/contact"],a[href="/contact.html"]');
  if (!contact) {
    contact = document.createElement('a');
    contact.href = '/contact.html';
    contact.textContent = 'Contact';
    nav.insertBefore(contact, nav.querySelector('.nav-call'));
  }
  contact.classList.add('button', 'small', 'nav-contact');
  if (!nav.querySelector('.nav-group')) {
    [['Roofing', '/services/commercial-roofing.html'], ['Construction', '/services/commercial-construction.html'], ['Projects', '/projects.html'], ['About', '/about.html']].forEach(([label, href]) => {
      const link = document.createElement('a');
      link.className = 'mobile-site-link';
      link.textContent = label;
      link.href = href;
      nav.insertBefore(link, contact);
    });
  }
  nav.querySelectorAll('.nav-dropdown > p').forEach(title => title.remove());
  const constructionOrder = [
    '/services/commercial-construction',
    '/services/commercial-painting',
    '/services/commercial-waterproofing',
    '/services/emergency-commercial-building-repair',
    '/services/commercial-property-maintenance-repairs/stucco-eifs-repair',
    '/services/commercial-property-maintenance-repairs/concrete-masonry-repair',
    '/services/commercial-property-maintenance-repairs',
    '/services/commercial-storm-damage-repair',
    '/services/commercial-construction/tenant-improvements'
  ];
  nav.querySelectorAll('.nav-group').forEach(group => {
    if (group.querySelector('summary').textContent.trim() !== 'Construction') return;
    const dropdown = group.querySelector('.nav-dropdown');
    const links = Array.from(dropdown.querySelectorAll('a'));
    const rank = link => {
      const path = new URL(link.href, window.location.origin).pathname.replace(/\.html$/, '');
      const index = constructionOrder.indexOf(path);
      return index < 0 ? constructionOrder.length : index;
    };
    links.sort((a, b) => rank(a) - rank(b)).forEach(link => dropdown.append(link));
  });

  let toggle = header.querySelector('.mobile-toggle');
  if (!toggle) {
    toggle = document.createElement('button');
    toggle.className = 'mobile-toggle';
    toggle.type = 'button';
    inner.insertBefore(toggle, nav);
  }
  toggle.innerHTML = '<span></span><span></span><span></span>';
  toggle.setAttribute('aria-controls', nav.id);
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open menu');
  const groups = Array.from(nav.querySelectorAll('.nav-group'));
  const closeGroups = except => groups.forEach(group => { if (group !== except) group.open = false; });
  let savedOverflow = '';
  let savedRootOverflow = '';
  let background = [];
  const isOpen = () => nav.classList.contains('is-open');
  function closeMenu(returnFocus = false) {
    const wasOpen = isOpen();
    nav.classList.remove('is-open');
    header.classList.remove('menu-open');
    document.body.classList.remove('nav-menu-open');
    nav.removeAttribute('role');
    nav.removeAttribute('aria-modal');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    if (wasOpen) {
      document.body.style.overflow = savedOverflow;
      document.documentElement.style.overflow = savedRootOverflow;
      background.forEach(([node, inert]) => { node.inert = inert; });
      background = [];
    }
    closeGroups();
    if (wasOpen && returnFocus) toggle.focus();
  }
  toggle.addEventListener('click', () => {
    if (isOpen()) { closeMenu(true); return; }
    if (!mobile.matches) return;
    savedOverflow = document.body.style.overflow;
    savedRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    background = Array.from(document.querySelectorAll('body > main, body > footer, body > .utility')).map(node => [node, node.inert]);
    background.forEach(([node]) => { node.inert = true; });
    nav.classList.add('is-open');
    header.classList.add('menu-open');
    document.body.classList.add('nav-menu-open');
    nav.setAttribute('role', 'dialog');
    nav.setAttribute('aria-modal', 'true');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
  });
  groups.forEach(group => {
    let timer;
    group.querySelector('summary').addEventListener('click', () => closeGroups(group));
    group.addEventListener('pointerenter', event => {
      if (mobile.matches || event.pointerType !== 'mouse') return;
      clearTimeout(timer); closeGroups(group); group.open = true;
    });
    group.addEventListener('pointerleave', () => {
      if (mobile.matches) return;
      timer = setTimeout(() => { if (!group.contains(document.activeElement)) group.open = false; }, 160);
    });
    group.addEventListener('focusout', () => {
      if (mobile.matches) return;
      timer = setTimeout(() => { if (!group.contains(document.activeElement) && !group.matches(':hover')) group.open = false; }, 160);
    });
  });
  document.addEventListener('click', event => { if (!header.contains(event.target)) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { closeMenu(true); return; }
    if (event.key !== 'Tab' || !isOpen()) return;
    const focusable = Array.from(header.querySelectorAll('a,button,summary')).filter(node => node.getClientRects().length);
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  mobile.addEventListener('change', () => closeMenu());
  header.classList.add('nav-refreshed');
})();
