(() => {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const WA_NUMBER = '919288270459';

  /* ---------- Header, progress bar, floating WhatsApp ---------- */
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.scroll-progress');
  const floatWa = document.querySelector('.float-wa');
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('is-scrolled', y > 8);
    if (progress) progress.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : 0);
    if (floatWa) floatWa.classList.toggle('is-shown', y > window.innerHeight * 0.8);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
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
  window.matchMedia('(min-width: 961px)').addEventListener('change', (e) => { if (e.matches) setNav(false); });

  /* ---------- Hero title stagger ---------- */
  document.querySelectorAll('.hero-title .word').forEach((w, i) => w.style.setProperty('--i', i));

  const hasIO = 'IntersectionObserver' in window;

  /* ---------- Scrollspy ---------- */
  const navLinks = [...nav.querySelectorAll('a[href^="#"]:not(.btn)')];
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

  /* ---------- Founder quote: split into words ---------- */
  document.querySelectorAll('.quote-words p').forEach((p) => {
    const words = p.textContent.trim().split(/\s+/);
    p.setAttribute('aria-label', p.textContent.trim());
    p.textContent = '';
    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.className = 'w';
      span.setAttribute('aria-hidden', 'true');
      span.style.setProperty('--wi', i);
      span.textContent = i < words.length - 1 ? word + ' ' : word;
      p.appendChild(span);
    });
  });

  /* ---------- Auto-stagger groups without explicit delays ---------- */
  document.querySelectorAll('.faq').forEach((group) => {
    [...group.children].forEach((el, i) => el.style.setProperty('--d', `${(i * 0.07).toFixed(2)}s`));
  });

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll('.reveal, .footer-word');
  if (!hasIO || reduceMotion) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- Hero browser: cycles through example sites ---------- */
  const browser = document.querySelector('.hero-visual .browser');
  if (browser) {
    const sites = [
      { url: 'aurelia-jewels.com', kicker: 'New collection', title: 'Timeless pieces, made to last.', cta: 'Shop now' },
      { url: 'olive-and-ember.co', kicker: 'Book a table', title: 'Wood-fired, every night.', cta: 'Reserve' },
      { url: 'northgate-homes.com', kicker: 'Find your home', title: 'Homes worth coming back to.', cta: 'View listings' }
    ];
    const urlEl = browser.querySelector('.url-text');
    const kickerEl = browser.querySelector('.mock-kicker');
    const titleEl = browser.querySelector('.mock-h');
    const ctaEl = browser.querySelector('.mock-cta');
    let idx = 0;

    const show = (i) => {
      const s = sites[i];
      browser.dataset.site = String(i);
      urlEl.textContent = s.url;
      kickerEl.textContent = s.kicker;
      titleEl.textContent = s.title;
      ctaEl.textContent = s.cta;
      browser.classList.remove('is-building');
      void browser.offsetWidth; // restart animation
      browser.classList.add('is-building');
    };

    if (!reduceMotion) {
      setInterval(() => {
        if (document.hidden) return;
        idx = (idx + 1) % sites.length;
        show(idx);
      }, 4200);
    }
  }

  /* ---------- White-label brand swap ---------- */
  const bsWindow = document.querySelector('.bs-window');
  if (bsWindow && !reduceMotion) {
    const brands = [
      { name: 'Your Agency', domain: 'youragency.com' },
      { name: 'Northwind Studio', domain: 'northwind.studio' },
      { name: 'Redline Digital', domain: 'redline.digital' },
      { name: 'Bluepeak Media', domain: 'bluepeak.media' }
    ];
    const names = bsWindow.querySelectorAll('.bs-name');
    const domain = bsWindow.querySelector('.bs-domain');
    let b = 0;

    setInterval(() => {
      if (document.hidden) return;
      b = (b + 1) % brands.length;
      names.forEach((n) => n.classList.add('is-out'));
      domain.classList.add('bs-name', 'is-out');
      setTimeout(() => {
        names.forEach((n) => { n.textContent = brands[b].name; n.classList.remove('is-out'); });
        domain.textContent = brands[b].domain;
        domain.classList.remove('is-out');
        bsWindow.dataset.i = String(b);
      }, 350);
    }, 2600);
  }

  /* ---------- Pointer effects (desktop only) ---------- */
  if (finePointer && !reduceMotion) {
    // Spotlight on cards
    document.querySelectorAll('.spot').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--sx', `${e.clientX - r.left}px`);
        el.style.setProperty('--sy', `${e.clientY - r.top}px`);
      });
    });

    // 3D tilt for mockups
    document.querySelectorAll('.tilt').forEach((el) => {
      const host = el.parentElement;
      const base = getComputedStyle(el);
      const rx0 = parseFloat(base.getPropertyValue('--rx')) || 0;
      const ry0 = parseFloat(base.getPropertyValue('--ry')) || 0;
      host.addEventListener('pointermove', (e) => {
        const r = host.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--rx', `${(-y * 10).toFixed(2)}deg`);
        el.style.setProperty('--ry', `${(x * 14).toFixed(2)}deg`);
      });
      host.addEventListener('pointerleave', () => {
        el.style.setProperty('--rx', `${rx0}deg`);
        el.style.setProperty('--ry', `${ry0}deg`);
      });
    });

    // Magnetic buttons
    document.querySelectorAll('.magnetic').forEach((btn) => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty('--mx', `${((e.clientX - r.left) / r.width - 0.5) * 10}px`);
        btn.style.setProperty('--my', `${((e.clientY - r.top) / r.height - 0.5) * 8}px`);
      });
      btn.addEventListener('pointerleave', () => {
        btn.style.setProperty('--mx', '0px');
        btn.style.setProperty('--my', '0px');
      });
    });

    // Subtle parallax on hero orbs
    const orbs = document.querySelectorAll('.orb');
    window.addEventListener('pointermove', (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      orbs.forEach((o, i) => {
        const k = (i + 1) * 18;
        o.style.translate = `${x * k}px ${y * k}px`;
      });
    }, { passive: true });
  }

  /* ---------- FAQ: one open at a time ---------- */
  const faqs = document.querySelectorAll('.faq details');
  faqs.forEach((d) => {
    d.addEventListener('toggle', () => {
      if (d.open) faqs.forEach((o) => { if (o !== d) o.open = false; });
    });
  });

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

  /* ---------- Links preselect project type / audience ---------- */
  const form = document.getElementById('order-form');
  const typeSelect = document.getElementById('f-type');
  const nameInput = document.getElementById('f-name');
  const nameError = document.getElementById('f-name-error');

  const setAudience = (value) => {
    const radio = form.querySelector(`input[name="audience"][value="${value}"]`);
    if (radio) radio.checked = true;
  };

  document.querySelectorAll('a[data-type], a[data-audience]').forEach((link) => {
    link.addEventListener('click', () => {
      if (link.dataset.type && typeSelect) {
        typeSelect.value = link.dataset.type;
        typeSelect.classList.add('is-highlighted');
        setTimeout(() => typeSelect.classList.remove('is-highlighted'), 1400);
      }
      if (link.dataset.audience) setAudience(link.dataset.audience);
      else if (link.dataset.type === 'White-label (for my agency)') setAudience('Agency');
      setTimeout(() => nameInput.focus({ preventScroll: true }), 700);
    });
  });

  /* ---------- Form → WhatsApp ---------- */
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

    const isAgency = value('audience') === 'Agency';
    const lines = [
      isAgency
        ? "Hi Vikash, I run an agency and I'm interested in white-label web development."
        : "Hi Vikash, I'd like to discuss a website project.",
      '',
      `Name: ${name}`
    ];
    if (value('business')) lines.push(`${isAgency ? 'Agency' : 'Company'}: ${value('business')}`);
    if (value('type')) lines.push(`Project type: ${value('type')}`);
    if (value('budget')) lines.push(`Budget: ${value('budget')}`);
    if (value('message')) lines.push(`Details: ${value('message')}`);

    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
    const win = window.open(url, '_blank');
    if (win) win.opener = null;
    else window.location.href = url;
  });

  /* ---------- Footer year ---------- */
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
