/* ======================================================================
 * src/js/bosses/boss-roster.js
 * Infraestructura de los jefes hechos a mano (sustituye a los antiguos kits de ataques compartidos):
 *   · BHZ / bz / bzTick / bzDraw: peligros propios con forma (rayos, anillos, conos, charcos y barras giratorias).
 *   · mkBoss: registra un jefe con SU comportamiento (init, mv, pas, ph, at[]) y SU dibujo (dw).
 *   · Helpers: pushP (empujar/atraer al jugador), shd (sombra de color), etc.
 * Los jefes concretos están en boss-roster-*.js. Cada uno define sus propios ataques, su mecánica pasiva, su
 * ventana de vulnerabilidad y su aspecto; ya no comparten ninguna lista de ataques.
 *
 * Define:
 * BHZ, bz, bzTick, bzDraw, RO, BXD, mkBoss, roUp, pushP, bmn, ghost
 * ====================================================================== */

let BHZ = []; // peligros de jefe con forma: {k, x, y, a, len, w, ri, ro, ha, r, t, m, life, d, c, sp, once}
const RO = {}, // definiciones de comportamiento por índice de jefe
  BXD = {}; // funciones de dibujo por índice de jefe

// Crea un peligro. Primero se telegrafía (t s) y después está activo `life` s (por defecto 0,12 s: golpe instantáneo).
//  beam: rectángulo desde (x,y) hacia el ángulo a, largo len y semiancho w · ring: corona entre ri y ro
//  cone: sector de radio r y semiángulo ha · pool: círculo de radio r que se queda activo (charco, brasas, telaraña...)
//  web: como pool pero solo ralentiza (no hace daño) · bar: rayo giratorio (sp rad/s) anclado en (x,y)
function bz(o) {
  o.m = o.t = Math.max(0.05, o.t ?? 0.9);
  o.on = -1;
  o.life = o.life ?? 0.12;
  o.c = o.c || "#f55";
  BHZ.push(o);
  return o;
}
function bzIn(h) {
  const r = P.r;
  if (h.k == "beam" || h.k == "bar") {
    const ex = Math.cos(h.a) * h.len,
      ey = Math.sin(h.a) * h.len,
      px = P.x - h.x,
      py = P.y - h.y,
      u = cl((px * ex + py * ey) / (h.len * h.len), 0, 1);
    return Math.hypot(px - ex * u, py - ey * u) < h.w + r;
  }
  const d = Math.hypot(P.x - h.x, P.y - h.y);
  if (h.k == "ring") return d > h.ri - r && d < h.ro + r;
  if (h.k == "cone") return d < h.r + r && Math.abs(nrm(Math.atan2(P.y - h.y, P.x - h.x) - h.a)) < h.ha + r / Math.max(d, 30);
  return d < h.r + r; // pool, web
}
function bzTick(dt) {
  for (const h of BHZ) {
    if (h.fol) {
      // sigue a un jefe (anclado a su cuerpo)
      if (h.fol.hp > 0) {
        h.x = h.fol.x;
        h.y = h.fol.y;
      } else h.on = 0;
    }
    if (h.t > 0) {
      h.t -= dt;
      if (h.t <= 0) {
        h.on = h.life;
        FX.push({ k: "ring", x: h.x, y: h.y, r: h.k == "ring" ? h.ro : h.r || h.w * 2 || 40, t: 0.2, m: 0.2, c: h.c });
        if (h.fx) h.fx(h);
      }
      continue;
    }
    h.on -= dt;
    if (h.sp) h.a += h.sp * dt;
    if (h.trk) h.a += cl(nrm(Math.atan2(P.y - h.y, P.x - h.x) - h.a), -h.trk * dt, h.trk * dt); // rayo que persigue al jugador
    if (h.vx || h.vy) {
      h.x += (h.vx || 0) * dt;
      h.y += (h.vy || 0) * dt;
    }
    if (h.k == "web") {
      if (bzIn(h)) P.slow = Math.max(P.slow, 0.25);
    } else if (h.d > 0 && !(h.once && h.hit) && bzIn(h)) {
      hurtP(h.d);
      h.hit = 1;
      if (h.hf) h.hf(h);
    }
  }
  BHZ = BHZ.filter((h) => h.on > 0 || h.t > 0);
}
function bzPath(h) {
  x.beginPath();
  if (h.k == "beam" || h.k == "bar") {
    x.save();
    x.translate(h.x, h.y);
    x.rotate(h.a);
    x.rect(0, -h.w, h.len, h.w * 2);
    x.restore();
  } else if (h.k == "ring") {
    x.arc(h.x, h.y, h.ro, 0, 7);
    x.moveTo(h.x + h.ri, h.y);
    x.arc(h.x, h.y, h.ri, 0, 7, true);
  } else if (h.k == "cone") {
    x.moveTo(h.x, h.y);
    x.arc(h.x, h.y, h.r, h.a - h.ha, h.a + h.ha);
    x.closePath();
  } else x.arc(h.x, h.y, h.r, 0, 7);
}
function bzDraw() {
  for (const h of BHZ) {
    x.save();
    bzPath(h);
    if (h.t > 0) {
      const p = 1 - h.t / h.m;
      x.globalAlpha = 0.1 + 0.22 * p;
      x.fillStyle = h.c;
      x.fill("evenodd");
      x.globalAlpha = 0.55;
      x.strokeStyle = h.c;
      x.lineWidth = 2;
      x.setLineDash([8, 6]);
      x.stroke();
      if (h.lb) {
        x.setLineDash([]);
        x.globalAlpha = 1;
        x.fillStyle = "#fff";
        x.font = "bold 22px Georgia";
        x.textAlign = "center";
        x.fillText(h.lb, h.x, h.y + 8);
      }
    } else {
      const a = h.life > 1 ? 0.3 + 0.1 * Math.sin(Date.now() / 120) : Math.max(0.2, h.on / h.life);
      x.globalAlpha = h.k == "web" ? 0.3 : 0.45 + 0.4 * a;
      x.fillStyle = h.c;
      x.fill("evenodd");
      x.globalAlpha = 0.9;
      x.strokeStyle = "#fff";
      x.lineWidth = 2;
      x.stroke();
    }
    x.restore();
  }
}

// Empuja (dx,dy en px) o atrae al jugador respetando muros (corrientes, pozos, tirones).
function pushP(dx, dy) {
  if (P.dash) return;
  P.x += dx;
  P.y += dy;
  col(P);
}
// Invoca un secuaz propio del jefe (sin oro ni experiencia) y lo registra en e.mn para que muera con él.
function bmn(e, t, x0, y0) {
  e.mn = (e.mn || []).filter((q) => q.hp > 0 && !q.dead);
  const q = spawn(t, x0, y0);
  q.minion = 1;
  q.al = 1;
  q.sp = 0.4;
  e.mn.push(q);
  return q;
}
// Texto flotante sobre el jefe con el nombre del ataque
const btxt = (e, t, c) => NM.push({ x: e.x, y: e.y - e.r - 30, t, c: c || "#fff", l: 1.2 });
// Tiempo de "desvanecido": el dibujo lo usa para volver al jefe translúcido
const ghost = (e, s) => (e.gh = s);

// ---- Motor de comportamiento ----
// def: { d, dw, t0, init(e,c,k), pas(e,c,dt,k), ph(e,c,k), mv(e,c,dt,k), at: [ {n, w, p, f(e,c,k)→cooldown} ] }
//  · pas: mecánica pasiva (se ejecuta SIEMPRE, también durante la ventana de vulnerabilidad)
//  · mv: movimiento propio (no se ejecuta mientras el jefe está vulnerable o "ocupado" con e.busy)
//  · at: sus ataques; p = fase mínima en la que se desbloquean; w = peso (veces que entra en el sorteo)
function roUp(d, e, dt, c) {
  const k = BD[e.bi].c;
  if (!e.ri) {
    e.ri = 1;
    e.t1 = d.t0 ?? 2;
    e.busy = 0;
    if (d.init) d.init(e, c, k);
  }
  e.t1 -= dt;
  e.gh = Math.max(0, (e.gh || 0) - dt);
  if (d.pas) d.pas(e, c, dt, k);
  if (e.ph0 !== c.ph) {
    const o = e.ph0;
    e.ph0 = c.ph;
    if (o !== undefined) {
      ring(e, 150, k);
      shake = Math.max(shake, 8);
      if (d.ph) d.ph(e, c, k);
    }
  }
  if (e.vul > 0) return;
  if (e.busy > 0) {
    e.busy -= dt;
    return;
  }
  if (d.mv) d.mv(e, c, dt, k);
  if (e.t1 <= 0) {
    const L = [];
    for (const a of d.at) if ((a.p || 0) <= c.ph) for (let i = 0; i < (a.w || 1); i++) L.push(a);
    const a = d.seq ? L[(e.si = (e.si ?? -1) + 1) % L.length] : L[rk(e, L.length)]; // seq: ciclo fijo (máquinas)
    if (a.n) btxt(e, a.n, k);
    const cd = a.f(e, c, k);
    e.t1 = cd ?? Math.max(0.9, 2.5 - c.ph * 0.35);
  }
}
function mkBoss(i, d) {
  RO[i] = d;
  BO[i] = { up: (e, dt, c) => roUp(d, e, dt, c) };
  if (d.d) BDS[i] = d.d;
  if (d.dw) BXD[i] = d.dw;
}

// ---- Utilidades de dibujo para los jefes (el contexto ya está trasladado al centro del jefe, con relleno F y contorno negro) ----
const dEl = (cx, cy, rx, ry, rot = 0, nf) => {
    x.beginPath();
    x.ellipse(cx, cy, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, 7);
    if (!nf) x.fill();
    x.stroke();
  },
  dCi = (cx, cy, r, nf) => {
    x.beginPath();
    x.arc(cx, cy, Math.max(0.1, r), 0, 7);
    if (!nf) x.fill();
    x.stroke();
  },
  dPo = (pts, nf) => {
    x.beginPath();
    pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])));
    x.closePath();
    if (!nf) x.fill();
    x.stroke();
  },
  dLn = (x0, y0, x1, y1, w, col) => {
    x.save();
    x.lineCap = "round";
    x.strokeStyle = "#000";
    x.lineWidth = w + 3;
    x.beginPath();
    x.moveTo(x0, y0);
    x.lineTo(x1, y1);
    x.stroke();
    x.strokeStyle = col;
    x.lineWidth = w;
    x.stroke();
    x.restore();
  },
  dEy = (cx, cy, s, col) => {
    x.fillStyle = col;
    x.beginPath();
    x.arc(cx, cy, s, 0, 7);
    x.fill();
  };
