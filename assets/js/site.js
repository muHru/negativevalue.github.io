// Site chrome, on every page: the keyboard bar and the step counts that
// the CSS stepped animations need.
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Keyboard bar ----------------------------------------------------- */

  function toggleInvert() {
    var on = root.toggleAttribute('data-invert');
    try { localStorage.setItem('nv-invert', on ? '1' : '0'); } catch (e) {}
  }

  function page(direction) {
    window.scrollBy({ top: direction * window.innerHeight * 0.85, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  // Keys that aren't plain links name one of these in data-action.
  var actions = {
    'invert': function () {
      if (document.startViewTransition && !reduceMotion) document.startViewTransition(toggleInvert);
      else toggleInvert();
    },
    'page-up': function () { page(-1); },
    'page-down': function () { page(1); }
  };

  var bar = document.querySelector('.keys');

  bar.addEventListener('click', function (e) {
    var button = e.target.closest('[data-action]');
    if (button) actions[button.dataset.action]();
  });

  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
    if (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    var key = bar.querySelector('[data-key="' + e.key.toLowerCase() + '"]');
    if (!key) return;
    e.preventDefault();
    key.classList.add('is-pressed');
    setTimeout(function () { key.classList.remove('is-pressed'); }, 160);
    key.click();
  });

  /* Step counts ------------------------------------------------------
     steps() needs one step per character, and the hero notes type one
     after another, so each gets its length, start and duration here. */

  var CHAR_MS = 16, LINE_PAUSE_MS = 80, start = 0;

  document.querySelectorAll('.type').forEach(function (line) {
    var n = line.textContent.length;
    line.style.setProperty('--n', n);
    line.style.setProperty('--d', start + 'ms');
    line.style.setProperty('--dur', n * CHAR_MS + 'ms');
    start += n * CHAR_MS + LINE_PAUSE_MS;
  });

  document.querySelectorAll('.display').forEach(function (heading) {
    heading.style.setProperty('--n', heading.textContent.trim().length);
  });
})();
