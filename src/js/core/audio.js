/* ======================================================================
 * src/js/core/audio.js
 * Sonido procedural con WebAudio: efectos (snd) y sonidos de jefe (bsnd).
 *
 * Define:
 * AC, snd, bsT, bsnd
 * ====================================================================== */

let AC;
function snd(f, d, t = "sine", v = 0.04, m = 0) {
  try {
    AC = AC || new AudioContext();
    const o = AC.createOscillator(),
      g = AC.createGain(),
      n = AC.currentTime;
    o.type = t;
    o.frequency.value = f;
    g.gain.setValueAtTime(v * (S.vol ?? 1) * (m ? (S.vm ?? 1) : (S.vfx ?? 1)), n);
    g.gain.exponentialRampToValueAtTime(0.001, n + d);
    o.connect(g);
    g.connect(AC.destination);
    o.start();
    o.stop(n + d);
  } catch (e) {}
}
let bsT = 0;
function bsnd(i, k) {
  const n = Date.now();
  if (k == "atk") {
    if (n - bsT < 140) return;
    bsT = n;
  }
  const f = 90 + i * 32,
    w = ["sawtooth", "square", "triangle", "sine"][i % 4];
  if (k == "in") {
    snd(f, 0.9, w, 0.08);
    snd(f * 1.5, 0.6, w, 0.05);
  } else if (k == "ph") {
    snd(f * 0.5, 0.7, w, 0.1);
    snd(f * 2, 0.4, w, 0.06);
  } else if (k == "die")
    for (let j = 0; j < 4; j++) snd(f * (1 + j * 0.25), 0.6 + j * 0.1, "triangle", 0.06);
  else snd(f * 3, 0.08, w, 0.03);
}
