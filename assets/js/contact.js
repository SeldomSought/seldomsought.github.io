/* ══════════════════════════════════════════════════════
   contact.js
   Correspondence-in-the-clouds page: ambient stationery
   motion + validation + honest Instagram handoff.

   There is no configured delivery backend for this static
   site, so submission never claims to have sent the note.
   It composes the message, offers it for copying, and
   hands the visitor to the verified Instagram DM route.
══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var INSTAGRAM_URL = 'https://www.instagram.com/seldomsought';

  var ERRORS = {
    name: 'Please add your name.',
    email: 'Please enter a valid email address.',
    message: 'Please add a message.'
  };

  var SUBJECT_LABELS = {
    brand: 'Brand Image',
    strategy: 'Marketing Strategy',
    seo: 'SEO / AEO',
    copy: 'Copywriting',
    consulting: 'Consulting',
    other: 'Other'
  };

  /* ── ambient motion controller ──────────────────── */
  function mountHeavenMotion(root) {
    var form = root.querySelector('#contactForm');
    var toggle = root.querySelector('[data-ss-motion-toggle]');
    if (!form || !toggle || typeof Element.prototype.animate !== 'function') {
      return function () {};
    }

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    var desktop = window.matchMedia('(min-width: 901px) and (hover: hover) and (pointer: fine)');
    var listeners = new AbortController();
    var motions = [];
    var manualPause = false;
    var hovering = false;
    var editing = false;
    var inView = true;

    function createMotions() {
      motions = Array.prototype.slice.call(root.querySelectorAll('[data-ss-ambient]')).map(function (el, i) {
        var duration = 10000 + (i % 4) * 2000;
        var animation = el.animate([
          { transform: 'translate3d(0, 0, 0)', offset: 0 },
          { transform: 'translate3d(' + (i % 2 ? 3 : -3) + 'px, -' + (4 + (i % 3) * 2) + 'px, 0)', offset: .5 },
          { transform: 'translate3d(0, 0, 0)', offset: 1 }
        ], { duration: duration, iterations: Infinity, easing: 'ease-in-out' });
        animation.pause();
        animation.currentTime = (i * 1733) % duration;
        return { animation: animation, isField: el.hasAttribute('data-ss-field') };
      });
    }

    function sync() {
      var enabled = desktop.matches && !reduced.matches;
      toggle.hidden = !enabled;
      toggle.setAttribute('aria-pressed', String(manualPause));

      if (!enabled) {
        motions.forEach(function (m) { m.animation.cancel(); });
        motions = [];
        return;
      }

      if (!motions.length) createMotions();
      var pauseEverything = manualPause || document.hidden || !inView;
      motions.forEach(function (m) {
        var pause = pauseEverything || (m.isField && (hovering || editing));
        if (pause) m.animation.pause();
        else m.animation.play();
      });
    }

    form.addEventListener('pointerenter', function () { hovering = true; sync(); }, { signal: listeners.signal });
    form.addEventListener('pointerleave', function () { hovering = false; sync(); }, { signal: listeners.signal });
    form.addEventListener('focusin', function () { editing = true; sync(); }, { signal: listeners.signal });
    toggle.addEventListener('click', function () { manualPause = !manualPause; sync(); }, { signal: listeners.signal });
    document.addEventListener('visibilitychange', sync, { signal: listeners.signal });
    reduced.addEventListener('change', sync);
    desktop.addEventListener('change', sync);

    var observer = typeof IntersectionObserver === 'function'
      ? new IntersectionObserver(function (entries) { inView = entries[0].isIntersecting; sync(); })
      : null;
    if (observer) observer.observe(root);
    sync();

    return function () {
      listeners.abort();
      reduced.removeEventListener('change', sync);
      desktop.removeEventListener('change', sync);
      if (observer) observer.disconnect();
      motions.forEach(function (m) { m.animation.cancel(); });
    };
  }

  /* ── page wiring ─────────────────────────────────── */
  function init() {
    var root = document.getElementById('ssContact');
    if (!root) return;

    mountHeavenMotion(root);

    var form = document.getElementById('contactForm');
    var nameInput = document.getElementById('fName');
    var emailInput = document.getElementById('fEmail');
    var messageInput = document.getElementById('fMessage');
    var signature = document.getElementById('ssSignature');
    var sendBtn = document.getElementById('ssSendBtn');
    var sendLabel = document.getElementById('ssSendLabel');
    var flyEnvelope = document.getElementById('ssFlyEnvelope');
    var letterGrid = form;
    var handoff = document.getElementById('ssHandoff');
    var handoffHeading = document.getElementById('ssHandoffHeading');
    var handoffNote = document.getElementById('ssHandoffNote');
    var handoffCopyAgain = document.getElementById('ssHandoffCopyAgain');
    var handoffStatus = document.getElementById('ssHandoffStatus');
    var handoffInstagram = document.getElementById('ssHandoffInstagram');
    var handoffEdit = document.getElementById('ssHandoffEdit');

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    var submitting = false;

    /* live letter signature */
    if (nameInput && signature) {
      nameInput.addEventListener('input', function () {
        var v = nameInput.value.trim();
        signature.textContent = v ? 'From, ' + v : '';
      });
    }

    function fieldEl(id) { return document.getElementById(id); }

    function showError(fieldId, errId, msg) {
      var el = fieldEl(errId);
      if (!el) return;
      el.textContent = msg;
      el.hidden = false;
    }
    function clearError(errId) {
      var el = fieldEl(errId);
      if (!el) return;
      el.textContent = '';
      el.hidden = true;
    }

    /* clear a field's error as soon as it becomes valid, rather than
       waiting for the next submit attempt */
    nameInput.addEventListener('input', function () {
      if (nameInput.value.trim()) clearError('fNameError');
    });
    emailInput.addEventListener('input', function () {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) clearError('fEmailError');
    });
    messageInput.addEventListener('input', function () {
      if (messageInput.value.trim()) clearError('fMessageError');
    });

    function validate() {
      var name = nameInput.value.trim();
      var email = emailInput.value.trim();
      var message = messageInput.value.trim();
      var firstInvalid = null;

      clearError('fNameError');
      clearError('fEmailError');
      clearError('fMessageError');

      var valid = true;
      if (!name) { showError('fName', 'fNameError', ERRORS.name); firstInvalid = firstInvalid || nameInput; valid = false; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showError('fEmail', 'fEmailError', ERRORS.email); firstInvalid = firstInvalid || emailInput; valid = false; }
      if (!message) { showError('fMessage', 'fMessageError', ERRORS.message); firstInvalid = firstInvalid || messageInput; valid = false; }

      if (!valid && firstInvalid) firstInvalid.focus();
      return valid;
    }

    function selectedSubject() {
      var checked = form.querySelector('input[name="subject"]:checked');
      return checked ? checked.value : '';
    }

    function composeNote() {
      var name = nameInput.value.trim();
      var email = emailInput.value.trim();
      var subject = selectedSubject();
      var message = messageInput.value.trim();
      var lines = [];
      lines.push('From: ' + name + ' (' + email + ')');
      if (subject) lines.push('About: ' + (SUBJECT_LABELS[subject] || subject));
      lines.push('');
      lines.push(message);
      return lines.join('\n');
    }

    function attemptCopy(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).then(function () { return true; }).catch(function () { return false; });
      }
      return Promise.resolve(false);
    }

    function playFlyEnvelope() {
      if (!flyEnvelope || reduced.matches || typeof flyEnvelope.animate !== 'function') {
        return Promise.resolve();
      }
      flyEnvelope.style.opacity = '1';
      var anim = flyEnvelope.animate([
        { transform: 'translate(-50%, 0) scale(0.9)', opacity: 0 },
        { transform: 'translate(-50%, -12px) scale(1)', opacity: 1, offset: .25 },
        { transform: 'translate(-50%, -46px) scale(0.94)', opacity: 0 }
      ], { duration: 700, easing: 'cubic-bezier(.22,1,.36,1)' });
      return anim.finished.catch(function () {}).then(function () {
        flyEnvelope.style.opacity = '0';
      });
    }

    function revealHandoff(note) {
      letterGrid.hidden = true;
      handoffNote.value = note;
      handoff.hidden = false;
      handoffHeading.focus();
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (submitting) return;
      if (!validate()) return;

      submitting = true;
      var note = composeNote();
      sendBtn.disabled = true;
      var originalLabel = sendLabel.textContent;
      sendLabel.textContent = 'Wrapping up your note…';

      /* Attempt the clipboard copy synchronously within the user
         gesture so browsers that require direct activation still
         allow it; the animation is purely decorative sequencing. */
      var copyPromise = attemptCopy(note);

      Promise.all([playFlyEnvelope(), copyPromise]).then(function (results) {
        var copied = results[1];
        revealHandoff(note);
        handoffStatus.textContent = copied
          ? 'Your note is copied — paste it into the DM.'
          : 'Copy it below, then paste it into the DM.';
        sendBtn.disabled = false;
        sendLabel.textContent = originalLabel;
        submitting = false;
      });
    });

    if (handoffCopyAgain) {
      handoffCopyAgain.addEventListener('click', function () {
        attemptCopy(handoffNote.value).then(function (copied) {
          handoffStatus.textContent = copied ? 'Copied.' : 'Select the text above and copy it manually.';
          if (!copied) {
            handoffNote.focus();
            handoffNote.select();
          }
        });
      });
    }

    if (handoffInstagram) {
      handoffInstagram.addEventListener('click', function () {
        handoffStatus.textContent = 'Opening Instagram…';
      });
    }

    if (handoffEdit) {
      handoffEdit.addEventListener('click', function () {
        handoff.hidden = true;
        letterGrid.hidden = false;
        nameInput.focus();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
