/* ══════════════════════════════════════════════════════
   contact.js — Correspondence
   Validation, a live signature, subject pre-selection from
   the Expertise atlas (?about=<discipline>), and the honest
   Instagram handoff.

   There is no configured delivery backend for this static
   site, so sealing never claims to have sent the letter.
   It composes the letter, offers it for copying, and hands
   the visitor to the verified Instagram DM route.
══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var SUBJECTS = {
    brand: 'Brand & image',
    search: 'Search & discovery',
    strategy: 'Strategy & distribution',
    language: 'Language & systems',
    other: 'Something else'
  };

  /* Expertise atlas disciplines → the plate (subject) they belong to. */
  var DISCIPLINES = {
    'brand-image':             ['brand', 'Brand Image'],
    'aesthetic-orchestration': ['brand', 'Aesthetic Orchestration'],
    'brand-voice':             ['brand', 'Brand Voice'],
    'seo':                     ['search', 'SEO'],
    'aeo':                     ['search', 'AEO'],
    'competitive-analysis':    ['search', 'Competitive Analysis'],
    'marketing-strategy':      ['strategy', 'Marketing Strategy'],
    'guerrilla-marketing':     ['strategy', 'Guerrilla Marketing'],
    'email-marketing':         ['strategy', 'Email Marketing'],
    'sms-marketing':           ['language', 'SMS Marketing'],
    'business-consulting':     ['language', 'Business Consulting'],
    'copywriting':             ['language', 'Copywriting']
  };

  function init() {
    var form = document.getElementById('contactForm');
    if (!form) return;

    var fields = {
      message: { input: document.getElementById('fMessage'), error: document.getElementById('fMessageError'),
                 check: function (v) { return v ? '' : 'Please write a few words.'; } },
      name:    { input: document.getElementById('fName'), error: document.getElementById('fNameError'),
                 check: function (v) { return v ? '' : 'Please sign with your name.'; } },
      email:   { input: document.getElementById('fEmail'), error: document.getElementById('fEmailError'),
                 check: function (v) { return EMAIL.test(v) ? '' : 'Please add an email address we can reply to.'; } }
    };
    var ORDER = ['message', 'name', 'email'];   /* the order they appear in the letter */

    var signature = document.getElementById('ssSignature');
    var origin = document.getElementById('regardingOrigin');
    var sendBtn = document.getElementById('ssSendBtn');
    var sendLabel = document.getElementById('ssSendLabel');
    var flyEnvelope = document.getElementById('ssFlyEnvelope');
    var handoff = document.getElementById('ssHandoff');
    var handoffHeading = document.getElementById('ssHandoffHeading');
    var handoffNote = document.getElementById('ssHandoffNote');
    var handoffCopyAgain = document.getElementById('ssHandoffCopyAgain');
    var handoffStatus = document.getElementById('ssHandoffStatus');
    var handoffInstagram = document.getElementById('ssHandoffInstagram');
    var handoffEdit = document.getElementById('ssHandoffEdit');
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    var discipline = '';
    var submitting = false;

    /* arriving from an Expertise field note */
    var about = new URLSearchParams(window.location.search).get('about');
    if (about && DISCIPLINES[about]) {
      var entry = DISCIPLINES[about];
      var radio = form.querySelector('input[name="subject"][value="' + entry[0] + '"]');
      if (radio) radio.checked = true;
      discipline = entry[1];
      origin.textContent = 'From the atlas: ' + discipline + '.';
      origin.hidden = false;
      form.addEventListener('change', function (e) {
        if (e.target.name !== 'subject') return;
        var keep = e.target.value === entry[0];
        discipline = keep ? entry[1] : '';
        origin.hidden = !keep;
      });
    }

    /* the name signs the letter as it is typed */
    fields.name.input.addEventListener('input', function () {
      signature.textContent = fields.name.input.value.trim();
    });

    function setError(key, message) {
      var f = fields[key];
      f.error.textContent = message;
      f.error.hidden = !message;
      if (message) f.input.setAttribute('aria-invalid', 'true');
      else f.input.removeAttribute('aria-invalid');
    }

    /* clear an error as soon as the field becomes valid */
    ORDER.forEach(function (key) {
      var f = fields[key];
      f.input.addEventListener('input', function () {
        if (!f.error.hidden && !f.check(f.input.value.trim())) setError(key, '');
      });
    });

    function validate() {
      var firstInvalid = null;
      ORDER.forEach(function (key) {
        var f = fields[key];
        var message = f.check(f.input.value.trim());
        setError(key, message);
        if (message && !firstInvalid) firstInvalid = f.input;
      });
      if (firstInvalid) firstInvalid.focus();
      return !firstInvalid;
    }

    function composeNote() {
      var checked = form.querySelector('input[name="subject"]:checked');
      var lines = [];
      if (checked) {
        lines.push('Regarding: ' + SUBJECTS[checked.value] + (discipline ? ' — ' + discipline : ''));
        lines.push('');
      }
      lines.push(fields.message.input.value.trim());
      lines.push('');
      lines.push('Yours,');
      lines.push(fields.name.input.value.trim() + ' (' + fields.email.input.value.trim() + ')');
      return lines.join('\n');
    }

    function attemptCopy(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return false; });
      }
      return Promise.resolve(false);
    }

    function playFlyEnvelope() {
      if (!flyEnvelope || reduced.matches || typeof flyEnvelope.animate !== 'function') return Promise.resolve();
      var anim = flyEnvelope.animate([
        { transform: 'translate(-50%, 0) scale(.9)', opacity: 0 },
        { transform: 'translate(-50%, -14px) scale(1)', opacity: 1, offset: .25 },
        { transform: 'translate(-50%, -60px) scale(.92)', opacity: 0 }
      ], { duration: 750, easing: 'cubic-bezier(.22,1,.36,1)' });
      return anim.finished.catch(function () {});
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (submitting || !validate()) return;

      submitting = true;
      var note = composeNote();
      var originalLabel = sendLabel.textContent;
      sendBtn.disabled = true;
      sendLabel.textContent = 'Sealing…';

      /* Copy inside the user gesture so browsers that require
         direct activation allow it; the animation is decorative. */
      var copied = attemptCopy(note);

      Promise.all([playFlyEnvelope(), copied]).then(function (results) {
        form.hidden = true;
        handoffNote.value = note;
        handoff.hidden = false;
        handoffStatus.textContent = results[1]
          ? 'Your letter is copied. Paste it into the message.'
          : 'Copy the letter above, then paste it into the message.';
        handoffHeading.focus();
        sendBtn.disabled = false;
        sendLabel.textContent = originalLabel;
        submitting = false;
      });
    });

    handoffCopyAgain.addEventListener('click', function () {
      attemptCopy(handoffNote.value).then(function (ok) {
        handoffStatus.textContent = ok ? 'Copied.' : 'Select the letter above and copy it.';
        if (!ok) { handoffNote.focus(); handoffNote.select(); }
      });
    });

    handoffInstagram.addEventListener('click', function () {
      handoffStatus.textContent = 'Opening Instagram…';
    });

    handoffEdit.addEventListener('click', function () {
      handoff.hidden = true;
      form.hidden = false;
      fields.message.input.focus();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());
