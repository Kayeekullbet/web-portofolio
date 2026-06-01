const navToggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.menu');
const navLinks = document.querySelectorAll('.menu a');
const reveals = document.querySelectorAll('.reveal');
const toTop = document.querySelector('.to-top');
const contactForm = document.querySelector('#contactForm');
const cursorHalo = document.querySelector('.cursor-halo');
const hobbyScroll = document.querySelector('.hobby-scroll');
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (navToggle && menu) {
  navToggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  });
  navLinks.forEach(link => link.addEventListener('click', () => {
    menu.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }));
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', event => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  });
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.16 });
reveals.forEach(item => revealObserver.observe(item));

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.getAttribute('id');
    navLinks.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`));
  });
}, { rootMargin: '-42% 0px -48% 0px', threshold: 0 });
document.querySelectorAll('section[id]').forEach(section => sectionObserver.observe(section));

window.addEventListener('scroll', () => {
  toTop?.classList.toggle('show', window.scrollY > 520);
}, { passive: true });

function initRipple() {
  document.querySelectorAll('.btn, .send, .project-links a, .social-links a, .filter-btn, .to-top').forEach(button => {
    button.addEventListener('click', event => {
      const rect = button.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;
      button.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });
}

function initMagneticButtons() {
  if (prefersReducedMotion || window.matchMedia('(pointer: coarse)').matches) return;
  document.querySelectorAll('.magnetic').forEach(item => {
    item.addEventListener('mousemove', event => {
      const rect = item.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      item.style.transform = `translate(${x * 0.08}px, ${y * 0.12}px)`;
    });
    item.addEventListener('mouseleave', () => { item.style.transform = ''; });
  });
}

function initCursorHalo() {
  if (!cursorHalo || prefersReducedMotion || window.matchMedia('(pointer: coarse)').matches) return;
  let tx = innerWidth / 2, ty = innerHeight / 2, cx = tx, cy = ty, raf = null;
  window.addEventListener('pointermove', event => { tx = event.clientX; ty = event.clientY; }, { passive: true });
  function tick() {
    cx += (tx - cx) * 0.1;
    cy += (ty - cy) * 0.1;
    cursorHalo.style.transform = `translate3d(${cx - 180}px, ${cy - 180}px, 0)`;
    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && raf) cancelAnimationFrame(raf);
    if (!document.hidden) raf = requestAnimationFrame(tick);
  });
}

function initHobbyDrag() {
  if (!hobbyScroll) return;
  let isDown = false, startX = 0, scrollLeft = 0;
  hobbyScroll.addEventListener('pointerdown', event => {
    isDown = true;
    startX = event.clientX;
    scrollLeft = hobbyScroll.scrollLeft;
    hobbyScroll.classList.add('dragging');
    hobbyScroll.setPointerCapture?.(event.pointerId);
  });
  hobbyScroll.addEventListener('pointermove', event => {
    if (!isDown) return;
    event.preventDefault();
    hobbyScroll.scrollLeft = scrollLeft - (event.clientX - startX);
  });
  function stop(event) {
    if (!isDown) return;
    isDown = false;
    hobbyScroll.classList.remove('dragging');
    try { hobbyScroll.releasePointerCapture?.(event.pointerId); } catch (_) {}
  }
  hobbyScroll.addEventListener('pointerup', stop);
  hobbyScroll.addEventListener('pointercancel', stop);
  hobbyScroll.addEventListener('pointerleave', stop);
}



function initRobotTracker() {
  const robot = document.querySelector('.robot-pro');
  if (!robot || prefersReducedMotion || window.matchMedia('(pointer: coarse)').matches) return;

  let targetX = 0, targetY = 0, currentX = 0, currentY = 0, raf = null;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  window.addEventListener('pointermove', event => {
    const rect = robot.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    targetX = clamp((event.clientX - centerX) / 26, -5, 5);
    targetY = clamp((event.clientY - centerY) / 30, -4, 4);
  }, { passive: true });

  function tick() {
    currentX += (targetX - currentX) * 0.16;
    currentY += (targetY - currentY) * 0.16;
    robot.style.setProperty('--head-x', currentX.toFixed(2));
    robot.style.setProperty('--head-y', currentY.toFixed(2));
    robot.style.setProperty('--head-rot', (currentX * 0.9).toFixed(2));
    robot.style.setProperty('--eye-x', (currentX * 1.35).toFixed(2));
    robot.style.setProperty('--eye-y', (currentY * 1.1).toFixed(2));
    raf = requestAnimationFrame(tick);
  }

  raf = requestAnimationFrame(tick);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && raf) cancelAnimationFrame(raf);
    if (!document.hidden) raf = requestAnimationFrame(tick);
  });
}

function initProjectFilters() {
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filterButtons.forEach(btn => btn.classList.toggle('is-active', btn === button));
      projectCards.forEach(card => {
        const match = filter === 'all' || card.dataset.category.split(' ').includes(filter);
        card.classList.toggle('is-hidden', !match);
      });
    });
  });
}

contactForm?.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const subject = data.get('subject') || 'Portfolio Contact';
  const body = [`Name: ${data.get('name') || ''}`, `Email: ${data.get('email') || ''}`, '', data.get('message') || ''].join('\n');
  window.location.href = `mailto:andirezki.awan@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

initRipple();
initMagneticButtons();
initCursorHalo();
initHobbyDrag();
initProjectFilters();
initRobotTracker();
