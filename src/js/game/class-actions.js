/* ======================================================================
 * src/js/game/class-actions.js
 * Acción de clase (tecla R): escudo, trampa, invocación, rayo, cono, etc. y lógica de trampas/aliados.
 *
 * Define:
 * TR, AL, TM, classAction, spl
 * ====================================================================== */

let TR = [],
  AL = [];
const TM = {
  shield: "Escudo arcano",
  trap: "Trampa de escarcha",
  summon: "Invocar espíritu",
  beam: "Rayo canalizado",
  cone: "Aliento ígneo",
};
function classAction(dt) {
  const s = P.tm;
  if (s == "beam") {
    if (P.mp > 0) {
      P.mp -= 25 * dt * mpK();
      P.bd = (P.bd || 0) - dt;
      if (P.bd <= 0) {
        P.bd = 0.12;
        const a = P.face;
        FX.push({
          k: "line",
          x: P.x,
          y: P.y,
          x2: P.x + Math.cos(a) * 380,
          y2: P.y + Math.sin(a) * 380,
          t: 0.12,
          m: 0.12,
        });
        for (const e of E)
          if (e.hp > 0) {
            const px = e.x - P.x,
              py = e.y - P.y,
              u = cl(px * Math.cos(a) + py * Math.sin(a), 0, 380);
            if (Math.hypot(px - Math.cos(a) * u, py - Math.sin(a) * u) < e.r + 8)
              hit(e, wd(0.35), "m", { fx: { slow: 0.5 } });
          }
      }
    }
    return;
  }
  if (P.cd[3] > 0) return;
  const w = P.w.s;
  if (s == "shield") {
    if (P.mp < spMp(20)) return;
    P.mp -= spMp(20);
    P.sh = 30 + P.a.int * 8;
    P.cd[3] = 10;
  } else if (s == "trap") {
    if (P.mp < spMp(15)) return;
    P.mp -= spMp(15);
    P.cd[3] = 4;
    TR.push({ x: M.x, y: M.y, t: 15 });
  } else if (s == "summon") {
    if (P.mp < spMp(30)) return;
    P.mp -= spMp(30);
    P.cd[3] = 14;
    AL.push({ x: P.x, y: P.y, t: 15, c: 0 });
  } else if (s == "cone") {
    if (P.mp < spMp(18)) return;
    P.mp -= spMp(18);
    P.cd[3] = 5;
    FX.push({ k: "arc", x: P.x, y: P.y, a: P.face, r: 150, w: 1.2, t: 0.25, m: 0.25 });
    for (const e of E)
      if (e.hp > 0 && dist(P, e) < 150 + e.r && Math.abs(nrm(ang(P, e) - P.face)) < 0.6)
        hit(e, wd(1.6), "m", { fx: { burn: 3 } });
  } else if (w == "m" && P.w.bleed) {
    P.cd[3] = 8;
    for (const e of E)
      if (e.hp > 0 && e.st.bleedN > 0 && dist(P, e) < 300) {
        const n = e.st.bleedN;
        e.st.bleedN = 0;
        e.st.bleed = 0;
        hit(e, wd(0.6) * n, "p", { a: ang(P, e), kb: 100 });
      }
    flash("¡Detonación de hemorragia!");
  } else if (w == "m") {
    P.bt = 6;
    P.cd[3] = 14;
    P.sh = 20 + P.a.vit * 4;
    flash("¡Grito de guerra!");
  } else if (w == "r") {
    P.cd = P.cd.map((c, i) => (i < 3 ? 0 : c));
    P.cd[3] = 18;
    flash("Recarga ágil");
  } else {
    P.mp = Math.min(P.mmp, P.mp + P.mmp * 0.4);
    P.cd[3] = 12;
    flash("Canalizas maná");
  }
}
function spl(dt) {
  zn(dt);
  P.stcd -= dt;
  for (const t of TR) {
    t.t -= dt;
    for (const e of E)
      if (e.hp > 0 && dist(t, e) < e.r + 30) {
        t.t = 0;
        area(t.x, t.y, 100, wd(1), "m", { fx: { slow: 3, stun: 1 }, c: "#9fe8ff" });
        break;
      }
  }
  TR = TR.filter((t) => t.t > 0);
  for (const a of AL) {
    a.t -= dt;
    a.c -= dt;
    const tg = E.filter((e) => e.hp > 0).sort((p, q) => dist(p, a) - dist(q, a))[0],
      d = ang(a, P);
    if (dist(a, P) > 70) {
      a.x += Math.cos(d) * 150 * dt;
      a.y += Math.sin(d) * 150 * dt;
    }
    if (tg && a.c <= 0) {
      a.c = 0.8;
      const g = ang(a, tg);
      PR.push({
        x: a.x,
        y: a.y,
        vx: Math.cos(g) * 500,
        vy: Math.sin(g) * 500,
        s: 500,
        r: 5,
        d: wd(0.5),
        t: "m",
        l: 1,
        l0: 1,
        pc: 0,
        bn: 0,
        f: "p",
        h: new Set(),
        c: "#8fe",
      });
    }
  }
  AL = AL.filter((a) => a.t > 0);
}

