/* ======================================================================
 * src/js/game/run.js
 * Inicio de partida (run) y recálculo de estadísticas del jugador (ST).
 *
 * Define:
 * run, ST
 * ====================================================================== */

// ===== PARTIDA =====
function run(wi) {
  trnCubes("down"); // el estado nuevo se prepara ya; los cubitos tapan el cambio
  G = { st: "play", seed: Date.now() % 1e9, d: 1, ov: 0, kills: 0, fromRun: 1 };
  const a = { str: 3, dex: 3, int: 3, vit: 3, agi: 3, luk: 3 },
    w = mk(wi);
  a[w.sc] += 4;
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
    cd: [0, 0, 0, 0],
    eq: {},
    tal: {},
    pts: 0,
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
  };
  bagInit();
  ST();
  P.hp = P.mhp;
  P.mp = P.mmp;
  AL = [];
  TR = [];
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
  const T = P.tal;
  P.arm += 6 * (T.skin || 0);
  P.cc = Math.min(0.85, P.cc + 0.04 * (T.hunt || 0));
  P.els += 0.01 * (T.thirst || 0);
  P.mmp += 20 * (T.will || 0);
  P.mr += 1.5 * (T.will || 0);
  P.mhp = Math.round(P.mhp * (1 + 0.01 * U("vig")));
  if (P.hp > P.mhp) P.hp = P.mhp;
  if (P.mp > P.mmp) P.mp = P.mmp;
}

