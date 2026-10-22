/* ======================================================================
 * src/js/render/particles.js
 * Efectos de partículas: subida de nivel, apertura de cofres y botín raro.
 * Usan la lista FX (tipos "star", "beam", "ring" y "p"); su movimiento está
 * en game/projectiles.js y su dibujo en render/draw.js.
 *
 * Define:
 * starFX, levelUpFX, chestFX, lootFX
 * ====================================================================== */

/** Una estrella de cuatro puntas que sube/cae con gravedad `g` y se encoge al desvanecerse. */
function starFX(px, py, c, o = {}) {
  const t = o.t ?? rnd(0.6, 1.1);
  FX.push({
    k: "star",
    x: px,
    y: py,
    vx: o.vx ?? 0,
    vy: o.vy ?? 0,
    g: o.g ?? 0,
    s: o.s ?? rnd(4, 8),
    rot: rnd(0, 6.28),
    sp: o.sp ?? rnd(-4, 4),
    c,
    t,
    m: t,
  });
}

/** Subida de nivel: columna de luz, anillos dorados y chispas que ascienden alrededor del jugador. */
function levelUpFX() {
  if (!P) return;
  const n = LOW ? 18 : 42,
    cols = ["#ffd34a", "#fff2a8", "#ffffff", "#ffb02e"];
  FX.push({ k: "beam", x: P.x, y: P.y + P.r, t: 1, m: 1, c: "#ffd34a" });
  for (let i = 0; i < 3; i++)
    FX.push({ k: "ring", x: P.x, y: P.y, r: 50 + i * 38, t: 0.5 + i * 0.22, m: 0.5 + i * 0.22, c: cols[i] });
  for (let i = 0; i < n; i++) {
    const a = rnd(0, 6.28),
      v = rnd(40, 170);
    starFX(P.x + Math.cos(a) * 10, P.y + Math.sin(a) * 10, pick(cols), {
      vx: Math.cos(a) * v * 0.6,
      vy: Math.sin(a) * v * 0.4 - rnd(60, 160),
      g: 60,
      t: rnd(0.7, 1.4),
    });
  }
  snd(660, 0.12, "triangle", 0.04);
  setTimeout(() => snd(990, 0.25, "triangle", 0.04), 90);
}

/** Cofre abierto: estallido de monedas y destellos que saltan hacia arriba, con anillo de luz. */
function chestFX(px, py) {
  const n = LOW ? 16 : 36,
    cols = ["#ffd34a", "#fff2a8", "#ffe27a", "#ffffff"];
  FX.push({ k: "ring", x: px, y: py, r: 70, t: 0.45, m: 0.45, c: "#ffd34a" });
  FX.push({ k: "beam", x: px, y: py + 10, t: 0.7, m: 0.7, c: "#ffe27a" });
  for (let i = 0; i < n; i++) {
    const a = rnd(-2.6, -0.54), // abanico hacia arriba
      v = rnd(120, 300);
    starFX(px + rnd(-14, 14), py - 6, pick(cols), {
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      g: 520,
      s: rnd(3, 7),
      t: rnd(0.6, 1.2),
    });
  }
  snd(440, 0.1, "square", 0.03);
  setTimeout(() => snd(660, 0.15, "triangle", 0.04), 70);
  setTimeout(() => snd(880, 0.25, "triangle", 0.04), 150);
}

/** Destello al conseguir un objeto épico (2) o legendario (3), con el color de su rareza. */
function lootFX(px, py, r) {
  if (r < 2) return;
  const c = r >= 3 ? ["#ff9a2e", "#ffd34a", "#ffffff"] : ["#b07af0", "#d9b8ff", "#ffffff"],
    n = (LOW ? 8 : 18) + (r >= 3 ? 10 : 0);
  FX.push({ k: "ring", x: px, y: py, r: r >= 3 ? 90 : 60, t: 0.5, m: 0.5, c: c[0] });
  for (let i = 0; i < n; i++) {
    const a = rnd(0, 6.28),
      v = rnd(50, 170);
    starFX(px, py, pick(c), { vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, g: 120, t: rnd(0.5, 1) });
  }
}
