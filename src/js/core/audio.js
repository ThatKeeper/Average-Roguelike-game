/* ======================================================================
 * src/js/core/audio.js
 * Sonido procedural con WebAudio: efectos (snd) y sonidos de jefe (bsnd).
 *
 * Define:
 * AC, snd, lootSnd, bsT, bsnd
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
/**
 * Sonido al conseguir un objeto: r = rareza (2 épico, 3 legendario; las demás no suenan especial).
 * Épico: arpegio ascendente brillante. Legendario: acorde grave que se abre en fanfarria con destello.
 */
function lootSnd(r) {
  const at = (ms, f) => setTimeout(f, ms);
  if (r == 2) {
    [523, 659, 784, 1047].forEach((f, i) => at(i * 70, () => snd(f, 0.28, "triangle", 0.05)));
    at(300, () => snd(1568, 0.5, "sine", 0.03));
  } else if (r >= 3) {
    [392, 523, 659, 784].forEach((f, i) =>
      at(i * 90, () => {
        snd(f, 0.5, "sawtooth", 0.03);
        snd(f * 2, 0.5, "triangle", 0.04);
      }),
    );
    at(420, () => {
      [523, 659, 784, 1047].forEach((f) => snd(f, 1.1, "triangle", 0.05));
      snd(2093, 0.9, "sine", 0.03);
    });
    at(520, () => snd(3136, 0.6, "sine", 0.02));
  }
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

