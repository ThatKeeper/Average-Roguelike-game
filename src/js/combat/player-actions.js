/* ======================================================================
 * src/js/combat/player-actions.js
 * Acciones de combate del jugador: parry, daño recibido, esquivar, disparar, atacar y habilidades Q/E/clic derecho.
 *
 * Define:
 * parryFx, parryProj, hurtP, die, dodge, shoot, atk, AB, ab
 * ====================================================================== */

function parryFx() {
  cnt("pf");
  chk();
  P.pcd = 0.9;
  P.inv = 0.25;
  G.hs = 0.07;
  FX.push(
    { k: "ring", x: P.x, y: P.y, r: 60, t: 0.25, m: 0.25, c: "#fff" },
    { k: "ring", x: P.x, y: P.y, r: 34, t: 0.2, m: 0.2, c: "#ffd34a" },
  );
  snd(1300, 0.12, "triangle", 0.07);
  snd(1900, 0.2, "sine", 0.05);
}
function parryProj(p) {
  cnt("pj");
  let b = null,
    bd = 1e9;
  for (const q of E)
    if (q.hp > 0 && q.t != "decoy" && q.t != "orb" && dist(p, q) < bd) {
      bd = dist(p, q);
      b = q;
    }
  parryFx();
  const a = b ? ang(p, b) : Math.atan2(-p.vy, -p.vx),
    sp = Math.max(420, Math.hypot(p.vx, p.vy) * 1.3);
  Object.assign(p, {
    rf: 1,
    f: "p",
    t: "p",
    d: p.d * 2,
    h: new Set(),
    pc: 0,
    l: 2,
    hm: 0,
    cv: 0,
    sf: null,
    vx: Math.cos(a) * sp,
    vy: Math.sin(a) * sp,
    c: "#fff",
  });
}
function hurtP(d, src) {
  if (DBG.god) return;
  if (P.inv > 0 || (P.dash && P.dash.inv)) return;
  d *= 1 - P.arm / (P.arm + 100);
  if (src && src.st && src.st.curse > 0) d *= 0.75;
  const be = EBI[(G.d - 1) % 8];
  if (be && P.res[be]) d *= 1 - P.res[be];
  if (P.g) {
    if (P.gt < 0.22 && src && !(P.pcd > 0)) {
      parryFx();
      apply(src, { stun: 1.2 });
      if (src.hp > 0) hit(src, (src.dmg || d) * 2, "p", { nl: 1 });
      return;
    }
    d *= P.gr ? 0.2 : 0.35;
  }
  if (P.sh > 0) {
    const a = Math.min(P.sh, d);
    P.sh -= a;
    d -= a;
  }
  P.hp -= d;
  if (G.train && P.hp < 1) P.hp = P.mhp;
  G.hurt = 1;
  P.inv = 0.5;
  P.fl = 0.15;
  shake = Math.max(shake, 6);
  nm(P.x, P.y - 20, d, "#f66");
  snd(110, 0.12, "sawtooth", 0.06);
  if (P.hp <= 0) die();
}
function die(q) {
  if (G.st != "play") return;
  if (!q && U("rev") && !G.revd && !G.arena) {
    G.revd = 1;
    P.hp = P.mhp * 0.5;
    P.inv = 2.5;
    flash("¡Renaces!");
    FX.push({ k: "ring", x: P.x, y: P.y, r: 120, t: 0.5, m: 0.5, c: "#ffd34a" });
    return;
  }
  G.st = "over";
  cnt("dt");
  chk();
  const s = G.arena ? 0 : Math.floor(P.gold / 2);
  if (!G.arena) {
    S.best = Math.max(S.best, G.d);
    S.souls += s;
    G.nu = checkUnlocks();
    save();
  }
  show(
    `<h1>${q ? "EXPEDICIÓN ABANDONADA" : "HAS CAÍDO"}</h1><p>Profundidad ${G.d} · Nivel ${P.lv} · ${G.kills} enemigos</p>${G.nu && G.nu.length ? "<p>¡Cartas nuevas: " + G.nu.join(", ") + "!</p>" : ""}<p>Pierdes tu equipo y reliquias. Conviertes ${s} oro en almas (total ${S.souls}).</p>`,
    [{ t: "Volver a la zona segura", nc: 1, f: menu }],
  );
}
function dodge() {
  if (P.dcd > 0 || P.dash) return;
  const ix = (K[KY.right] ? 1 : 0) - (K[KY.left] ? 1 : 0),
    iy = (K[KY.down] ? 1 : 0) - (K[KY.up] ? 1 : 0);
  let a = ix || iy ? Math.atan2(iy, ix) : P.face;
  P.dash = { t: 0.17, vx: Math.cos(a) * 540, vy: Math.sin(a) * 540, inv: 1 };
  P.inv = 0.3;
  P.dcd = (0.8 * (1 - 0.1 * (P.tal.refl || 0))) / (1 + 0.01 * P.a.agi);
  snd(400, 0.1, "triangle");
  FX.push({ k: "ring", x: P.x, y: P.y, r: 18, t: 0.2, m: 0.2, c: "#9cf" });
}
function shoot(a, sp, d, t, o = {}) {
  const sd = a + (o.sp ? rnd(-o.sp, o.sp) : 0),
    mz = Math.min(30, o.mz ?? rangedMuzzle(P.w)); // sale de la boca del arma (con tope para no nacer dentro de un muro)
  PR.push(
    Object.assign(
      {
        x: P.x + Math.cos(a) * mz,
        y: P.y + Math.sin(a) * mz,
        vx: Math.cos(sd) * sp,
        vy: Math.sin(sd) * sp,
        s: sp,
        r: o.r || 5,
        d,
        t,
        l: o.l || 1.1,
        l0: o.l || 1.1,
        pc: o.pierce || 0,
        bn: o.bounce || 0,
        f: "p",
        h: new Set(),
        c: o.c || "#ffe9a0",
      },
      o,
    ),
  );
}
function atk() {
  const w = P.w,
    a = P.face;
  P.at = w.s == "m" ? 0.2 : 0.12;
  if (w.s == "m") {
    // el daño lo aplica el propio sprite al moverse (ver combat/melee-swing.js)
    const c = (P.cb = (P.cb + 1) % 3) == 2;
    P.acd = w.cd / P.as;
    startSwing(w, a, c, P.acd);
    snd(w.n == "Martillo" ? 90 : 230, 0.08, "sawtooth");
  } else if (w.s == "r") {
    if (P.rl > 0) return;
    if (w.mag && (P.am = (P.am ?? w.mag) - 1) <= 0) {
      P.rl = w.rt || 1.6;
      P.am = w.mag;
      flash("Recargando...");
    }
    const art = RANGED_ART[w.n],
      o = {
        pierce: w.pierce,
        bounce: w.bounce,
        ret: w.ret,
        sp: w.spread,
        fx: w.fx ? { poison: 3 } : null,
        c: w.ret ? "#ccc" : "#fff",
        spr: art && art.proj,
      };
    if (w.n == "Chakram") o.r = 11; // el radio de colisión sigue al tamaño del sprite
    shoot(a, w.sp, wd(), "p", o);
    rangedKick();
    P.acd = w.cd / P.as;
    snd(w.n == "Ballesta" ? 140 : 520, 0.07, "square");
  } else {
    if (P.mp < w.mp) return;
    P.mp -= w.mp;
    const el = w.el,
      f =
        el == "fire"
          ? { burn: 3 }
          : el == "ice"
            ? { slow: 2.5 }
            : el == "poison"
              ? { poison: 5 }
              : el == "water"
                ? { wet: 5 }
                : null;
    shoot(a, w.sp, wd(), "m", {
      pierce: w.pierce,
      fx: f,
      ex: el == "fire" ? 55 : 0,
      ch: el == "light" ? 2 : 0,
      c: EC[el],
      r: 7,
      spr: RANGED_ART[w.n] && RANGED_ART[w.n].proj,
    });
    rangedKick();
    P.acd = w.cd / P.as;
    snd(700, 0.08, "sine");
  }
}
const AB = {
  m: [
    { cd: 6, f: () => area(P.x, P.y, 115, wd(1.8), "p", { c: "#f93" }) },
    {
      cd: 8,
      f: () => {
        const a = P.face;
        P.dash = {
          t: 0.25,
          vx: Math.cos(a) * 620,
          vy: Math.sin(a) * 620,
          inv: 1,
          end: () => area(P.x, P.y, 90, wd(2.2), "p", { stun: 1, c: "#fc6" }),
        };
      },
    },
    {},
  ],
  r: [
    {
      cd: 6,
      f: () => {
        for (let i = -2; i <= 2; i++)
          shoot(P.face + i * 0.13, P.w.sp || 640, wd(0.7), "p", { c: "#fff", spr: projFor(false) });
      },
    },
    {
      cd: 7,
      f: () => shoot(P.face, 560, wd(1.5), "p", { ex: 95, c: "#fa4", r: 7, spr: projFor(true) }),
    },
    {
      cd: 5,
      f: () =>
        shoot(P.face, 600, wd(1.2), "p", {
          pierce: 3,
          fx: { poison: 5 },
          c: "#6e4",
          r: 6,
          spr: projFor(false),
          gl: "#6e4",
        }),
    },
  ],
  g: [
    {
      cd: 4,
      mp: 22,
      f: () =>
        shoot(P.face, 450, wd(2), "m", {
          ex: 100,
          fx: { burn: 3 },
          c: "#f60",
          r: 9,
          spr: "magia_ignea",
        }),
    },
    {
      cd: 8,
      mp: 25,
      f: () => area(P.x, P.y, 150, wd(0.8), "m", { fx: { slow: 3 }, c: "#9fe8ff", stun: 0.5 }),
    },
    {
      cd: 2.5,
      mp: 18,
      f: () => shoot(P.face, 1000, wd(1.1), "m", { ch: 4, c: "#fff27a", spr: "magia_tormenta" }),
    },
  ],
};
function ab(i) {
  const s = P.w.s,
    A = AB[s][i];
  if (!A.f || P.cd[i] > 0 || P.dash) return;
  const mcost = A.mp ? spMp(A.mp) : 0; // el coste de maná escala con el daño (ver mpK)
  if (mcost && P.mp < mcost) return;
  P.mp -= mcost;
  P.cd[i] = A.cd * (1 - 0.01 * U("cdr"));
  A.f();
  if (s != "m") rangedKick();
  snd(300, 0.15, "triangle");
}

