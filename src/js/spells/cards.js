/* ======================================================================
 * src/js/spells/cards.js
 * Cartas de hechizo (Mago): niveles, requisitos, desbloqueos, normalización del guardado y equipamiento.
 *
 * Define:
 * ETIER, EFORM, STARTERS, EREQ, FN, tsum, CARDS, CORDER, reqOK, reqTxt, checkUnlocks
 * normS, equipCard, unequipCard, castCard
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
  EFORM = {
    fire: "bolt",
    ice: "nova",
    light: "bolt",
    water: "zone",
    plant: "zone",
    wind: "cone",
    rock: "bolt",
    dark: "cone",
    blood: "bolt",
    corr: "zone",
  },
  STARTERS = ["fire", "ice", "light"];
const EREQ = {
    water: [["depth", 2]],
    plant: [["depth", 3]],
    wind: [["depth", 4]],
    rock: [["boss", 0]],
    dark: [["boss", 2]],
    blood: [["boss", 4]],
    corr: [["boss", 6]],
  },
  FN = { bolt: "Proyectil", nova: "Nova", cone: "Cono", zone: "Zona" };
const tsum = (k) => k.split("+").reduce((s, z) => s + ETIER[z], 0),
  CARDS = {},
  CORDER = [];
Object.keys(EL)
  .sort((a, b) => ETIER[a] - ETIER[b])
  .forEach((k) => {
    CARDS[k] = { k, a: k, b: "", f: EFORM[k], n: EL[k].n, req: EREQ[k] || [] };
    CORDER.push(k);
  });
Object.keys(CB)
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
    CARDS[k] = { k, a, b, f: CB[k].f || "bolt", n: CB[k].n, req };
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
  S.cards = o(S.cards);
  S.cards.unlocked = o(S.cards.unlocked);
  const sl = Array.isArray(S.cards.slots) ? S.cards.slots.slice(0, 4) : [];
  while (sl.length < 4) sl.push(null);
  if (S.v !== 2) {
    S.v = 2;
    for (let i = 0; i < 7; i++) if (S.best > i + 1) S.bosses[i] = 1;
    STARTERS.forEach((k, i) => {
      S.cards.unlocked[k] = 1;
      sl[i] = k;
    });
  }
  checkUnlocks();
  for (const k in S.cards.unlocked) if (!CARDS[k]) delete S.cards.unlocked[k];
  S.cards.slots = sl.map((k) => (CARDS[k] && S.cards.unlocked[k] ? k : null));
  save();
}
normS();
function equipCard(k, sl) {
  if (!P || P.cls != "g" || !CARDS[k] || sl < 0 || sl > 3) return false;
  if (!S.cards.unlocked[k]) {
    flash("Carta bloqueada: " + CARDS[k].req.filter((r) => !reqOK(r)).map(reqTxt)[0]);
    return false;
  }
  const s = S.cards.slots,
    o = s.indexOf(k);
  if (o >= 0) s[o] = s[sl];
  s[sl] = k;
  save();
  return true;
}
function unequipCard(sl) {
  S.cards.slots[sl] = null;
  save();
}
function castCard(i) {
  const k = S.cards.slots[i];
  if (!k || !S.cards.unlocked[k] || !P || P.cls != "g") return;
  const c = CARDS[k];
  castSp({ a: c.a, b: c.b, f: c.f }, 4 + i);
}

