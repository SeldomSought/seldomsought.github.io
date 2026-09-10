(function () {
  'use strict';

  if (typeof PROJECTS === 'undefined') return;
  var presentation = {
    'self-cartography': { number: '01', name: 'Self Cartography', action: 'Take the assessment' },
    'focus-shield': { number: '02', name: 'Focus Shield', note: 'A little more intention', description: 'Give your attention some breathing room. Limit passive feeds while keeping your bookmarks and creation tools within reach.', action: 'Download ZIP' },
    'bookmark-mirror': { number: '03', name: 'Bookmark Mirror', note: 'Follow your curiosity', description: 'There’s a pattern in what catches your eye. Explore the interests, recurring topics, and changing themes in your Twitter/X bookmarks.', action: 'Download ZIP' },
    'curated-feed': { number: '04', name: 'Curated Feed', note: 'A different way of seeing', description: 'Photography, found objects, and everyday moments, arranged by color. An ongoing visual archive that wanders through the spectrum.', action: 'Explore the feed' },
    'psychometrics-battery': { number: '05', name: 'Psychometric Battery', note: 'Where it started', description: 'The original assessment experiment, exploring personality, values, and attachment. Preserved as the first edition; Self Cartography is the current test.', action: 'Open original assessment', edition: 'First edition' }
  };
  var catalog = {};
  PROJECTS.forEach(function (project) { catalog[project.id] = project; });
  var order = ['focus-shield', 'bookmark-mirror', 'curated-feed', 'psychometrics-battery'];
  var grid = document.getElementById('projectGrid');
  var dialog = document.getElementById('projectDialog');
  var opener = null;

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }
  function part(project, type) {
    return project.components.find(function (component) { return component.type === type; });
  }
  function projectLinks(project) {
    var component = part(project, 'links');
    return component ? component.content : [];
  }
  function linkHTML(link, label, className) {
    if (/^\s*(?:javascript|data):/i.test(link.href)) return '';
    var download = /\.zip(?:$|[?#])/i.test(link.href);
    var external = /^https?:\/\//.test(link.href) && !link.sameTab;
    return '<a class="' + className + '" href="' + esc(link.href) + '"' + (download ? ' download' : '') +
      (external ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' + esc(label || link.label) +
      '<span aria-hidden="true">' + (download ? '↓' : '↗') + '</span>' +
      (external ? '<span class="sr-only"> (opens in a new tab)</span>' : '') + '</a>';
  }

  grid.innerHTML = order.filter(function (id) { return catalog[id]; }).map(function (id) {
    var project = catalog[id];
    var view = presentation[id];
    var primary = projectLinks(project)[0];
    return '<article class="garden-card" id="' + id + '" aria-labelledby="title-' + id + '">' +
      '<div class="card-topline"><span class="card-number">' + view.number + '</span><span class="card-category">' + esc(project.category) +
      '</span><span class="garden-status">' + esc(view.edition || project.status) + '</span></div>' +
      '<p class="card-note">' + esc(view.note) + '</p><h3 id="title-' + id + '">' + esc(view.name) + '</h3>' +
      '<p class="card-description">' + esc(view.description) + '</p><div class="card-actions">' +
      (primary ? linkHTML(primary, view.action, 'garden-action garden-action--line') : '') +
      '<button class="garden-more" type="button" data-details="' + id + '" aria-label="About ' + esc(view.name) + '">Read more <span aria-hidden="true">+</span></button></div></article>';
  }).join('');
  document.querySelector('[data-details="self-cartography"]').hidden = false;

  function openDetails(id, button) {
    var project = catalog[id];
    var view = presentation[id];
    if (!project || !view) return;
    var purpose = part(project, 'purpose');
    var features = part(project, 'features');
    var stack = part(project, 'stack');
    var status = part(project, 'status');
    document.getElementById('dialogTitle').textContent = view.name;
    document.getElementById('dialogMeta').textContent = project.category + ' · ' + (view.edition || project.status);
    document.getElementById('dialogActions').innerHTML = projectLinks(project).map(function (link, index) {
      return linkHTML(link, index === 0 ? view.action : link.label, 'garden-action ' + (index === 0 ? 'garden-action--primary' : 'garden-action--quiet'));
    }).join('');
    document.getElementById('dialogContent').innerHTML =
      '<section><h3>About the project</h3>' + (purpose ? String(purpose.content).split('\n\n').map(function (paragraph) { return '<p>' + esc(paragraph) + '</p>'; }).join('') : '') + '</section>' +
      '<section><h3>What’s inside</h3><ul>' + (features ? features.content.map(function (feature) { return '<li>' + esc(feature) + '</li>'; }).join('') : '') + '</ul></section>' +
      '<section><h3>Built with</h3><p>' + (stack ? stack.content.map(esc).join(' · ') : '') + '</p></section>' +
      '<section><h3>Availability</h3><p>' + esc(status ? status.content : project.status) + '</p></section>';
    opener = button;
    dialog.showModal();
  }
  document.addEventListener('click', function (event) {
    var button = event.target.closest('button[data-details]');
    if (button) openDetails(button.dataset.details, button);
  });
  dialog.addEventListener('click', function (event) {
    if (event.target === dialog) {
      var box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    }
  });
  dialog.addEventListener('close', function () { if (opener) opener.focus({ preventScroll: true }); });
  // Preserve existing project fragment links after the data-driven cards mount.
  var destination = document.getElementById(location.hash.slice(1));
  if (destination && catalog[destination.id]) requestAnimationFrame(function () { destination.scrollIntoView({ block: 'start' }); });
}());
