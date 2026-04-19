'use strict';

/* PRELOADER */
document.body.style.overflow = 'hidden';
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('preloader')?.classList.add('out');
    document.body.style.overflow = '';
    setTimeout(animCounters, 900);
  }, 1600);
});

/* THEME */
(function () {
  const saved = localStorage.getItem('ks-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  const btn = document.getElementById('themeBtn');
  if (btn) btn.textContent = saved === 'dark' ? '🌙' : '☀️';
})();
document.getElementById('themeBtn')?.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  document.getElementById('themeBtn').textContent = next === 'dark' ? '🌙' : '☀️';
  localStorage.setItem('ks-theme', next);
});

/* CURSOR */
const cur = document.getElementById('cur'), curR = document.getElementById('cur-r');
if (cur && curR && window.matchMedia('(hover:hover)').matches) {
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cur.style.left = mx + 'px'; cur.style.top = my + 'px';
  });
  (function loop() { rx += (mx-rx)*.13; ry += (my-ry)*.13; curR.style.left=rx+'px'; curR.style.top=ry+'px'; requestAnimationFrame(loop); })();
}

/* HAMBURGER */
const ham = document.getElementById('ham'), mobNav = document.getElementById('mobNav');
if (ham && mobNav) {
  ham.addEventListener('click', () => {
    const open = mobNav.classList.toggle('open');
    ham.textContent = open ? '✕' : '☰';
    ham.setAttribute('aria-expanded', open);
  });
  document.querySelectorAll('.mob-nav a').forEach(a => a.addEventListener('click', () => {
    mobNav.classList.remove('open'); ham.textContent = '☰';
  }));
}

/* SCROLL REVEAL */
const ro = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('on'); }), { threshold: .1 });
document.querySelectorAll('.rev').forEach(el => ro.observe(el));

/* COUNTER ANIMATION */
function animNum(id, target, suffix, isFloat) {
  const el = document.getElementById(id); if (!el) return;
  const dur = 1500, t0 = performance.now();
  (function step(now) {
    const p = Math.min((now-t0)/dur,1), ease = 1-Math.pow(1-p,3);
    const val = isFloat ? (ease*target).toFixed(1) : Math.round(ease*target);
    el.innerHTML = val + (suffix ? `<s>${suffix}</s>` : '');
    if (p < 1) requestAnimationFrame(step);
    else el.innerHTML = (isFloat ? target.toFixed(1) : target) + (suffix ? `<s>${suffix}</s>` : '');
  })(t0);
}
function animCounters() {
  animNum('cnt-proj', 6,  '+');
  animNum('cnt-int',  3,  '+');
  animNum('cnt-ml',  90,  '%');
  animNum('cnt-cgpa', 8.5, '', true);
}

/* MODAL */
function closeModal() {
  document.getElementById('overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('overlay')?.addEventListener('click', e => { if (e.target.id==='overlay') closeModal(); });
document.addEventListener('keydown', e => { if (e.key==='Escape') closeModal(); });

/* SMOOTH SCROLL */
document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const target = document.querySelector(a.getAttribute('href'));
  if (target) { e.preventDefault(); target.scrollIntoView({behavior:'smooth',block:'start'}); }
}));

/* TOAST */
function showToast(msg, type) {
  document.getElementById('ks-toast')?.remove();
  const t = document.createElement('div');
  t.id = 'ks-toast'; t.setAttribute('role','alert');
  t.className = 'ks-toast ks-toast-'+(type||'success');
  t.innerHTML = `<span>${type==='error'?'❌':'✅'}</span> ${msg}`;
  document.body.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 4200);
}