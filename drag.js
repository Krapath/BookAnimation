// drag.js — external flip interaction (click & drag, mouse + touch)
(function(){
  const pages = Array.from(document.querySelectorAll('.page'));
  const flips = Array.from(document.querySelectorAll('.flip'));
  const book = document.querySelector('.book');

  // disable CSS auto-animations that were used for the autoplay version
  pages.forEach(p => p.style.animation = 'none');
  flips.forEach(f => f.style.animation = 'none');

  let current = 0;

  function updateStack() {
    pages.forEach((p, i) => {
      if (i < current) {
        p.style.transform = 'rotateY(-180deg)';
        p.style.zIndex = 2 + (current - i);
      } else {
        p.style.transform = 'rotateY(0deg)';
        p.style.zIndex = 1;
      }
      p.style.transition = ''; // clear any transition
    });
  }

  function goTo(i) {
    if (i < 0) i = 0;
    if (i >= pages.length) i = pages.length - 1;
    current = i;
    updateStack();
  }

  // initial stack
  updateStack();

  // click flips (keep simple: click each flip to jump pages)
  flips.forEach((flip, i) => {
    flip.addEventListener('click', () => {
      goTo(i);
    });
  });

  // Drag-to-flip implementation
  let dragging = false;
  let startX = 0;
  let flipDir = null; // 'forward' or 'back'

  function rect() { return book.getBoundingClientRect(); }

  function onStart(e) {
    const clientX = (e.touches ? e.touches[0].clientX : e.clientX);
    startX = clientX;
    dragging = true;
    const r = rect();
    const relative = clientX - r.left;
    if (relative > r.width / 2 && current < pages.length - 1) flipDir = 'forward';
    else if (relative <= r.width / 2 && current > 0) flipDir = 'back';
    else flipDir = null;
  }

  function onMove(e) {
    if (!dragging || !flipDir) return;
    const clientX = (e.touches ? e.touches[0].clientX : e.clientX);
    const r = rect();
    const half = r.width / 2;
    if (flipDir === 'forward') {
      const page = pages[current];
      const delta = startX - clientX; // drag left -> positive
      const progress = Math.max(0, Math.min(1, delta / half));
      const deg = -progress * 180;
      page.style.transformOrigin = '100% 50%';
      page.style.transform = `rotateY(${deg}deg)`;
      page.style.zIndex = 20;
    } else {
      const page = pages[current - 1];
      const delta = clientX - startX; // drag right -> positive
      const progress = Math.max(0, Math.min(1, delta / half));
      const deg = 180 - progress * 180;
      page.style.transformOrigin = '100% 50%';
      page.style.transform = `rotateY(${deg}deg)`;
      page.style.zIndex = 20;
    }
  }

  function onEnd(e) {
    if (!dragging) return;
    dragging = false;
    if (!flipDir) return;
    const r = rect();
    const clientX = (e.changedTouches ? e.changedTouches[0].clientX : e.clientX);
    const half = r.width / 2;
    const threshold = 0.35;
    if (flipDir === 'forward') {
      const delta = startX - clientX;
      const progress = Math.max(0, Math.min(1, delta / half));
      const page = pages[current];
      if (progress > threshold) {
        page.style.transition = 'transform 220ms ease-out';
        page.style.transform = 'rotateY(-180deg)';
        setTimeout(() => { page.style.transition = ''; goTo(current + 1); }, 230);
      } else {
        page.style.transition = 'transform 220ms ease-out';
        page.style.transform = 'rotateY(0deg)';
        setTimeout(() => { page.style.transition = ''; updateStack(); }, 230);
      }
    } else {
      const delta = clientX - startX;
      const progress = Math.max(0, Math.min(1, delta / half));
      const page = pages[current - 1];
      if (progress > threshold) {
        page.style.transition = 'transform 220ms ease-out';
        page.style.transform = 'rotateY(0deg)';
        setTimeout(() => { page.style.transition = ''; goTo(current - 1); }, 230);
      } else {
        page.style.transition = 'transform 220ms ease-out';
        page.style.transform = 'rotateY(-180deg)';
        setTimeout(() => { page.style.transition = ''; updateStack(); }, 230);
      }
    }
    flipDir = null;
  }

  book.addEventListener('mousedown', onStart);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onEnd);
  book.addEventListener('touchstart', onStart, {passive:true});
  window.addEventListener('touchmove', onMove, {passive:true});
  window.addEventListener('touchend', onEnd, {passive:true});

  // allow keyboard navigation as fallback
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') goTo(Math.min(current + 1, pages.length -1));
    if (e.key === 'ArrowLeft') goTo(Math.max(current - 1, 0));
  });

})();
