/* ======================================================================
 * src/js/combat/melee-swing.js
 * Golpes cuerpo a cuerpo con el sprite del arma: el arma se mueve de verdad,
 * deja una estela y el daño se aplica donde el sprite (y su estela) pasa.
 *
 * Cada golpe tiene tres fases: preparación (el arma se echa atrás),
 * golpe (daño activo) y recuperación (vuelve a la posición de reposo).
 *
 * Define:
 * SW, SWDIR, startSwing, swingPose, swingStrike, swingHitEnemy, trailSample, swingTick
 * ====================================================================== */

let SW = null; // golpe en curso (null si no hay)
let SWDIR = 1; // sentido del golpe; se alterna en cada ataque
const IDLE_HR = 10; // distancia de la mano al centro del jugador en reposo
const IDLE_K = 0.78; // el arma se ve algo más pequeña en reposo
const TRAIL_LIFE = 0.18; // segundos que tarda en desvanecerse la estela
const FALLBACK_CIRC = [-7, -5, -3, -1, 1, 3, 5, 7, 9].map((u) => ({ u, v: 0 }));

const mlerp = (a, b, t) => a + (b - a) * t;
const mOut3 = (q) => 1 - Math.pow(1 - q, 3);
const mIO = (q) => (q < 0.5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2);

/** Inicia un golpe. `c` = tercer golpe del combo (más grande y fuerte, como antes). */
function startSwing(w, aim, c, cdv, o) {
  const A = meleeArt(w),
    kS = (c ? 1.15 : 1) * ((o && o.k) || 1),
    arc = (w.arc || 1.6) * (c ? 1.3 : 1) * ((o && o.arc) || 1);
  SWDIR = -SWDIR;
  const sw = (SW = {
    owner: P,
    w,
    art: A,
    a0: aim,
    dir: SWDIR,
    c,
    kS,
    t: 0,
    dur: Math.min(A.dur, Math.max(0.08, cdv * 0.95)),
    amp: A.fam == "thrust" ? 0.12 : A.fam == "jab" ? arc * A.jab : arc,
    back: A.back || 0,
    seen: new Set(),
    ring: false,
    ver: (o && o.ver) || null, // golpe especial (p. ej. Veredicto): su daño y efectos los define la propia habilidad
  });
  const L = (A.tu - A.gu) * A.s * kS;
  sw.qa = A.fam == "thrust" ? 0.05 : sw.back / (sw.amp + sw.back);
  sw.hmax = A.fam == "sweep" ? IDLE_HR + A.lunge : Math.max(IDLE_HR, 0.95 * w.rng * kS - L);
  sw.reach = sw.hmax + L + A.s * kS * 4 + 10;
  sw.fx = {
    k: "trail",
    x: P.x,
    y: P.y,
    pts: [],
    art: A,
    c: c ? "#ffd34a" : A.trail,
    lw: c ? 4 : 3,
    life: TRAIL_LIFE,
    t: sw.dur + TRAIL_LIFE,
    m: sw.dur + TRAIL_LIFE,
  };
  FX.push(sw.fx);
  P.at = sw.dur;
}

/**
 * Posición del arma en el instante `t` del golpe.
 * Devuelve la mano (relativa al jugador), el ángulo del eje del arma, la escala,
 * si hay que voltear el sprite (filo hacia delante) y si el daño está activo.
 */
function swingPose(sw, t) {
  const A = sw.art,
    p = cl(t / sw.dur, 0, 1),
    Wn = A.w,
    Rc = A.r,
    S = 1 - Wn - Rc,
    startRel = -sw.dir * (sw.amp / 2 + sw.back),
    endRel = (sw.dir * sw.amp) / 2;
  let rel, hd, kb, ph, q, prog;
  if (p < Wn) {
    ph = 0;
    q = mIO(p / Wn);
    prog = 0;
    rel = mlerp(A.idle, startRel, q);
    hd = mlerp(IDLE_HR, A.pull, q);
    kb = mlerp(IDLE_K, 1, q);
  } else if (p < 1 - Rc) {
    ph = 1;
    q = (p - Wn) / S;
    prog = mOut3(q);
    rel = mlerp(startRel, endRel, prog);
    hd = mlerp(A.pull, sw.hmax, prog);
    kb = 1;
  } else {
    ph = 2;
    q = mIO((p - (1 - Rc)) / Rc);
    prog = 1;
    rel = mlerp(endRel, A.idle, q);
    hd = mlerp(sw.hmax, IDLE_HR, q);
    kb = mlerp(1, IDLE_K, q);
  }
  // al recuperar, el arma vuelve a seguir al cursor
  const base = sw.a0 + nrm(P.face - sw.a0) * (ph == 2 ? q : 0),
    wa = base + rel,
    hdir = A.fam == "sweep" ? wa : base,
    env = ph == 0 ? q : ph == 1 ? 1 : 1 - q,
    lat = A.lat ? sw.dir * A.lat * env : 0,
    bump = A.slam && ph == 1 ? 1 + 0.12 * Math.sin(Math.PI * q) : 1;
  return {
    hx: Math.cos(hdir) * hd - Math.sin(hdir) * lat,
    hy: Math.sin(hdir) * hd + Math.cos(hdir) * lat,
    ang: wa,
    k: kb * sw.kS * bump,
    sy: A.edge ? (A.edge === sw.dir ? 1 : -1) : 1,
    ph,
    prog,
    active: ph == 1 && prog >= sw.qa,
  };
}

/** Comprueba qué enemigos toca el sprite en esta pose y les aplica el golpe (una vez por golpe). */
function swingStrike(sw, pose) {
  const A = sw.art,
    rec = A.spr && WSPR[A.spr],
    circ = rec && rec.ready && rec.circ ? rec.circ : FALLBACK_CIRC,
    s = A.s * pose.k,
    ca = Math.cos(pose.ang),
    sa = Math.sin(pose.ang),
    wx = P.x + pose.hx,
    wy = P.y + pose.hy,
    rc = 1.45 * s;
  for (const e of E) {
    if (e.hp <= 0 || sw.seen.has(e)) continue;
    if (Math.abs(e.x - P.x) > sw.reach + e.r || Math.abs(e.y - P.y) > sw.reach + e.r) continue;
    for (const c of circ) {
      if (c.u < A.gu - 2.5) continue; // el pomo o la contera, detrás de la mano, no hieren
      const lu = (c.u - A.gu) * s,
        lv = c.v * s * pose.sy,
        px = wx + ca * lu - sa * lv,
        py = wy + sa * lu + ca * lv;
      if (Math.hypot(px - e.x, py - e.y) < e.r + rc) {
        swingHitEnemy(sw, e, px, py);
        break;
      }
    }
  }
}

function swingHitEnemy(sw, e, px, py) {
  const w = sw.w;
  sw.seen.add(e);
  if (sw.ver) {
    sw.ver.hit(e, sw); // Veredicto: el daño sale del swing real del arma
    for (let i = 0; i < 3; i++) FX.push({ k: "p", x: px, y: py, vx: rnd(-200, 200), vy: rnd(-200, 200), t: 0.25, m: 0.25, c: "#ffd34a" });
    shake = Math.max(shake, 3);
    return;
  }
  hit(e, wd(sw.c ? 1.5 : 1), "p", {
    kb: w.stun ? 300 : 150,
    a: ang(P, e),
    stun: w.stun ? 0.8 : 0,
    fx: w.bleed ? { bleed: 1 + (Math.random() < P.cc ? 1 : 0) } : null,
  });
  for (let i = 0; i < (LOW ? 2 : 4); i++)
    FX.push({ k: "p", x: px, y: py, vx: rnd(-160, 160), vy: rnd(-160, 160), t: 0.22, m: 0.22, c: sw.fx.c });
  if (sw.art.shake) shake = Math.max(shake, sw.art.shake);
}

/** Guarda un punto de la estela (segmento interior-exterior del arma y una copia fantasma del sprite). */
function trailSample(sw, pose, t) {
  const A = sw.art,
    s = A.s * pose.k,
    L = (A.tu - A.gu) * s,
    ca = Math.cos(pose.ang),
    sa = Math.sin(pose.ang),
    wx = P.x + pose.hx,
    wy = P.y + pose.hy,
    at = (f, lv) => [wx + ca * f * L - sa * lv, wy + sa * f * L + ca * lv],
    inner = at(A.fam == "jab" ? 0.45 : A.fam == "thrust" ? 0.3 : 0.38, 0),
    outer = at(1.04, 0);
  sw.fx.pts.push({
    t,
    x1: inner[0],
    y1: inner[1],
    x2: outer[0],
    y2: outer[1],
    gx: wx,
    gy: wy,
    ang: pose.ang,
    k: pose.k,
    sy: pose.sy,
  });
}

/** Avanza el golpe en curso; se llama una vez por fotograma desde upP. */
function swingTick(dt) {
  const sw = SW;
  if (!sw) return;
  if (sw.owner !== P || (G.st != "play" && !G.sbx)) {
    SW = null;
    return;
  }
  const t0 = sw.t,
    t1 = Math.min(sw.dur, t0 + dt),
    N = sw.art.fam == "sweep" ? 3 : 4; // subpasos: evitan que un golpe rápido atraviese enemigos
  for (let i = 1; i <= N; i++) {
    const t = t0 + ((t1 - t0) * i) / N,
      pose = swingPose(sw, t);
    if (!pose.active) continue;
    swingStrike(sw, pose);
    trailSample(sw, pose, t);
  }
  sw.t = t1;
  if (sw.art.slam && !sw.ring && t1 / sw.dur >= 1 - sw.art.r) {
    sw.ring = true;
    const pose = swingPose(sw, t1),
      L = (sw.art.tu - sw.art.gu) * sw.art.s * pose.k;
    FX.push({
      k: "ring",
      x: P.x + pose.hx + Math.cos(pose.ang) * L,
      y: P.y + pose.hy + Math.sin(pose.ang) * L,
      r: 38,
      t: 0.25,
      m: 0.25,
      c: sw.art.trail,
    });
  }
  if (t1 >= sw.dur) SW = null;
}
