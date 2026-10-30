/* ======================================================================
 * src/js/game/run.js
 * Inicio de partida (run) y recálculo de estadísticas del jugador (ST).
 *
 * Define:
 * mkPlayer, run, ST
 * ====================================================================== */

// ===== PARTIDA =====
// Crea el jugador de la clase `ci` (índice de CLS; -1 = aprendiz sin clase, solo para la sala de clases).
function mkPlayer(ci) {
  const c = ci >= 0 && CLS[ci] ? CLS[ci] : CLS_NONE,
    a = { str: 3, dex: 3, int: 3, vit: 3, agi: 3, luk: 3 },
    w = mk(c.w);
  a[w.sc] += 4;
  for (const k in c.a2) a[k] += c.a2[k];
  P = {
    x: 480,
    y: 300,
    vx: 0,
    vy: 0,
    r: 12,
    lv: 1,
    xp: 0,
    nx: 30,
    pend: 0,
    a,
    w,
    gold: 0,
    relics: [],
    inv: 0,
    dcd: 0,
    acd: 0,
    cd: new Array(10).fill(0), // 0 Q · 1 E · 2 clic der. · 3 R · 4-7 cartas · 8 habilidad de rama (C)
    eq: {},
    tal: {},
    pts: 0,
    ci: c == CLS_NONE ? -1 : ci,
    ck: c.k,
    br: c.br,
    nov: c == CLS_NONE ? 1 : 0, // aprendiz: sin habilidades ni HUD de combate
    cls: w.s,
    cb: 0,
    gt: 0,
    dm: 1 + 0.005 * U("pow"),
    cm: 1.6,
    ccb: 0,
    ls: 0,
    bhp: 0,
    bmp: 0,
    bmr: 0,
    bsp: 0,
    barm: 0,
    bn: 0,
    fz: 0,
    fl: 0,
    pcd: 0,
    dr: 0,
    ovc: 0,
    ovr: 0,
    pol: 0,
    wt: 0,
    pbt: 0, // contragolpe (mejora del Guerrero): segundos de bonus tras un parry perfecto
    lsa: 0, // robo de vida del Asesino curado en el último instante (limitador)
    keys: {}, // objetos clave de la partida
  };
  bagInit();
  ST();
  P.hp = P.mhp;
  P.mp = P.mmp;
  return P;
}
function run(ci) {
  trnCubes("down"); // el estado nuevo se prepara ya; los cubitos tapan el cambio
  G = { st: "play", seed: Date.now() % 1e9, d: 1, ov: 0, kills: 0, fromRun: 1, t0: Date.now() };
  mkPlayer(ci);
  TR = [];
  FZ = [];
  LT = [];
  SBH = [];
  BHZ = [];
  ZN = [];
  K = {};
  M.d = M.r = 0;
  E = [];
  PR = [];
  Z = [];
  FX = [];
  NM = [];
  shake = 0;
  hide();
  genLevel();
  enter(0, 4);
  music();
}
function ST() {
  const a = P.a;
  P.tm = tmCalc(); // modificadores de las mejoras de clase (game/talents.js)
  P.mhp = 60 + a.vit * 10 + P.bhp;
  P.mmp = 30 + a.int * 6 + P.bmp;
  P.spd = 185 * (1 + 0.015 * a.agi + P.bsp + 0.01 * U("spd"));
  P.as = 1 + 0.015 * a.agi;
  P.arm = a.vit * 1.5 + P.barm + U("arm");
  P.mr = 3 + a.int * 0.5 + P.bmr;
  P.cc = Math.min(0.75, P.w.crit + a.dex * 0.004 + a.luk * 0.004 + P.ccb);
  P.edm = 1;
  P.els = 0;
  P.ecm = 0;
  for (const s in P.eq) {
    const q = P.eq[s].st;
    P.mhp += q.hp || 0;
    P.mmp += q.mp || 0;
    P.arm += q.arm || 0;
    P.spd *= 1 + (q.spd || 0);
    P.as += q.as || 0;
    P.cc = Math.min(0.85, P.cc + (q.cc || 0));
    P.edm += q.dm || 0;
    P.els += q.ls || 0;
    P.ecm += q.cm || 0;
  }
  P.res = {};
  for (const s in P.eq) {
    const q = P.eq[s].st;
    for (const k in q)
      if (k.startsWith("r_")) P.res[k.slice(2)] = Math.min(0.6, (P.res[k.slice(2)] || 0) + q[k]);
  }
  // mejoras de clase que modifican estadísticas (el resto las leen las propias habilidades, ver tv())
  P.arm += tv("arm");
  P.cc = Math.min(0.85, P.cc + tv("cc"));
  P.mmp += tv("mmp");
  P.mr += tv("mr");
  P.as += tv("as");
  // bonificaciones pasivas de la clase (ver CLS en data/classes.js)
  const B = (CLS[P.ci] || CLS_NONE).bon;
  if (B.hp) P.mhp *= 1 + B.hp;
  if (B.mp) P.mmp *= 1 + B.mp;
  if (B.arm) P.arm += B.arm;
  if (B.spd) P.spd *= 1 + B.spd;
  if (B.as) P.as += B.as;
  if (B.cc) P.cc = Math.min(0.85, P.cc + B.cc);
  if (B.dm) P.edm += B.dm;
  P.mmp = Math.round(P.mmp);
  P.mhp = Math.round(P.mhp * (1 + 0.01 * U("vig")));
  if (P.hp > P.mhp) P.hp = P.mhp;
  if (P.mp > P.mmp) P.mp = P.mmp;
}

