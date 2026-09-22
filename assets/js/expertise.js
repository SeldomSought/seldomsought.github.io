/* Progressive enhancement only: native details and all copy work without JS. */
(function () {
  'use strict';
  const atlas = document.querySelector('.atlas-world');
  if (!atlas) return;
  const places = Array.from(atlas.querySelectorAll('.atlas-place'));
  const index = document.querySelector('.atlas-index');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

  function openPlaceFromHash() {
    const place = places.find(item => '#' + item.id === location.hash);
    if (!place) return;
    places.forEach(item => { item.open = item === place; });
    if (index) index.open = false;
    place.querySelector('summary').focus({ preventScroll: true });
    place.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
  window.addEventListener('hashchange', openPlaceFromHash);
  if (location.hash) openPlaceFromHash();

  places.forEach(place => {
    // Close siblings before native activation; the details name also enforces
    // exclusivity without JavaScript in browsers supporting grouped details.
    place.querySelector('summary').addEventListener('click', () => {
      if (!place.open) places.forEach(other => { if (other !== place) other.open = false; });
    });
    place.addEventListener('keydown', event => {
      if (event.key === 'Escape' && place.open) {
        place.open = false;
        place.querySelector('summary').focus({ preventScroll: true });
      }
    });
    // At most two pixels of displacement, only while actively pointing at a drawing.
    const drawing = place.querySelector('.specimen');
    let frame = 0;
    place.addEventListener('pointermove', event => {
      if (reduceMotion.matches || !finePointer.matches || event.pointerType === 'touch') return;
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = drawing.getBoundingClientRect();
        const x = Math.max(-1.5, Math.min(1.5, ((event.clientX - box.left) / box.width - .5) * 3));
        const y = Math.max(-1.5, Math.min(1.5, ((event.clientY - box.top) / box.height - .5) * 3));
        drawing.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
        frame = 0;
      });
    });
    place.addEventListener('pointerleave', () => {
      cancelAnimationFrame(frame); frame = 0;
      drawing.style.transform = '';
    });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && index && index.open) {
      index.open = false;
      index.querySelector('summary').focus();
    }
  });
  document.addEventListener('click', event => {
    if (index && index.open && !index.contains(event.target)) index.open = false;
  });
  reduceMotion.addEventListener('change', () => {
    places.forEach(place => { place.querySelector('.specimen').style.transform = ''; });
  });
}());
