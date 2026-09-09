(function () {
  'use strict';

  // Presentation only. Project records and destinations stay in projects-data.js.
  var stations = [
    { id: 'self-cartography', number: '01', name: 'Self Cartography', structure: 'Command center', x: 51, y: 40.8, ground: 57, label: 'below', crop: [51, 41], zoom: 3.1,
      description: 'Map your values, personality, and career fit. See where your answers agree, where they pull apart, and what that means for your next move.',
      summary: 'A clearer picture of what drives you, and where to go next.',
      facts: ['Multiple ways to measure', 'Visual results with confidence levels', 'Progress saved in your browser'], action: 'Take the assessment', shortAction: 'Launch assessment' },
    { id: 'focus-shield', number: '02', name: 'Focus Shield', structure: 'Defense barracks', x: 20.5, y: 22, ground: 35, label: 'above', crop: [20.5, 22], zoom: 3.7,
      description: 'Put a hard limit on passive scrolling. Keep your bookmarks and creation tools, with a commitment lock to make the limit stick.',
      summary: 'Cut the feed. Keep the parts of the internet you came for.',
      facts: ['30-minute daily feed budget', 'Five social platforms', 'Optional accountability lock'], action: 'Download ZIP', shortAction: 'Download ZIP' },
    { id: 'bookmark-mirror', number: '03', name: 'Bookmark Mirror', structure: 'Signal intelligence', x: 82.7, y: 22, ground: 36, label: 'above', crop: [82.7, 22], zoom: 3.5,
      description: 'Turn your Twitter/X bookmarks into a map of your interests. Explore the recurring topics, language, and patterns in what you save.',
      summary: 'Find the patterns hiding in everything you save.',
      facts: ['Analyzes Twitter/X bookmarks', 'Tracks topics and changing interests', 'Runs offline. No API key.'], action: 'Download ZIP', shortAction: 'Download ZIP' },
    { id: 'curated-feed', number: '04', name: 'Curated Feed', structure: 'Transmission tower', x: 81.4, y: 64, ground: 80, label: 'below', crop: [81.4, 64], zoom: 3.6,
      description: 'An archive arranged by color, not chronology. Photography, objects, and everyday moments become one continuous shift in hue.',
      summary: 'A visual archive sequenced by color, one frame at a time.',
      facts: ['Manually sequenced by hue', 'Photography, objects, and texture', 'An ongoing visual project'], action: 'Explore the feed', shortAction: 'View on Instagram' },
    { id: 'psychometrics-battery', number: '05', name: 'Psychometric Battery', structure: 'Research archive', x: 20.2, y: 67.4, ground: 80.5, label: 'below', crop: [20.2, 67.4], zoom: 3.6,
      description: 'The original self-assessment experiment. Explore personality, values, and attachment in one browser-based session.',
      summary: 'The first assessment. Preserved as the project’s original edition.',
      facts: ['Personality, values, and attachment', 'Browser-based assessment', 'For the current test, use Self Cartography'], action: 'Open original assessment', shortAction: 'Open original', edition: 'First edition' }
  ];

  if (typeof PROJECTS === 'undefined') return;
  stations = stations.filter(function (station) { return PROJECTS.some(function (project) { return project.id === station.id; }); });
  if (!stations.length) return;

  var byId = {};
  PROJECTS.forEach(function (project) { byId[project.id] = project; });
  var markers = document.getElementById('structureMarkers');
  var roster = document.getElementById('projectRoster');
  var terrain = document.getElementById('terrain');
  var world = document.getElementById('terrainWorld');
  var activeId;

  function escapeHTML(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }
  function component(project, type) {
    return project.components.find(function (item) { return item.type === type; });
  }
  function links(project) {
    var item = component(project, 'links');
    return item ? item.content : [];
  }
  function linkHTML(link, label, className) {
    var download = /\.zip(?:$|[?#])/i.test(link.href);
    var external = /^https?:\/\//.test(link.href) && !link.sameTab;
    // Destinations come from the existing catalog; never turn data into script URLs.
    if (/^\s*(?:javascript|data):/i.test(link.href)) return '';
    return '<a class="' + className + '" href="' + escapeHTML(link.href) + '"' +
      (download ? ' download' : '') + (external ? ' target="_blank" rel="noopener noreferrer"' : '') + '>' +
      escapeHTML(label || link.label) + '<span aria-hidden="true">' + (download ? '↓' : '↗') + '</span>' +
      (external ? '<span class="sr-only"> (opens in a new tab)</span>' : '') + '</a>';
  }
  function cropStyle(station) {
    return '--crop-x:' + station.crop[0] + '%;--crop-y:' + station.crop[1] + '%;--crop-zoom:' + station.zoom;
  }

  document.getElementById('projectCount').textContent = String(stations.length).padStart(2, '0');
  markers.innerHTML = stations.map(function (station) {
    return '<button class="structure structure--' + station.label + '" type="button" data-project="' + station.id +
      '" style="--x:' + station.x + '%;--y:' + station.y + '%" aria-label="Explore ' + escapeHTML(station.name) +
      '" aria-controls="projectBrief" aria-pressed="false"><span class="structure-hit" aria-hidden="true"></span>' +
      '<span class="structure-label"><span class="structure-number">' + station.number + '</span><span class="structure-name">' +
      escapeHTML(station.name) + '</span><span class="structure-tick" aria-hidden="true">+</span></span></button>';
  }).join('');

  roster.innerHTML = stations.map(function (station) {
    var project = byId[station.id];
    var primary = links(project)[0];
    return '<article class="project-unit" data-unit="' + station.id + '"><button class="unit-select" type="button" data-project="' + station.id +
      '" aria-pressed="false" aria-controls="projectBrief"><span class="unit-image" aria-hidden="true" style="' + cropStyle(station) + '"><span></span></span>' +
      '<span class="unit-topline"><span>' + station.number + ' / ' + escapeHTML(station.structure) + '</span><span aria-hidden="true">+</span></span>' +
      '<span class="unit-title">' + escapeHTML(station.name) + '</span><span class="unit-description">' + escapeHTML(station.summary) + '</span></button>' +
      (primary ? linkHTML(primary, station.shortAction, 'unit-action') : '') + '</article>';
  }).join('');

  function renderDetails(project, station) {
    var purpose = component(project, 'purpose');
    var features = component(project, 'features');
    var stack = component(project, 'stack');
    var status = component(project, 'status');
    document.getElementById('detailsProject').textContent = station.name;
    document.getElementById('projectDetailsBody').innerHTML =
      '<details class="project-dossier"><summary><span>Purpose &amp; approach</span><span aria-hidden="true">+</span></summary><div class="dossier-copy">' +
      (purpose ? String(purpose.content).split('\n\n').map(function (paragraph) { return '<p>' + escapeHTML(paragraph) + '</p>'; }).join('') : '') + '</div></details>' +
      '<details class="project-dossier"><summary><span>What’s included</span><span aria-hidden="true">+</span></summary><ul class="dossier-features">' +
      (features ? features.content.map(function (feature) { return '<li>' + escapeHTML(feature) + '</li>'; }).join('') : '') + '</ul></details>' +
      '<details class="project-dossier"><summary><span>Build &amp; availability</span><span aria-hidden="true">+</span></summary><div class="dossier-copy"><p>' +
      escapeHTML(status ? status.content : project.status) + '</p><ul class="stack-list">' +
      (stack ? stack.content.map(function (technology) { return '<li>' + escapeHTML(technology) + '</li>'; }).join('') : '') + '</ul><div class="dossier-links">' +
      links(project).map(function (link) { return linkHTML(link, link.label, 'text-link'); }).join('') + '</div></div></details>';
  }

  function selectProject(id, updateURL, announce) {
    var station = stations.find(function (entry) { return entry.id === id; });
    if (!station || activeId === id) return;
    activeId = id;
    var project = byId[id];
    document.querySelectorAll('[data-project]').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.project === id));
    });
    document.querySelectorAll('[data-unit]').forEach(function (unit) { unit.classList.toggle('is-selected', unit.dataset.unit === id); });
    document.getElementById('briefLocation').textContent = station.number + ' / ' + station.structure;
    document.getElementById('mapSelection').textContent = station.number + ' / ' + station.structure;
    document.getElementById('briefStatus').textContent = station.edition || project.status;
    document.getElementById('briefStatus').dataset.status = project.status;
    document.getElementById('briefCategory').textContent = project.category;
    document.getElementById('briefTitle').textContent = station.name;
    document.getElementById('briefDescription').textContent = station.description;
    document.getElementById('briefFacts').innerHTML = station.facts.map(function (fact) { return '<li>' + escapeHTML(fact) + '</li>'; }).join('');
    document.getElementById('briefActions').innerHTML = links(project).map(function (link, index) {
      return linkHTML(link, index === 0 ? station.action : link.label, 'action ' + (index === 0 ? 'action--primary' : 'action--secondary'));
    }).join('');
    document.getElementById('briefPortrait').setAttribute('style', cropStyle(station));
    var reticle = document.getElementById('selectionReticle');
    reticle.style.left = station.x + '%';
    reticle.style.top = station.ground + '%';
    var route = document.getElementById('activeRoute');
    route.setAttribute('d', id === 'self-cartography' ? '' : 'M510 380 L' + (station.x * 10) + ' ' + (station.ground * 6.67));
    renderDetails(project, station);
    if (updateURL) history.replaceState(null, '', '#' + id);
    if (announce) document.getElementById('selectionAnnouncement').textContent = station.name + ' selected. ' + station.description;
  }

  [markers, roster].forEach(function (container) {
    container.addEventListener('click', function (event) {
      var button = event.target.closest('button[data-project]');
      if (button) {
        selectProject(button.dataset.project, true, true);
        if (container === roster) {
          var brief = document.getElementById('projectBrief');
          brief.focus({ preventScroll: true });
          brief.scrollIntoView({ behavior: motionPreference.matches ? 'auto' : 'smooth', block: 'nearest' });
        }
      }
    });
    container.addEventListener('keydown', function (event) {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      var button = event.target.closest('button[data-project]');
      if (!button) return;
      event.preventDefault();
      var index = stations.findIndex(function (station) { return station.id === button.dataset.project; });
      var backwards = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
      var next = event.key === 'Home' ? 0 : event.key === 'End' ? stations.length - 1 : (index + (backwards ? -1 : 1) + stations.length) % stations.length;
      var nextButton = container.querySelector('[data-project="' + stations[next].id + '"]');
      nextButton.focus();
      selectProject(stations[next].id, true, true);
    });
  });
  window.addEventListener('hashchange', function () { selectProject(location.hash.slice(1), false, true); });
  var initial = location.hash.slice(1);
  selectProject(byId[initial] ? initial : stations[0].id, false, false);

  // One small pointer-driven parallax. No perpetual rendering loop or autoplay audio.
  var motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var motionToggle = document.getElementById('motionToggle');
  var motionEnabled = !motionPreference.matches && finePointer.matches;
  var frame = 0;
  var pointerX = 0;
  var pointerY = 0;
  function resetPosition() {
    cancelAnimationFrame(frame);
    frame = 0;
    world.style.transform = '';
  }
  function syncMotion() {
    motionToggle.hidden = !finePointer.matches;
    motionToggle.setAttribute('aria-pressed', String(motionEnabled));
    motionToggle.textContent = motionEnabled ? 'Motion on' : 'Motion off';
    terrain.classList.toggle('motion-enabled', motionEnabled);
    if (!motionEnabled) resetPosition();
  }
  motionToggle.addEventListener('click', function () { motionEnabled = !motionEnabled; syncMotion(); });
  motionPreference.addEventListener('change', function () { motionEnabled = !motionPreference.matches && finePointer.matches; syncMotion(); });
  finePointer.addEventListener('change', function () { motionEnabled = !motionPreference.matches && finePointer.matches; syncMotion(); });
  terrain.addEventListener('pointermove', function (event) {
    if (!motionEnabled || event.pointerType === 'touch') return;
    var rect = terrain.getBoundingClientRect();
    pointerX = (event.clientX - rect.left) / rect.width - 0.5;
    pointerY = (event.clientY - rect.top) / rect.height - 0.5;
    if (frame) return;
    frame = requestAnimationFrame(function () {
      world.style.transform = 'translate3d(' + (pointerX * -8).toFixed(2) + 'px,' + (pointerY * -6).toFixed(2) + 'px,0)';
      frame = 0;
    });
  });
  terrain.addEventListener('pointerleave', resetPosition);
  document.addEventListener('visibilitychange', function () { if (document.hidden) resetPosition(); });
  window.addEventListener('pagehide', resetPosition);
  syncMotion();

  function imageFailed() {
    terrain.classList.add('image-unavailable');
    document.getElementById('terrainUnavailable').hidden = false;
  }
  var art = document.getElementById('terrainArt');
  art.addEventListener('error', imageFailed);
  if (art.complete && !art.naturalWidth) imageFailed();
}());
