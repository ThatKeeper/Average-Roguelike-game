/* ======================================================================
 * src/js/combat/player-actions.js
 * Acciones de combate del jugador: parry, daño recibido, esquivar, disparar y atacar.
 *
 * Define:
 * parryFx, parryProj, hurtP, die, dodge, shoot, atk
 * (las habilidades Q/E/R/clic derecho están en game/class-actions.js)
 * ====================================================================== */

function parryFx() {
  cnt("pf");
  chk();
  P.pcd = 0.9;
  if (tv("pcDm")) P.pbt = 4; // Contragolpe (Guerrero)
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
  if (P.dr > 0) d *= P.dr > 1 ? 0.1 : 0.45; // Bastión (−55 %) / preparación del Golpe del coloso (−90 %)
  if (src && src.st && src.st.curse > 0) d *= 0.75;
  const be = EBI[(G.d - 1) % 8];
  if (be && P.res[be]) d *= 1 - P.res[be];
  if (P.g) {
    if (P.gt < 0.22 + tv("pw") && src && !(P.pcd > 0)) {
      parryFx();
      apply(src, { stun: 1.2 });
      if (src.hp > 0) hit(src, (src.dmg || d) * 2, "p", { nl: 1 });
      return;
    }
    d *= (P.gr ? 0.2 : 0.35) - tv("gdr");
  }
  if (P.sh > 0) {
    const a = Math.min(P.sh, d);
    P.sh -= a;
    d -= a;
  }
  P.hp -= d;
  if ((G.train || G.sbx) && P.hp < 1) P.hp = P.mhp;
  G.hurt = 1;
  P.inv = 0.5;
  P.fl = 0.15;
  shake = Math.max(shake, 6);
  nm(P.x, P.y - 20, d, "#f66");
  snd(110, 0.12, "sawtooth", 0.06);
  if (P.hp <= 0) die();
}
function die(q, fin) {
  if (G.st != "play") return;
  if (!q && !fin && U("rev") && !G.revd && !G.arena) {
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
  const t = Math.max(0, Math.floor((Date.now() - (G.t0 || Date.now())) / 1000));
  G.dst = {
    q,
    fin: fin ? 1 : 0,
    hard: G.endHard ? 1 : 0,
    arena: G.arena,
    depth: G.d,
    lv: P.lv,
    kills: G.kills,
    gold: P.gold,
    souls: s,
    relics: P.relics.length,
    best: S.best,
    cls: curCls().n,
    weapon: P.w.n,
    time: `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`,
  };
  hide();
  if (q || fin) deathStats(); // al abandonar (o tras el final animado) no hay escena de muerte
  else dthStart();
}
function dodge() {
  if (P.dcd > 0 || P.dash) return;
  const ix = (K[KY.right] ? 1 : 0) - (K[KY.left] ? 1 : 0),
    iy = (K[KY.down] ? 1 : 0) - (K[KY.up] ? 1 : 0);
  let a = ix || iy ? Math.atan2(iy, ix) : P.face;
  P.dash = { t: 0.17, vx: Math.cos(a) * 540, vy: Math.sin(a) * 540, inv: 1 };
  P.inv = 0.3;
  P.dcd = (0.8 * (1 - tv("dcd"))) / (1 + 0.01 * P.a.agi);
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
    if (w.mag && !(P.ovr > 0) && (P.am = (P.am ?? w.mag) - 1) <= 0) {
      P.rl = (w.rt || 1.6) * (1 - tv("rl"));
      P.am = w.mag;
      flash("Recargando...");
    }
    const art = RANGED_ART[w.n],
      o = {
        pierce: (w.pierce || 0) + tv("pier"),
        bounce: w.bounce,
        ret: w.ret,
        sp: w.spread,
        fx: w.fx ? { poison: 3 + tv("rpoi") } : null,
        c: w.ret ? "#ccc" : "#fff",
        spr: art && art.proj,
      };
    if (w.n == "Chakram") o.r = 11; // el radio de colisión sigue al tamaño del sprite
    shoot(a, w.sp, wd(), "p", o);
    if (P.ovr > 0) for (const s of [-0.22, 0.22]) shoot(a + s, w.sp, wd(0.8), "p", Object.assign({}, o)); // Sobrecarga rúnica
    rangedKick();
    P.acd = w.cd / P.as / (P.ovr > 0 ? 1.8 : 1);
    snd(w.n == "Ballesta" ? 140 : 520, 0.07, "square");
  } else {
    if (P.mp < w.mp) return;
    P.mp -= w.mp;
    let el = w.el;
    if (P.ck == "fimg" && (el == "fire" || el == "ice")) {
      el = P.pol ? "ice" : "fire"; // el Mago de fuego y hielo alterna los dos elementos en cada disparo
      P.pol ^= 1;
    }
    const f =
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
      spr: P.ck == "fimg" && (el == "fire" || el == "ice") ? (el == "ice" ? "magia_helada" : "magia_ignea") : RANGED_ART[w.n] && RANGED_ART[w.n].proj,
    });
    rangedKick();
    P.acd = w.cd / P.as;
    snd(700, 0.08, "sine");
  }
}
