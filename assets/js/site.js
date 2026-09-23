(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Keyboard navigation --------------------------------------------- */

  function toggleInvert() {
    var on = !root.hasAttribute('data-invert');
    if (on) root.setAttribute('data-invert', '');
    else root.removeAttribute('data-invert');
    try { localStorage.setItem('nv-invert', on ? '1' : '0'); } catch (e) {}
  }

  document.querySelectorAll('[data-invert]').forEach(function (btn) {
    btn.addEventListener('click', toggleInvert);
  });

  document.querySelectorAll('[data-page]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dir = Number(btn.getAttribute('data-page'));
      window.scrollBy({ top: dir * window.innerHeight * 0.85, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    var el = document.querySelector('.keys [data-key="' + e.key.toLowerCase() + '"]');
    if (!el) return;
    e.preventDefault();
    el.click();
  });

  /* ASCII field: M-C-M' pushed through a drifting signal ------------- */

  var pre = document.getElementById('field');
  if (!pre) return;

  var COLS = 76, ROWS = 36, SX = 3, SY = 5;
  var RAMP = ' .:-=+*#%@';
  var canvas = document.createElement('canvas');
  canvas.width = COLS * SX;
  canvas.height = ROWS * SY;
  var ctx = canvas.getContext('2d', { willReadFrequently: true });
  var lum = new Float32Array(COLS * ROWS);

  function paintSource() {
    var w = canvas.width, h = canvas.height;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '500 ' + Math.round(h * 0.3) + 'px "IBM Plex Mono", monospace';
    var text = 'M\u2013C\u2013M\u2032';
    var scale = (w * 0.84) / ctx.measureText(text).width;
    ctx.save();
    ctx.translate(w / 2, h * 0.52);
    ctx.scale(scale, scale * 1.5);
    ctx.lineWidth = (h * 0.028) / scale;
    ctx.lineJoin = 'round';
    ctx.fillText(text, 0, 0);
    ctx.strokeText(text, 0, 0);
    ctx.restore();

    var data = ctx.getImageData(0, 0, w, h).data;
    for (var cy = 0; cy < ROWS; cy++) {
      for (var cx = 0; cx < COLS; cx++) {
        var sum = 0;
        for (var y = 0; y < SY; y++) {
          for (var x = 0; x < SX; x++) {
            sum += data[((cy * SY + y) * w + cx * SX + x) * 4];
          }
        }
        lum[cy * COLS + cx] = sum / (SX * SY * 255);
      }
    }
  }

  // A dense field with the formula cut out of it as negative space.
  function frame(t) {
    var out = '';
    for (var y = 0; y < ROWS; y++) {
      var shift = Math.sin(y * 0.23 + t * 1.2) * 0.8 + Math.sin(y * 0.047 - t * 0.35) * 1.6;
      var fade = 1 - Math.abs(y / (ROWS - 1) - 0.5) * 1.3;
      for (var x = 0; x < COLS; x++) {
        var sx = Math.round(x + shift);
        var glyph = sx >= 0 && sx < COLS ? lum[y * COLS + sx] : 0;
        var wave = Math.sin(x * 0.09 + y * 0.05 + t * 0.6) * 0.5 + Math.sin(x * 0.031 - y * 0.12 - t * 0.4) * 0.5;
        var base = (0.42 + wave * 0.28 + (x / COLS) * 0.3) * fade;
        var v = base * (1 - Math.min(1, glyph * 1.6));
        out += RAMP[Math.max(0, Math.min(RAMP.length - 1, Math.floor(v * RAMP.length)))];
      }
      out += '\n';
    }
    pre.textContent = out;
  }

  function fit() {
    var probe = document.createElement('span');
    probe.textContent = 'MMMMMMMMMM';
    probe.style.cssText = 'position:absolute;visibility:hidden;font:400 100px/1 ' + getComputedStyle(pre).fontFamily;
    document.body.appendChild(probe);
    var ratio = probe.getBoundingClientRect().width / 1000;
    probe.remove();
    var width = pre.parentElement.clientWidth;
    pre.style.fontSize = (width / (COLS * ratio)).toFixed(3) + 'px';
  }

  var visible = true, last = 0, running = false;

  function loop(now) {
    if (!visible || document.hidden) { running = false; return; }
    if (now - last > 70) { frame(now / 1000); last = now; }
    requestAnimationFrame(loop);
  }

  function start() {
    if (reduceMotion || running) return;
    running = true;
    requestAnimationFrame(loop);
  }

  function init() {
    paintSource();
    fit();
    frame(0);
    start();
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) start();
    }).observe(pre);
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) start(); });
  window.addEventListener('resize', fit);

  if (document.fonts && document.fonts.load) {
    document.fonts.load('500 40px "IBM Plex Mono"').then(init, init);
  } else {
    init();
  }
})();
