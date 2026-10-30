/* ======================================================================
 * src/js/bosses/boss-roster-orig.js
 * Los 12 jefes originales (índices 0-11) conservan su comportamiento propio (boss-catalog.js), pero ya no usan la
 * lista de ataques compartida: cada uno recibe ahora UN ataque extra exclusivo, acorde con su identidad (ORX).
 *
 * Define:
 * ORX
 * ====================================================================== */

const ORX = {};
function orx(i, first, gap, fn) {
  ORX[i] = (e, dt, c) => {
    e.xt = (e.xt ?? first) - dt;
    if (e.xt > 0 || e.vul > 0 || e.ch > 0 || e.lu > 0 || e.wd > 0) return;
    e.xt = gap - c.ph * 1.2 + rnd(0, 2);
    btxt(e, "✦", BD[e.bi].c);
    fn(e, c, BD[e.bi].c);
  };
}
// 0 · Valdris, el Duelista: tajo de media luna que remata con una ráfaga
orx(0, 5, 7, (e, c, k) => {
  bz({ k: "cone", x: e.x, y: e.y, a: c.a, ha: 0.9, r: 175, t: 0.6, d: e.dmg * 1.2, c: k });
  later(e, 0.6, () => brs(e, 6, 300, e.dmg * 0.45, c.a - 0.5, 0, "#fff"));
});
// 1 · Gorgrim, el Coloso: estalactitas que se desprenden del techo
orx(1, 5, 7, (e, c, k) => {
  for (let i = 0; i < 6 + c.ph * 2; i++) bz({ k: "pool", x: rnd(100, 860), y: rnd(100, 500), r: 46, t: 0.9 + i * 0.1, d: e.dmg, c: k, fx: (h) => brs({ x: h.x, y: h.y }, 4, 150, e.dmg * 0.4, 0.78, 0, "#cba") });
});
// 2 · Sylra, la Centinela: flecha de luz de francotiradora
orx(2, 5, 7, (e, c, k) => {
  bz({ k: "beam", x: e.x, y: e.y, a: c.a, len: 900, w: 12, t: 0.95, d: e.dmg * 1.3, c: "#fff" });
});
// 3 · Mirax, Maestro de Espejos: cada copia (y él) dispara un rayo reflejado
orx(3, 5, 7, (e, c, k) => {
  for (const q of [e, ...(e.dc || [])]) if (q.hp > 0) bz({ k: "beam", x: q.x, y: q.y, a: Math.atan2(P.y - q.y, P.x - q.x), len: 800, w: 10, t: 1, d: e.dmg, c: "#fff" });
});
// 4 · Veyra, la Trampera: cepo que se cierra sobre su presa
orx(4, 5, 7, (e, c, k) => {
  for (let i = 0; i < 8; i++) bz({ k: "pool", x: cl(P.x + Math.cos(i * 0.785) * 120, 100, 860), y: cl(P.y + Math.sin(i * 0.785) * 120, 100, 500), r: 36, t: 1.1 + i * 0.03, d: e.dmg, c: k });
  bz({ k: "pool", x: P.x, y: P.y, r: 50, t: 1.9, d: e.dmg * 1.2, c: k });
});
// 5 · Nyx, la Mudable: garras triples
orx(5, 5, 7, (e, c, k) => {
  for (let i = -1; i <= 1; i++) bz({ k: "cone", x: e.x, y: e.y, a: c.a + i * 0.75, ha: 0.32, r: 200, t: 0.65, d: e.dmg * 1.2, c: k });
});
// 6 · Zeth, el Arconte: prisma de rayos giratorios
orx(6, 5, 8, (e, c, k) => {
  for (let i = 0; i < 3; i++) bz({ k: "bar", x: e.x, y: e.y, a: c.a + i * 2.094, len: 310, w: 12, sp: 1.2, t: 0.9, life: 2.5, d: e.dmg * 0.8, c: k, fol: e });
});
// 7 · Soberano de Huesos: caída de costillas en anillos
orx(7, 5, 8, (e, c, k) => {
  bz({ k: "ring", x: e.x, y: e.y, ri: 0, ro: 130, t: 0.8, d: e.dmg * 1.2, c: k });
  bz({ k: "ring", x: e.x, y: e.y, ri: 170, ro: 235, t: 1.2, d: e.dmg, c: k });
});
// 8 · Fulgor, Heraldo del Rayo: relámpago en cadena que se acerca a ti
orx(8, 5, 7, (e, c, k) => {
  for (let i = 0; i < 5; i++) {
    const f = i / 4;
    bz({ k: "pool", x: e.x + (P.x - e.x) * (0.2 + f * 0.8) + rnd(-30, 30), y: e.y + (P.y - e.y) * (0.2 + f * 0.8) + rnd(-30, 30), r: 46, t: 0.6 + i * 0.2, d: e.dmg, c: k });
  }
});
// 9 · Noctis, Devoradora de Luz: eclipse parcial con rayo de sombra
orx(9, 5, 9, (e, c, k) => {
  G.dk = 150;
  later(e, 3.5, () => (G.dk = [270, 215, 165][c.ph]));
  bz({ k: "beam", x: e.x, y: e.y, a: c.a, len: 800, w: 20, t: 1.1, d: e.dmg * 1.2, c: k });
});
// 10 · Cronos, el Reloj Roto: manecilla del reloj
orx(10, 5, 8, (e, c, k) => {
  bz({ k: "bar", x: e.x, y: e.y, a: c.a, len: 390, w: 14, sp: 1, t: 0.9, life: 3, d: e.dmg * 0.9, c: k, fol: e });
});
// 11 · El Vacío: singularidad que atrae y estalla
orx(11, 5, 8, (e, c, k) => {
  for (let j = 0; j < 12; j++)
    later(e, j * 0.1, () => {
      const d = Math.hypot(e.x - P.x, e.y - P.y) || 1;
      pushP(((e.x - P.x) / d) * 12, ((e.y - P.y) / d) * 12);
    });
  bz({ k: "ring", x: e.x, y: e.y, ri: 0, ro: 130, t: 1.3, d: e.dmg * 1.3, c: k });
});
