/* ======================================================================
 * src/js/data/items.js
 * Equipo: ranuras, catálogo de objetos (IT), nombres de atributos y generación de botín.
 *
 * Define:
 * SLOT, rcap, emptyB, pickIT, IT, N, RC, fv, meets, stT
 * ====================================================================== */

// ===== OBJETOS, EQUIPO E INVENTARIO =====
const SLOT = { w: "Arma", h: "Casco", b: "Armadura", g: "Guantes", f: "Botas", a: "Accesorio" };
const rcap = () => (P.lv <= 5 ? 1 : 3),
  emptyB = () => Math.min(0.03, 0.01 * ["h", "b", "g", "f", "a"].filter((k) => !P.eq[k]).length);
function pickIT() {
  const pl = IT.filter((i) => (i.r || 0) <= rcap()),
    w = pl.map((i) => (P.eq[i.s] ? 1 : 1.5));
  let r = Math.random() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pl.length; i++) {
    r -= w[i];
    if (r <= 0) return pl[i];
  }
  return pl[0];
}
const IT = [
  {
    n: "Coraza del Coloso",
    s: "b",
    i: "🛡️",
    r: 3,
    st: { arm: 24, hp: 50, r_fire: 0.15 },
    d: "Forjada en el corazón de un coloso.",
    req: { str: 10 },
  },
  {
    n: "Yelmo del Abismo",
    s: "h",
    i: "👑",
    r: 3,
    st: { arm: 12, cc: 0.06, mp: 25 },
    d: "Susurra desde las profundidades.",
  },
  {
    n: "Casco de hierro",
    s: "h",
    i: "⛑️",
    r: 0,
    st: { arm: 6 },
    d: "Un casco robusto de soldado.",
  },
  {
    n: "Capucha del sombrío",
    s: "h",
    i: "🎩",
    r: 1,
    st: { cc: 0.05, mp: 15 },
    d: "Afila los sentidos y la mente.",
  },
  {
    n: "Coraza de escamas",
    s: "b",
    i: "🦺",
    r: 1,
    st: { arm: 12, hp: 20 },
    d: "Armadura pesada de placas.",
    req: { str: 6 },
  },
  {
    n: "Túnica arcana",
    s: "b",
    i: "👘",
    r: 1,
    st: { mp: 30, arm: 3 },
    d: "Tejida con hilo de maná.",
    req: { int: 6 },
  },
  {
    n: "Guantes de cazador",
    s: "g",
    i: "🧤",
    r: 0,
    st: { as: 0.08, cc: 0.03 },
    d: "Agarre ligero: golpes más rápidos.",
  },
  { n: "Botas veloces", s: "f", i: "👢", r: 1, st: { spd: 0.1 }, d: "Ligeras botas de corredor." },
  {
    n: "Anillo sangriento",
    s: "a",
    i: "💍",
    r: 2,
    st: { ls: 0.02, dm: 0.06 },
    d: "Roba vida con cada golpe.",
  },
  {
    n: "Amuleto de furia",
    s: "a",
    i: "📿",
    r: 2,
    st: { dm: 0.1, hp: -10 },
    d: "Poder a cambio de fragilidad.",
  },
  {
    n: "Cinturón del acechador",
    s: "a",
    i: "🥋",
    r: 2,
    st: { cc: 0.08, cm: 0.3 },
    d: "Críticos más letales.",
    req: { dex: 8 },
  },
  {
    n: "Manto ignífugo",
    s: "b",
    i: "🧥",
    r: 1,
    st: { arm: 6, r_fire: 0.3 },
    d: "Reduce el daño de fuego (cavernas de lava).",
  },
  {
    n: "Gorro de escarcha",
    s: "h",
    i: "🧢",
    r: 1,
    st: { arm: 3, r_ice: 0.3 },
    d: "Reduce el daño de hielo (abismos helados).",
  },
  {
    n: "Amuleto antiveneno",
    s: "a",
    i: "🧿",
    r: 1,
    st: { r_poison: 0.35, r_corr: 0.15 },
    d: "Resiste veneno y corrupción.",
  },
  {
    n: "Pendiente aislante",
    s: "a",
    i: "💎",
    r: 1,
    st: { r_light: 0.35, mp: 10 },
    d: "Resiste el rayo de las ruinas arcanas.",
  },
];
const N = {
    arm: "Armadura",
    hp: "Vida",
    mp: "Maná",
    cc: "Crítico",
    cm: "Daño crít.",
    as: "Vel. ataque",
    spd: "Velocidad",
    dm: "Daño",
    ls: "Robo de vida",
  },
  RC = ["#9aa", "#6af", "#c7f", "#fa3"],
  fv = (k, v) => (["arm", "hp", "mp"].includes(k) ? v : Math.round(v * 100) + "%"),
  meets = (it) => Object.entries(it.req || {}).every(([k, v]) => P.a[k] >= v);
Object.assign(N, {
  r_fire: "Res. fuego",
  r_ice: "Res. hielo",
  r_poison: "Res. veneno",
  r_corr: "Res. corrupción",
  r_light: "Res. rayo",
});
const stT = (st) =>
  Object.entries(st)
    .map(([k, v]) => `${v > 0 ? "+" : ""}${fv(k, v)} ${N[k]}`)
    .join(" · ");
