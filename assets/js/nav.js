(function () {
  'use strict';

  var toggle = document.getElementById('siteMenuToggle');
  var menu   = document.getElementById('siteMobileMenu');
  var header = document.getElementById('siteHeader');

  if (!toggle || !menu) return;

  function openMenu() {
    menu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    toggle.textContent = '✕'; // ✕
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    toggle.textContent = '☰'; // ☰
  }

  toggle.addEventListener('click', function (e) {
    e.stopPropagation();
    menu.classList.contains('is-open') ? closeMenu() : openMenu();
  });

  /* Close on outside click */
  document.addEventListener('click', function (e) {
    if (header && !header.contains(e.target)) closeMenu();
  });

  /* Close after clicking a mobile nav link */
  var links = menu.querySelectorAll('a');
  links.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* Close on Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
      toggle.focus();
    }
  });

  /* Mark current page link with aria-current="page" */
  var path = window.location.pathname;
  /* normalise: strip leading slash, treat '' and '/' as index.html */
  var current = path.replace(/^\//, '') || 'index.html';
  /* GitHub Pages serves directory roots as index.html */
  if (current.slice(-1) === '/') current += 'index.html';

  var allLinks = document.querySelectorAll(
    '.site-header__nav a, .site-header__mobile a'
  );
  allLinks.forEach(function (a) {
    var href = (a.getAttribute('href') || '').replace(/^\//, '');
    if (href && href === current) {
      a.setAttribute('aria-current', 'page');
    }
  });
}());
