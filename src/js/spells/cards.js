/* ======================================================================
 * src/js/spells/cards.js
 * Cartas de hechizo: niveles, requisitos, desbloqueos, normalización del guardado y equipamiento.
 *
 * Define:
 * ETIER, STARTERS, EREQ, FN, tsum, CARDS, CORDER, EORDER, reqOK, reqTxt, checkUnlocks
 * normS, pairKey, pairState, castUnits, unitAt, equipCard, unequipCard, cardsChanged, toggleSplit, castCard
 * ====================================================================== */

// ===== CARTAS DE HECHIZO (solo Mago), PROGRESO PERMANENTE Y HUD =====
// Progreso PERMANENTE (localStorage, S): mejor profundidad, jefes derrotados en partidas normales, cartas desbloqueadas y espacios equipados.
// Progreso TEMPORAL (P, se reinicia en cada run): vida, maná, nivel, equipo, reliquias, talentos. La práctica (Arena) no escribe nada permanente.
const ETIER = {
    fire: 0,
    ice: 0,
    light: 0,
    water: 1,
    plant: 1,
    wind: 1,
    rock: 2,
    dark: 2,
    blood: 3,
    corr: 3,
  },
  STARTERS = ["fire", "ice", "light"],
  FN = SPF;
const EREQ = {
  water: [["depth", 2]],
  plant: [["depth", 3]],
  wind: [["depth", 4]],
  rock: [["boss", 0]],
  dark: [["boss", 2]],
  blood: [["boss", 4]],
  corr: [["boss", 6]],
};
const tsum = (k) => k.split("+").reduce((s, z) => s + ETIER[z], 0),
  CARDS = {},
  CORDER = [], // los 55 hechizos: primero los 10 comunes y luego las 45 combinaciones
  EORDER = []; // solo los 10 comunes (los únicos que se arrastran a las casillas)
Object.keys(EL)
  .sort((a, b) => ETIER[a] - ETIER[b])
  .forEach((k) => {
    CARDS[k] = { k, a: k, b: "", f: CB[k].f, n: CB[k].n, req: EREQ[k] || [] };
    CORDER.push(k);
    EORDER.push(k);
  });
Object.keys(CB)
  .filter((k) => k.includes("+"))
  .sort((p, q) => tsum(p) - tsum(q) || p.localeCompare(q))
  .forEach((k) => {
    const [a, b] = k.split("+"),
      t = tsum(k),
      req = [
        ["card", a],
        ["card", b],
        ["depth", 2 + t],
      ];
    if (t >= 4) req.push(["boss", t - 2]);
    CARDS[k] = { k, a, b, f: CB[k].f, n: CB[k].n, req };
    CORDER.push(k);
  });
const reqOK = (r) =>
  r[0] == "depth"
    ? S.best >= r[1]
    : r[0] == "boss"
      ? Object.keys(S.bosses).length > r[1]
      : !!S.cards.unlocked[r[1]];
const reqTxt = (r) =>
  r[0] == "depth"
    ? `Alcanzar la profundidad ${r[1]} (tu mejor: ${S.best})`
    : r[0] == "boss"
      ? `Derrotar a ${r[1] + 1} jefes distintos en partidas normales`
      : `Tener la carta de ${EL[r[1]].n}`;
function checkUnlocks() {
  const nu = [];
  let ch = 1;
  while (ch) {
    ch = 0;
    for (const k of CORDER)
      if (!S.cards.unlocked[k] && CARDS[k].req.every(reqOK)) {
        S.cards.unlocked[k] = 1;
        nu.push(CARDS[k].n);
        ch = 1;
      }
  }
  const nc = clsCheck(); // clases nuevas (data/classes.js)
  if (nc.length) G.ncl = (G.ncl || []).concat(nc);
  return nu;
}
// Guardado: tolera datos inexistentes, incompletos, corruptos o antiguos (v1 sin cartas → v2; los jefes de profundidades superadas se dan por derrotados)
function normS() {
  const o = (v) => (v && typeof v == "object" && !Array.isArray(v) ? v : {});
  S.best = +S.best || 0;
  S.souls = +S.souls || 0;
  S.pw = +S.pw || 0;
  S.hard = !!S.hard;
  if (S.hard && !S.hv2 && S.best < 11) S.hard = false;
  if (S.best >= 11) S.hard = true;
  if (S.hard) S.hv2 = 1;
  S.st = o(S.st);
  S.up = o(S.up);
  if (S.fv !== 2) {
    S.fv = 2;
    S.souls += (40 * S.pw * (S.pw + 1)) / 2;
    S.pw = 0;
  }
  S.bk = o(S.bk);
  S.ach = o(S.ach);
  S.bosses = o(S.bosses);
  S.cu = o(S.cu);
  S.cards = o(S.cards);
  S.cards.unlocked = o(S.cards.unlocked);
  let sl = Array.isArray(S.cards.slots) ? S.cards.slots.slice(0, 4) : [];
  while (sl.length < 4) sl.push(null);
  if (S.v !== 2) {
    S.v = 2;
    for (let i = 0; i < 7; i++) if (S.best > i + 1) S.bosses[i] = 1;
    STARTERS.forEach((k, i) => {
      S.cards.unlocked[k] = 1;
      sl[i] = k;
    });
  }
  S.cards.seen = o(S.cards.seen);
  if (S.cards.cv !== 3) {
    // Sistema nuevo (v3): las ranuras solo guardan elementos comunes y las combinaciones nacen de las parejas (1+2, 3+4).
    // Una combinación equipada en el sistema antiguo se descompone en sus dos elementos y se da por descubierta.
    const el = [];
    for (const k of sl)
      if (k)
        for (const z of k.split("+")) {
          if (!el.includes(z)) el.push(z);
          if (k.includes("+")) S.cards.seen[k] = 1;
        }
    sl = [0, 1, 2, 3].map((i) => el[i] || null);
    S.cards.cv = 3;
  }
  checkUnlocks();
  for (const k in S.cards.unlocked) if (!CARDS[k]) delete S.cards.unlocked[k];
  for (const k in S.cards.seen) if (!CB[k] || !k.includes("+")) delete S.cards.seen[k];
  S.cards.slots = sl.map((k) => (EL[k] && S.cards.unlocked[k] ? k : null));
  S.cards.split = [0, 1].map((i) => (Array.isArray(S.cards.split) && S.cards.split[i] ? 1 : 0));
  save();
}
normS();
// ---- Ranuras: 4 casillas en 2 parejas (1+2 y 3+4). Cada casilla guarda un elemento común; al completar una pareja con una
// combinación desbloqueada, los dos elementos se funden en ese hechizo (que ocupa la pareja entera) salvo que se separen.
const pairKey = (p) => {
  const s = S.cards.slots,
    a = s[2 * p],
    b = s[2 * p + 1];
  return a && b && a != b ? [a, b].sort().join("+") : null;
};
function pairState(p) {
  const k = pairKey(p),
    un = !!(k && S.cards.unlocked[k]);
  return { p, k, a: S.cards.slots[2 * p], b: S.cards.slots[2 * p + 1], unlocked: un, seen: !!(k && S.cards.seen[k]), split: !!S.cards.split[p], fused: un && !S.cards.split[p] };
}
// Hechizos lanzables ahora: una pareja fundida cuenta como uno solo; si no, cada casilla con elemento es un hechizo común.
function castUnits() {
  const out = [];
  for (let p = 0; p < 2; p++) {
    const st = pairState(p);
    if (st.fused) out.push({ slot: 2 * p, slots: [2 * p, 2 * p + 1], k: st.k, pair: p });
    else
      for (const i of [2 * p, 2 * p + 1]) if (S.cards.slots[i]) out.push({ slot: i, slots: [i], k: S.cards.slots[i] });
  }
  return out;
}
const unitAt = (i) => castUnits().find((u) => u.slots.includes(i));
// Equipa el elemento k en la casilla sl (si ya estaba en otra casilla, las intercambia). Devuelve { ok, disc } (disc = combinación recién descubierta).
function equipCard(k, sl) {
  if (!mageOn() || !EL[k] || sl < 0 || sl > 3) return { ok: false };
  if (!S.cards.unlocked[k]) {
    flash("Carta bloqueada: " + CARDS[k].req.filter((r) => !reqOK(r)).map(reqTxt)[0]);
    return { ok: false };
  }
  const s = S.cards.slots,
    o = s.indexOf(k);
  if (o == sl) return { ok: true, disc: null };
  if (o >= 0) s[o] = s[sl];
  s[sl] = k;
  return cardsChanged([sl >> 1, o >= 0 ? o >> 1 : -1]);
}
function unequipCard(sl) {
  S.cards.slots[sl] = null;
  return cardsChanged([sl >> 1]);
}
function cardsChanged(ps) {
  let disc = null;
  for (const p of new Set(ps))
    if (p >= 0) {
      S.cards.split[p] = 0;
      const st = pairState(p);
      if (st.unlocked && !st.seen) {
        S.cards.seen[st.k] = 1;
        disc = st.k;
      }
    }
  save();
  return { ok: true, disc };
}
function toggleSplit(p) {
  const st = pairState(p);
  if (!st.unlocked) return false;
  S.cards.split[p] ^= 1;
  save();
  return true;
}
function castCard(i) {
  if (!mageOn()) return;
  const u = unitAt(i);
  if (u) castSp({ k: u.k, u }, 4 + u.slot);
}
