/* ======================================================================
 * src/js/bosses/boss-core.js
 * Infraestructura común de jefes: zonas telegrafiadas, proyectiles, embestidas, tabla BD y selección de jefe.
 *
 * Define:
 * AMB, amb, los, tz, bt, brs, dsh, ring, tp, BD, FIN, bossDepth, bossIdx
 * ====================================================================== */

// ===== JEFES: 7 normales + 5 finales. Cada uno tiene su propia funcion de comportamiento (BO[i].up) =====
// Infraestructura comun: vida, daño, fases (por % de vida), inmunidad (imm), ventana de vulnerabilidad (vul, +60% daño),
// zonas telegrafiadas (tz), proyectiles (bt/brs con curva cv o rastreo hm) y embestidas (dsh). Lo específico está en cada jefe.
Object.assign(ET, {
  dummy: { hp: 300, sp: 0, dm: 0, r: 16, c: "#a86", ai: "x" },
  decoy: { hp: 1, sp: 0, dm: 0, r: 24, c: "#999", ai: "x" },
  orb: { hp: 40, sp: 0, dm: 0, r: 12, c: "#a4f", ai: "x" },
});
let AMB = [];
function amb(dt) {
  if (AMB.length < (LOW ? 16 : 40))
    AMB.push({ x: rnd(RB.x0, RB.x1), y: rnd(RB.y0, RB.y1), v: rnd(8, 26), s: rnd(1, 3), p: rnd(0, 6) });
  for (const a of AMB) {
    a.y -= a.v * dt;
    a.x += Math.sin((a.p += dt)) * 10 * dt;
    if (a.y < RB.y0) {
      a.y = RB.y1;
      a.x = rnd(RB.x0, RB.x1);
    }
  }
}
function los(a, b) {
  for (const o of RM_.obs)
    if (!o.pit)
      for (let i = 1; i < 12; i++) {
        const px = a.x + ((b.x - a.x) * i) / 12,
          py = a.y + ((b.y - a.y) * i) / 12;
        if (px > o.x && px < o.x + o.w && py > o.y && py < o.y + o.h) return false;
      }
  return true;
}
function tz(x0, y0, r, t, d, c) {
  bsnd((E.find((q) => q.t == "boss") || { bi: 0 }).bi, "atk");
  Z.push({ x: x0, y: y0, r, t, m: t, d, c: c || "#f55" });
}
function bt(e, a, sp, d, cv = 0, c = "#cf6", hm = 0) {
  PR.push({
    x: e.x,
    y: e.y,
    vx: Math.cos(a) * sp,
    vy: Math.sin(a) * sp,
    r: 6,
    d,
    l: 5,
    f: "e",
    c,
    cv,
    hm,
  });
}
function brs(e, n, sp, d, o = 0, cv = 0, c = "#f5a") {
  for (let i = 0; i < n; i++) bt(e, (i / n) * 6.283 + o, sp, d, cv, c);
}
function dsh(e, t, sp) {
  bsnd(e.bi || 0, "atk");
  const a = Math.atan2(P.y - e.y, P.x - e.x);
  e.lu = t;
  e.lh = 0;
  e.lvx = Math.cos(a) * sp;
  e.lvy = Math.sin(a) * sp;
  e.nr = 1;
}
const ring = (e, r, c) => FX.push({ k: "ring", x: e.x, y: e.y, r, t: 0.5, m: 0.5, c });
const tp = (e, rg) => {
  const a = rnd(0, 6.28);
  e.x = cl(P.x + Math.cos(a) * rg, 90, 870);
  e.y = cl(P.y + Math.sin(a) * rg, 90, 510);
};
const BD = [
  { n: "Valdris, el Duelista", c: "#d8d8f0", r: 24, hp: 0.8 },
  { n: "Gorgrim, el Coloso", c: "#b87", r: 38, hp: 1.4 },
  { n: "Sylra, la Centinela", c: "#6cd", r: 22, hp: 0.8 },
  { n: "Mirax, Maestro de Espejos", c: "#ccc", r: 26, hp: 0.9 },
  { n: "Veyra, la Trampera", c: "#c6f", r: 24, hp: 0.9 },
  { n: "Nyx, la Mudable", c: "#f66", r: 28, hp: 1 },
  { n: "Zeth, el Arconte", c: "#a4f", r: 30, hp: 1.1 },
  { n: "Soberano de Huesos", c: "#dcb", r: 36, hp: 2 },
  { n: "Fulgor, Heraldo del Rayo", c: "#fe6", r: 30, hp: 2 },
  { n: "Noctis, Devoradora de Luz", c: "#96c", r: 34, hp: 2 },
  { n: "Cronos, el Reloj Roto", c: "#8cf", r: 32, hp: 2 },
  { n: "El Vac\u00edo", c: "#556", r: 36, hp: 2.2 },
];
const FIN = (i) => (i > 6 && i < 12) || i >= 34,
  bossDepth = (i) => (i < 7 ? i + 1 : i < 12 ? (i - 6) * 10 : i < 34 ? i - 9 : (i - 28) * 10);
function bossIdx(d) {
  if (!G.bq) {
    const r = rngS(G.seed + 77),
      sh = (a) =>
        a
          .map((v) => [r(), v])
          .sort((p, q) => p[0] - q[0])
          .map((p) => p[1]),
      rg = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
    G.bq = { n: sh([...rg(0, 6), ...rg(12, 33)]), f: sh([...rg(7, 11), ...rg(34, 43)]) };
  }
  return d % 10 == 0
    ? G.bq.f[(d / 10 - 1) % G.bq.f.length]
    : G.bq.n[(d - 1 - ((d / 10) | 0)) % G.bq.n.length];
}

