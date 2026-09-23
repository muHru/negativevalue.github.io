// Home page hero: a drifting ASCII field with M-C-M' cut out of it as
// negative space.
(function () {
  'use strict';

  var pre = document.getElementById('field');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var COLS = 76, ROWS = 36;
  var RAMP = ' .:-=+*#%@';
  var FRAME_MS = 70;

  // Renders the formula on a canvas and averages it down to one coverage
  // value (0-1) per character cell. Cells are 3x5 px, the aspect of a
  // monospace character at line-height 1.
  function sampleFormula() {
    var SX = 3, SY = 5, w = COLS * SX, h = ROWS * SY;
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d', { willReadFrequently: true });
    var text = 'M–C–M′';

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = ctx.strokeStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.font = '500 ' + Math.round(h * 0.3) + 'px "IBM Plex Mono", monospace';
    var scale = (w * 0.84) / ctx.measureText(text).width;
    ctx.translate(w / 2, h * 0.52);
    ctx.scale(scale, scale * 1.5);
    ctx.lineWidth = (h * 0.028) / scale;
    ctx.fillText(text, 0, 0);
    ctx.strokeText(text, 0, 0);

    var pixels = ctx.getImageData(0, 0, w, h).data;
    var coverage = new Float32Array(COLS * ROWS);
    for (var cy = 0; cy < ROWS; cy++) {
      for (var cx = 0; cx < COLS; cx++) {
        var sum = 0;
        for (var y = 0; y < SY; y++) {
          for (var x = 0; x < SX; x++) sum += pixels[((cy * SY + y) * w + cx * SX + x) * 4];
        }
        coverage[cy * COLS + cx] = sum / (SX * SY * 255);
      }
    }
    return coverage;
  }

  function render(formula, t) {
    var out = '';
    for (var y = 0; y < ROWS; y++) {
      var shift = Math.sin(y * 0.23 + t * 1.2) * 0.8 + Math.sin(y * 0.047 - t * 0.35) * 1.6;
      var fade = 1 - Math.abs(y / (ROWS - 1) - 0.5) * 1.3;
      for (var x = 0; x < COLS; x++) {
        var sx = Math.round(x + shift);
        var glyph = sx >= 0 && sx < COLS ? formula[y * COLS + sx] : 0;
        var wave = Math.sin(x * 0.09 + y * 0.05 + t * 0.6) * 0.5 + Math.sin(x * 0.031 - y * 0.12 - t * 0.4) * 0.5;
        var field = (0.42 + wave * 0.28 + (x / COLS) * 0.3) * fade;
        var v = field * (1 - Math.min(1, glyph * 1.6));
        out += RAMP[Math.max(0, Math.min(RAMP.length - 1, Math.floor(v * RAMP.length)))];
      }
      out += '\n';
    }
    pre.textContent = out;
  }

  // Width of one character per px of font size, for sizing the field to
  // exactly fill its column.
  function charWidthRatio() {
    var probe = document.createElement('span');
    probe.textContent = 'MMMMMMMMMM';
    probe.style.cssText = 'position:absolute;visibility:hidden;font:400 100px/1 ' + getComputedStyle(pre).fontFamily;
    document.body.appendChild(probe);
    var ratio = probe.getBoundingClientRect().width / 1000;
    probe.remove();
    return ratio;
  }

  function init() {
    var formula = sampleFormula();
    var ratio = charWidthRatio();
    var fit = function () {
      pre.style.fontSize = (pre.parentElement.clientWidth / (COLS * ratio)).toFixed(3) + 'px';
    };
    fit();
    window.addEventListener('resize', fit);
    render(formula, 0);
    if (reduceMotion) return;

    // Animate only while on screen; rAF already pauses in background tabs.
    var visible = false, last = 0;
    var loop = function (now) {
      if (!visible) return;
      if (now - last > FRAME_MS) { render(formula, now / 1000); last = now; }
      requestAnimationFrame(loop);
    };
    new IntersectionObserver(function (entries) {
      var wasVisible = visible;
      visible = entries[0].isIntersecting;
      if (visible && !wasVisible) requestAnimationFrame(loop);
    }).observe(pre);
  }

  // The canvas draws in Plex 500 and the <pre> is sized from Plex 400.
  Promise.all([
    document.fonts.load('400 1em "IBM Plex Mono"'),
    document.fonts.load('500 1em "IBM Plex Mono"')
  ]).then(init, init);
})();
