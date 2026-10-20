/* ======================================================================
 * src/js/core/helpers.js
 * Referencias al DOM/canvas, constantes de pantalla y utilidades matemáticas y de formato.
 *
 * Define:
 * $, cv, x, W, H, ov, rnd, pick, cl, ang, dist, nrm, rngS, fmt
 * ====================================================================== */

const $ = (i) => document.getElementById(i),
  cv = $("c"),
  x = cv.getContext("2d"),
  W = 960,
  H = 600,
  ov = $("ov");
const rnd = (a, b) => a + Math.random() * (b - a),
  pick = (a) => a[(Math.random() * a.length) | 0],
  cl = (v, a, b) => Math.max(a, Math.min(b, v));
const ang = (a, b) => Math.atan2(b.y - a.y, b.x - a.x),
  dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y),
  nrm = (v) => Math.atan2(Math.sin(v), Math.cos(v));
const rngS = (s) => () => {
  s |= 0;
  s = (s + 0x6d2b79f5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const fmt = (n) =>
  n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? (n / 1e3).toFixed(1) + "k" : Math.round(n);
