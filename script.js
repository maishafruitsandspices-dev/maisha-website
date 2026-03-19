/* ═══════════════════════════════════════════════
   MAISHA  ·  script.js
   ═══════════════════════════════════════════════ */

'use strict';

// ─── 1. NAV: scroll state + active link ──────────────────────────────────
const nav      = document.getElementById('nav');
const navLinks = document.querySelectorAll('.nav__link[data-nav]');
const sections = document.querySelectorAll('section[id]');

const updateNav = () => {
  const scrolled = window.scrollY > 48;
  nav.classList.toggle('scrolled', scrolled);

  let active = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 100) active = s.id;
  });
  navLinks.forEach(l => l.classList.toggle('active', l.dataset.nav === active));
};

window.addEventListener('scroll', updateNav, { passive: true });
updateNav();


// ─── 2. MOBILE BURGER ────────────────────────────────────────────────────
const burger  = document.getElementById('burger');
const navMenu = document.getElementById('nav-links');

burger.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
});

navMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navMenu.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', false);
    document.body.style.overflow = '';
  });
});

document.addEventListener('click', e => {
  if (!nav.contains(e.target) && navMenu.classList.contains('open')) {
    navMenu.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', false);
    document.body.style.overflow = '';
  }
});


// ─── 3. SMOOTH SCROLL ────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const y = target.getBoundingClientRect().top + window.scrollY - 76;
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
});


// ─── 4. SCROLL REVEAL ────────────────────────────────────────────────────
const revealEls = document.querySelectorAll('.reveal');

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    // Stagger siblings with same parent
    const siblings = [...(entry.target.parentElement?.children ?? [])]
      .filter(el => el.classList.contains('reveal') && !el.classList.contains('visible'));

    const idx = [...entry.target.parentElement?.children ?? []].indexOf(entry.target);
    const delay = Math.min(idx * 70, 300);

    setTimeout(() => entry.target.classList.add('visible'), delay);
    revealObs.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObs.observe(el));


// ─── 5. STAT COUNTER ANIMATION ───────────────────────────────────────────
const statNums = document.querySelectorAll('.stat__num');

const counterObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    animateCount(entry.target);
    counterObs.unobserve(entry.target);
  });
}, { threshold: 0.6 });

statNums.forEach(el => counterObs.observe(el));

function animateCount(el) {
  // Grab text from the direct text node only (skip <sup>)
  const textNode = [...el.childNodes].find(n => n.nodeType === 3);
  if (!textNode) return;

  const raw    = textNode.textContent.trim();
  const target = parseFloat(raw.replace(/[^\d.]/g, ''));
  if (isNaN(target)) return;

  const sup = el.querySelector('sup');
  const suffix = sup ? sup.textContent : '';

  const duration = 1600;
  const fps      = 60;
  const total    = Math.round((duration / 1000) * fps);
  let   frame    = 0;

  const easeOut = t => 1 - Math.pow(1 - t, 3);

  const tick = () => {
    frame++;
    const progress = easeOut(frame / total);
    const value    = Math.round(target * progress);
    textNode.textContent = value;
    if (frame < total) requestAnimationFrame(tick);
    else textNode.textContent = target;
  };

  requestAnimationFrame(tick);
}


// ─── 6. CONTACT FORM ─────────────────────────────────────────────────────
const form    = document.getElementById('contact-form');
const success = document.getElementById('form-success');
const submitBtn = document.getElementById('submit-btn');

if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();

    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      flashError(form);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      flashError(form.email);
      return;
    }

    const orig = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Sending…';
    submitBtn.disabled  = true;

    setTimeout(() => {
      form.reset();
      submitBtn.innerHTML = orig;
      submitBtn.disabled  = false;
      success.classList.add('visible');
      setTimeout(() => success.classList.remove('visible'), 6000);
    }, 1300);
  });
}

function flashError(el) {
  el.animate([
    { transform: 'translateX(0)' },
    { transform: 'translateX(-8px)' },
    { transform: 'translateX(8px)' },
    { transform: 'translateX(-5px)' },
    { transform: 'translateX(5px)' },
    { transform: 'translateX(0)' },
  ], { duration: 380, easing: 'ease-out' });
}


// ─── 7. ORBIT: pause on hover ────────────────────────────────────────────
const ring = document.querySelector('.orbit__ring');
if (ring) {
  ring.addEventListener('mouseenter', () => ring.style.animationPlayState = 'paused');
  ring.addEventListener('mouseleave', () => ring.style.animationPlayState = 'running');
}


// ─── 8. PRODUCT CARDS: subtle tilt on mouse move ─────────────────────────
document.querySelectorAll('.pcard').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r  = card.getBoundingClientRect();
    const x  = (e.clientX - r.left) / r.width  - 0.5;
    const y  = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform = `translateY(-8px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.6s var(--ease)';
    setTimeout(() => card.style.transition = '', 600);
  });
});


// ─── 9. PAGE LOAD: stagger hero children ─────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');
});
