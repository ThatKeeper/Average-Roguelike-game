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
// Maná de los hechizos: el coste base se multiplica por la raíz cuadrada del crecimiento de daño del personaje
// (nivel × atributo principal × multiplicadores de daño), respecto al inicio de la partida (nivel 1, atributo 7).
// Así crece más despacio que el daño (mejorar sigue compensando), el coste nunca baja de su valor base
// y se limita a ×4 para que a niveles altos el maná siga gestionándose sin volverse imposible.
const MP_G0 = 1 + 0.045 * 7,
  mpK = () => {
    const g = (1 + 0.06 * (P.lv - 1)) * (1 + 0.045 * P.a[P.w.sc]) * P.dm * P.edm;
    return Math.min(4, Math.max(1, Math.sqrt(g / MP_G0))) * (P.ovc > 0 ? 0.4 : 1); // Sobrecarga arcana: −60 % de coste
  },
  spMp = (base) => base * mpK();
// Vida enemiga = (1+0.22(d-1)) * (1+0.35*floor((d-1)/4)) * (1+0.025*max(0,d-8))  (suave al inicio, tramos cada 4 niveles y empuje extra desde d>8)
const hpM = () =>
    (1 + 0.22 * (G.d - 1)) *
    (1 + 0.35 * Math.floor((G.d - 1) / 4)) *
    (1 + 0.025 * Math.max(0, G.d - 8)) *
    (S.hard ? 1.2 : 1),
  dmM = () => (1 + 0.09 * (G.d - 1) + 0.12 * Math.floor((G.d - 1) / 4)) * (S.hard ? 1.12 : 1);

// ===== COMBATE =====
const BOMB_DELAY = 0.6; // segundos hasta que explota un kamikaze al que matas (igual que su mecha propia)
function col(o) {
  const r = o.r;
  o.x = cl(o.x, RB.x0 + r, RB.x1 - r);
  o.y = cl(o.y, RB.y0 + r, RB.y1 - r);
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
  if (e.hp <= 0 || e.sp > 0 || e.invl) return; // invl: invulnerable del todo (jefe secreto)
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
  if (P.pzn || P.ck == "alch") apply(e, { poison: 3 }); // el Alquimista envenena todo lo que toca
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
  if (G.train || G.sbx) {
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
  // Los enemigos invocados (por el Invocador o por jefes) no dan oro ni experiencia
  if (!e.minion)
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
  // Corazón: cura el 10 % de la vida máxima. Probabilidad a la mitad (0,10 → 0,05 base; la Suerte también).
  if (Math.random() < 0.05 + P.a.luk * 0.0025) O.push({ x: e.x, y: e.y, k: "h", v: 0.1 });
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
    // El kamikaze abatido no estalla al instante: la zona avisa durante BOMB_DELAY segundos
    // para que, si lo mataste de cerca, tengas tiempo de alejarte (esquivar o correr).
    const dl = e.t == "bomber" ? BOMB_DELAY : 0.01;
    Z.push({ x: e.x, y: e.y, r: 75, t: dl, m: dl, d: e.dmg * (e.t == "bomber" ? 1 : 0.8), c: "#fa4" });
    if (e.t == "bomber") snd(380, 0.12, "square", 0.05);
  }
  // Botín de objetos y pociones: los enemigos invocados no sueltan ninguno.
  // Objetos: probabilidad base a la mitad (0,04 → 0,02; la Suerte y las ranuras vacías también se reducen a la mitad).
  // Pociones: un tercio menos (0,05 → 0,0333). Jefes y élites siguen soltando siempre un objeto.
  if (!e.minion) {
    if (
      Math.random() <
      (e.t == "boss" || e.t == "elite" ? 1 : (0.04 + P.a.luk * 0.002 + emptyB()) * 0.5)
    )
      O.push({
        x: e.x,
        y: e.y,
        k: "i",
        it: Object.assign({}, pickIT(), { id: Date.now() + Math.random() }),
      });
    else if (Math.random() < 0.05 * (2 / 3))
      O.push({ x: e.x, y: e.y, k: "i", it: newPotion(Math.random() < 0.6 ? "hp" : "mp") });
  }
  if (!e.minion) xp((6 + G.d * 1.5) * (e.t == "boss" ? 15 : e.t == "elite" ? 5 : 1));
}

