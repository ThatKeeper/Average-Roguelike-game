/* ======================================================================
 * src/js/combat/damage.js
 * Fórmula de daño y escalado, estados alterados, golpes, áreas, cadenas y muerte de enemigos.
 *
 * Define:
 * wd, hpM, dmM, col, nm, apply, hit, area, chain, kill
 * ====================================================================== */

// ===== DAÑO (fórmula centralizada) =====
// final = 10*dañoArma*rareza * (1+0.06*(nivel-1)) * (1+0.045*atributoEscalado) * modHabilidad * dmPermanente/reliquias
//         * crítico(×cm) * (1 - resistenciaObjetivo[tipo]) * (escudo?0.5)   | físico 'p', mágico 'm'
// Escalado enemigo por profundidad d: vida=(1+.22(d-1))*(1+.35*floor((d-1)/4)) ; daño=1+.09(d-1)+.12*floor((d-1)/4)
// Más allá de los números: d>=3 oleadas dobles, campeones con modificadores, más tipos de enemigo y patrones de jefe.

const wd = (k = 1) =>
  10 *
  P.w.dmg *
  P.w.rm *
  (1 + 0.06 * (P.lv - 1)) *
  (1 + 0.045 * P.a[P.w.sc]) *
  k *
  P.dm *
  P.edm *
  (P.bt > 0 ? 1.35 : 1);
// Vida enemiga = (1+0.22(d-1)) * (1+0.35*floor((d-1)/4)) * (1+0.025*max(0,d-8))  (suave al inicio, tramos cada 4 niveles y empuje extra desde d>8)
const hpM = () =>
    (1 + 0.22 * (G.d - 1)) *
    (1 + 0.35 * Math.floor((G.d - 1) / 4)) *
    (1 + 0.025 * Math.max(0, G.d - 8)) *
    (S.hard ? 1.2 : 1),
  dmM = () => (1 + 0.09 * (G.d - 1) + 0.12 * Math.floor((G.d - 1) / 4)) * (S.hard ? 1.12 : 1);

// ===== COMBATE =====
function col(o) {
  const r = o.r;
  o.x = cl(o.x, 50 + r, 910 - r);
  o.y = cl(o.y, 50 + r, 550 - r);
  for (const b of RM_.obs) {
    const cx = cl(o.x, b.x, b.x + b.w),
      cy = cl(o.y, b.y, b.y + b.h),
      dx = o.x - cx,
      dy = o.y - cy,
      d = Math.hypot(dx, dy);
    if (d < r) {
      if (d > 0) {
        o.x += (dx / d) * (r - d);
        o.y += (dy / d) * (r - d);
      } else o.y -= r;
    }
  }
}
const nm = (x0, y0, t, c) => NM.push({ x: x0 + rnd(-8, 8), y: y0, t: fmt(t), c, l: 0.8 });
function apply(e, f) {
  if (!f) return;
  if (e.t == "boss") f = Object.assign({}, f, { stun: 0, freeze: 0, root: 0 });
  if (f.bleed) {
    e.st.bleedN = Math.min(8 + (P.bl || 0) + (P.tal.bleed || 0), (e.st.bleedN || 0) + f.bleed);
    e.st.bleed = 5;
    e.bd = Math.max(e.bd || 0, wd(0.3));
  }
  if (f.wet) {
    e.st.wet = f.wet;
    e.st.burn = 0;
  }
  const rs = e.t == "boss" ? 0.5 : e.t == "elite" ? 0.7 : 1;
  if (f.root) e.st.root = f.root * rs;
  if (f.frac) e.st.frac = f.frac;
  if (f.curse) e.st.curse = f.curse;
  if (f.freeze) e.st.stun = Math.max(e.st.stun || 0, f.freeze * rs);
  if (f.cor) {
    e.st.cor = Math.min(10, (e.st.cor || 0) + f.cor);
    e.st.cort = 4;
    e.cdm = Math.max(e.cdm || 0, wd(0.06));
  }
  if (f.burn) {
    e.st.burn = f.burn;
    e.dot = Math.max(e.dot, wd(0.25));
  }
  if (f.poison) {
    e.st.poison = f.poison;
    e.dot = Math.max(e.dot, wd(0.18));
  }
  if (f.slow) {
    if (e.st.slow > 0 && e.t != "boss") e.st.stun = Math.max(e.st.stun || 0, 0.9);
    e.st.slow = f.slow;
  }
  if (f.stun) e.st.stun = Math.max(e.st.stun || 0, f.stun);
}
function hit(e, b, t, o = {}) {
  if (e.hp <= 0 || e.sp > 0) return;
  const cr = Math.random() < P.cc;
  let d = Math.max(
    1,
    b *
      (cr ? P.cm + P.ecm : 1) *
      (1 - (ET[e.t].res?.[t] || 0)) *
      (e.sh > 0 ? 0.5 : 1) *
      (e.mod == "blindado" ? 0.8 : 1) *
      (o.ch && e.st.wet > 0 ? 1.6 : 1) *
      (e.imm > 0 ? 0.01 : 1) *
      (e.vul > 0 ? 1.6 : 1) *
      (e.st.frac > 0 ? 1.2 : 1) *
      (1 + (e.st.cor || 0) * 0.04) *
      (o.el == "dark" && Object.keys(e.st).some((k) => e.st[k] > 0 && k != "cort") ? 1.3 : 1),
  );
  if (e.t == "boss") {
    d = Math.min(d, e.mhp * 0.1);
    const n = Date.now();
    if (n - (e.dwt || 0) > 1000) {
      e.dwt = n;
      e.dwv = 0;
    }
    d = Math.min(d, Math.max(e.mhp * 0.25 - e.dwv, e.mhp * 0.004));
    e.dwv += d;
  }
  e.hp -= d;
  e.fl = 0.1;
  if (cr && P.det && e.st.bleedN > 0) {
    const n = e.st.bleedN;
    e.st.bleedN = Math.ceil(n / 2);
    e.hp -= d * 0.25 * n;
  }
  if (!o.nl)
    P.hp = Math.min(P.mhp, P.hp + Math.min(d * Math.min(0.06, P.ls + P.els), P.mhp * 0.03));
  if (o.kb && e.t != "boss") {
    e.vx += Math.cos(o.a) * o.kb;
    e.vy += Math.sin(o.a) * o.kb;
  }
  apply(e, o.fx);
  if (P.bn) apply(e, { burn: 2 });
  if (P.pzn) apply(e, { poison: 3 });
  if (P.fz) apply(e, { slow: 1.5 });
  if (o.stun) apply(e, { stun: o.stun });
  nm(e.x, e.y - e.r, d, cr ? "#ffd34a" : "#fff");
  snd(cr ? 320 : 170, 0.05, "square");
  if (cr) shake = Math.max(shake, 3);
  if (e.hp <= 0) kill(e);
}
function area(x0, y0, r, d, t, o = {}) {
  FX.push({ k: "ring", x: x0, y: y0, r, t: 0.3, m: 0.3, c: o.c || "#fff" });
  shake = Math.max(shake, 4);
  for (const e of E)
    if (e.hp > 0 && dist({ x: x0, y: y0 }, e) < r + e.r)
      hit(e, d, t, Object.assign({ a: ang({ x: x0, y: y0 }, e), kb: 200 }, o));
}
function chain(e, d, n) {
  let cur = e,
    used = new Set([e]);
  while (n-- > 0) {
    let b = null,
      bd = 180;
    for (const q of E)
      if (q.hp > 0 && !used.has(q) && dist(q, cur) < bd) {
        bd = dist(q, cur);
        b = q;
      }
    if (!b) break;
    used.add(b);
    FX.push({ k: "line", x: cur.x, y: cur.y, x2: b.x, y2: b.y, t: 0.15, m: 0.15 });
    hit(b, d, "m", { ch: 1 });
    cur = b;
  }
}
function kill(e) {
  e.dead = 1;
  if (G.train) {
    FX.push({ k: "dead", x: e.x, y: e.y, r: e.r, c: "#a86", t: 0.5, m: 0.5 });
    return;
  }
  if (e.t == "decoy" || e.t == "orb") {
    if (e.t == "decoy") brs(e, 6, 180, 6 * dmM(), 0, 0, "#ddd");
    return;
  }
  bk(e);
  if (e.t == "boss") bossDie(e);
  else FX.push({ k: "dead", x: e.x, y: e.y, r: e.r, c: ET[e.t].c, t: 0.5, m: 0.5 });
  G.kills++;
  const T = ET[e.t];
  for (
    let i = 0;
    i < (e.t == "boss" ? 12 : 1 + (Math.random() < 0.4) + (e.t == "elite" ? 3 : 0));
    i++
  )
    O.push({
      x: e.x + rnd(-15, 15),
      y: e.y + rnd(-15, 15),
      k: "g",
      v: Math.ceil((3 + G.d * 1.5) * (1 + P.a.luk * 0.02) * (1 + 0.03 * U("gre"))),
    });
  if (Math.random() < 0.1 + P.a.luk * 0.005) O.push({ x: e.x, y: e.y, k: "h", v: 0.15 });
  for (let i = 0; i < 8; i++)
    FX.push({
      k: "p",
      x: e.x,
      y: e.y,
      vx: rnd(-140, 140),
      vy: rnd(-140, 140),
      t: 0.5,
      m: 0.5,
      c: T.c,
    });
  if (e.mod == "explosivo" || e.t == "bomber") {
    Z.push({ x: e.x, y: e.y, r: 75, t: 0.01, d: e.dmg * (e.t == "bomber" ? 1 : 0.8), c: "#fa4" });
  }
  if (Math.random() < (e.t == "boss" || e.t == "elite" ? 1 : 0.04 + P.a.luk * 0.002 + emptyB()))
    O.push({
      x: e.x,
      y: e.y,
      k: "i",
      it: Object.assign({}, pickIT(), { id: Date.now() + Math.random() }),
    });
  xp((6 + G.d * 1.5) * (e.t == "boss" ? 15 : e.t == "elite" ? 5 : 1));
}
