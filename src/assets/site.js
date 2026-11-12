// Hamburger menu, dark-mode switch, contact reveal, and category filters. No dependencies.

// --- hamburger ---
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('site-nav');

function setMenu(open) {
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  nav.classList.toggle('is-open', open);
}

if (toggle && nav) {
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  // Escape closes the menu and returns focus to the button
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
  });
  // clicking a link closes it; resizing to desktop resets it
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  matchMedia('(min-width: 761px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });
}

// --- dark mode (defaults to the system setting) ---
const themeBtn = document.querySelector('.theme-toggle');
const root = document.documentElement;
const isDark = () => root.dataset.theme
  ? root.dataset.theme === 'dark'
  : matchMedia('(prefers-color-scheme: dark)').matches;

function syncTheme() { themeBtn.setAttribute('aria-checked', String(isDark())); }

if (themeBtn) {
  syncTheme();
  themeBtn.addEventListener('click', () => {
    root.dataset.theme = isDark() ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch {}
    syncTheme();
  });
}

// --- contact: reveal the email underneath; clicking the email copies it ---
const contactBtn = document.querySelector('.contact-btn');
const contactRow = document.getElementById('contact-email');
if (contactBtn && contactRow) {
  const copyBtn = contactRow.querySelector('.copy-email');
  const status = contactRow.querySelector('[aria-live]');
  // the address is assembled here so it never sits in the HTML for scrapers
  const email = copyBtn.dataset.user + '@' + copyBtn.dataset.domain;
  let resetTimer;

  contactBtn.addEventListener('click', () => {
    const open = contactBtn.getAttribute('aria-expanded') !== 'true';
    contactBtn.setAttribute('aria-expanded', String(open));
    contactRow.hidden = !open;
    if (open) {
      copyBtn.querySelector('.copy-email-text').textContent = email;
      copyBtn.setAttribute('aria-label', `${email}, copy to clipboard`);
    }
  });

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      location.href = 'mailto:' + email; // clipboard blocked: fall back to opening their mail app
      return;
    }
    copyBtn.classList.add('is-copied');
    status.textContent = 'Email copied';
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => { copyBtn.classList.remove('is-copied'); status.textContent = ''; }, 2000);
  });
}

// --- home photo: tap to see it in color on phones (hover does it on desktop) ---
const homePhoto = document.querySelector('.about-photo');
if (homePhoto) homePhoto.addEventListener('click', () => homePhoto.classList.toggle('is-color'));

// --- category filters (reading, work) ---
// Buttons in .filters show only items whose data-tags include that category.
// The choice is kept in the URL (e.g. /reading/#loved) so it can be shared.
const filters = document.querySelector('.filters');
if (filters) {
  const buttons = [...filters.querySelectorAll('button')];
  const items = [...document.querySelectorAll('main [data-tags]')];
  const sections = [...document.querySelectorAll('main .section')];
  const status = document.querySelector('[data-filter-status]');

  function show(name, updateUrl) {
    if (!buttons.some((b) => b.dataset.filter === name)) name = 'all';
    let shown = 0;
    for (const el of items) {
      const match = el.dataset.tags.split(' ').includes(name);
      el.hidden = !match;
      if (match) shown++;
    }
    // hide a section heading when nothing under it matches
    for (const s of sections) {
      const own = s.querySelectorAll('[data-tags]');
      if (own.length) s.hidden = [...own].every((el) => el.hidden);
    }
    for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.filter === name));
    if (status) status.textContent = `Showing ${shown} ${shown === 1 ? 'item' : 'items'}`;
    if (updateUrl) history.pushState(null, '', name === 'all' ? location.pathname : '#' + name);
  }

  filters.hidden = false;
  filters.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (b) show(b.dataset.filter, true);
  });
  show(location.hash.slice(1) || 'all', false);
  addEventListener('popstate', () => show(location.hash.slice(1) || 'all', false));
}
