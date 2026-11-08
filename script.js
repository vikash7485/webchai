(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const WA_NUMBER = '919288270459';
  const WA_GREETING = 'Hi Vikash, I want a website from WebChai';

  /* ---------- Theme toggle ---------- */
  const themeBtn = document.querySelector('.theme-toggle');
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  const currentTheme = () => root.dataset.theme || (darkQuery.matches ? 'dark' : 'light');

  const syncTheme = () => {
    const isDark = currentTheme() === 'dark';
    themeBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    if (themeMeta) themeMeta.setAttribute('content', isDark ? '#0C4644' : '#0E5A57');
  };

  themeBtn.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('webchai-theme', next); } catch (e) { /* storage unavailable */ }
    syncTheme();
  });
  darkQuery.addEventListener('change', syncTheme);
  syncTheme();

  /* ---------- Header shadow ---------- */
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  const nav = document.getElementById('site-nav');
  const navToggle = document.querySelector('.nav-toggle');
  const navToggleIcon = navToggle.querySelector('use');

  const setNav = (open) => {
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    navToggleIcon.setAttribute('href', open ? '#i-close' : '#i-menu');
  };

  navToggle.addEventListener('click', () => setNav(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('is-open') && !header.contains(e.target)) setNav(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setNav(false);
      navToggle.focus();
    }
  });
  window.matchMedia('(min-width: 1000px)').addEventListener('change', (e) => { if (e.matches) setNav(false); });

  /* ---------- Scrollspy ---------- */
  const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
  const hasIO = 'IntersectionObserver' in window;

  if (hasIO) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const link = navLinks.find((a) => a.getAttribute('href') === '#' + entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach((a) => a.removeAttribute('aria-current'));
          link.setAttribute('aria-current', 'true');
        } else if (link.hasAttribute('aria-current')) {
          link.removeAttribute('aria-current');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    navLinks.forEach((a) => {
      const section = document.querySelector(a.getAttribute('href'));
      if (section) spy.observe(section);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');

  if (!hasIO || reduceMotion.matches) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- Typing demo ---------- */
  const typeEl = document.querySelector('.type-text');

  if (typeEl && !reduceMotion.matches) {
    const full = typeEl.dataset.text || typeEl.textContent;
    let i = 0;
    let deleting = false;

    const tick = () => {
      typeEl.textContent = full.slice(0, i);
      let delay = deleting ? 55 : 120;

      if (!deleting && i === full.length) {
        deleting = true;
        delay = 1700;
      } else if (deleting && i === 0) {
        deleting = false;
        delay = 600;
      } else {
        i += deleting ? -1 : 1;
      }
      setTimeout(tick, delay);
    };
    tick();
  }

  /* ---------- Hover lift demo ---------- */
  const liftDemo = document.querySelector('.demo-lift');

  if (liftDemo) {
    const card = liftDemo.querySelector('.lift-card');

    liftDemo.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || reduceMotion.matches) return;
      const r = liftDemo.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.setProperty('--rx', `${(-y * 20).toFixed(2)}deg`);
      card.style.setProperty('--ry', `${(x * 24).toFixed(2)}deg`);
    });
    liftDemo.addEventListener('pointerleave', () => {
      card.style.removeProperty('--rx');
      card.style.removeProperty('--ry');
    });
    liftDemo.addEventListener('pointerup', (e) => {
      if (e.pointerType !== 'mouse') liftDemo.classList.toggle('is-active');
    });
  }

  /* ---------- Copy number ---------- */
  const copyStatus = document.getElementById('copy-status');

  const copyText = async (value) => {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = value;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      ta.remove();
      return ok;
    }
  };

  document.querySelectorAll('[data-copy]').forEach((btn) => {
    const label = btn.querySelector('.copy-label');
    const original = label.textContent;
    let timer;

    btn.addEventListener('click', async () => {
      const ok = await copyText(btn.dataset.copy);
      label.textContent = ok ? 'Copied!' : 'Copy failed';
      btn.classList.toggle('is-copied', ok);
      if (copyStatus) copyStatus.textContent = ok ? 'Phone number copied' : 'Could not copy the number';
      clearTimeout(timer);
      timer = setTimeout(() => {
        label.textContent = original;
        btn.classList.remove('is-copied');
        if (copyStatus) copyStatus.textContent = '';
      }, 2200);
    });
  });

  /* ---------- Menu items preselect website type ---------- */
  const typeSelect = document.getElementById('f-type');
  const nameInput = document.getElementById('f-name');

  document.querySelectorAll('a[data-type]').forEach((link) => {
    link.addEventListener('click', () => {
      if (typeSelect) {
        typeSelect.value = link.dataset.type;
        typeSelect.classList.add('is-highlighted');
        setTimeout(() => typeSelect.classList.remove('is-highlighted'), 1400);
      }
      setTimeout(() => {
        if (nameInput) nameInput.focus();
      }, 400);
    });
  });

  /* ---------- Order form → WhatsApp ---------- */
  const form = document.getElementById('order-form');
  const nameError = document.getElementById('f-name-error');

  const setNameError = (show) => {
    nameError.hidden = !show;
    if (show) nameInput.setAttribute('aria-invalid', 'true');
    else nameInput.removeAttribute('aria-invalid');
  };

  nameInput.addEventListener('input', () => { if (nameInput.value.trim()) setNameError(false); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const value = (key) => String(data.get(key) || '').trim();

    const name = value('name');
    if (!name) {
      setNameError(true);
      nameInput.focus();
      return;
    }
    setNameError(false);

    const lines = [`${WA_GREETING}.`, '', `Name: ${name}`];
    if (value('business')) lines.push(`Business: ${value('business')}`);
    if (value('type')) lines.push(`Website type: ${value('type')}`);
    if (value('message')) lines.push(`Message: ${value('message')}`);

    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
    const win = window.open(url, '_blank');
    if (win) win.opener = null;
    else window.location.href = url;
  });
})();
