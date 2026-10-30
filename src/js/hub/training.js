/* ======================================================================
 * src/js/hub/training.js
 * Modo entrenamiento: menú, inicio y actualización.
 *
 * Define:
 * trainMenu, startTrain, trainTick
 * ====================================================================== */

function trainMenu() {
  show(
    "<h2>Campo de entrenamiento</h2><p>Maniquíes, un arquero de práctica (parry y proyectiles) y un combatiente. Sin XP, botín ni progreso.</p>",
    CLS.map((c, ci) => ({
      i: c.i,
      n: c.n,
      tp: "Entrenar",
      r: 0,
      d: c.d,
      stx: "Sin recompensas",
      nc: 1,
      t: "Entrenar",
      dis: !clsOK(ci),
      f: () => startTrain(ci),
    })).concat([back()]),
  );
}
function startTrain(ci) {
  run(ci);
  G.arena = 1;
  G.train = 1;
  P.lv = 8;
  P.a[P.w.sc] += 8;
  ST();
  P.hp = P.mhp;
  P.mp = P.mmp;
  G.R = [
    {
      gx: 0,
      gy: 0,
      nb: {},
      tp: "boss",
      cl: 1,
      dist: 0,
      obs: [
        { x: 200, y: 240, w: 40, h: 120 },
        { x: 720, y: 240, w: 40, h: 120 },
      ],
      hz: [],
      wv: 1,
      bs: 1,
    },
  ];
  G.seen = { 0: 1 };
  G.bi = BI[0];
  G.d = 1;
  enter(0, 4);
  flash("Entrenamiento: sin recompensas. F en el portal para salir.");
}
function trainTick(dt) {
  P.hp = Math.max(P.hp, P.mhp * 0.5);
  P.mp = P.mmp;
  G.tt = (G.tt || 0) - dt;
  if (G.tt > 0) return;
  G.tt = 1.5;
  const c = (t) => E.filter((q) => q.t == t && q.hp > 0).length,
    sp = (t, x0, y0) => {
      const q = spawn(t, x0, y0);
      q.al = 1;
      q.dmg *= 0.5;
      if (t == "dummy") q.hp = q.mhp = 400;
    };
  if (c("dummy") < 3) sp("dummy", rnd(250, 700), rnd(120, 480));
  if (!c("archer")) sp("archer", 780, 300);
  if (!c("grunt")) sp("grunt", 200, 450);
}

