/* ======================================================================
 * src/js/hub/hub.js
 * Sala central (hub): clases, estaciones, menú de inicio y arranque de partida.
 *
 * Define:
 * HB, CLS, HS, hub, menu, hubUse, back, startRun
 * ====================================================================== */

// ===== HUB: habitacion central (menu de inicio). Estaciones interactivas con F o clic; el menu antiguo sigue en Ajustes =====
let HB = null;
const CLS = [
  {
    n: "Guerrero",
    w: 0,
    i: "⚔️",
    d: "Espada, guardia con parry perfecto, remolino y salto. Resistente y letal de cerca.",
    stx: "FUE +4 · Espada · Cuerpo a cuerpo · Hab.: Remolino, Salto con impacto, Guardia/parry",
  },
  {
    n: "Cazador",
    w: 5,
    i: "🏹",
    d: "Arco con cargador de 12, andanada, flecha explosiva y venenosa. Movilidad y crítico.",
    stx: "DES +4 · Arco · A distancia · Hab.: Andanada, Flecha explosiva, Flecha venenosa",
  },
  {
    n: "Mago",
    w: 9,
    i: "🪄",
    d: "Báculo arcano y cartas de hechizo elementales. Usa maná.",
    stx: "INT +4 · Báculo · Magia · Hab.: Bola de fuego, Nova de hielo, Rayo en cadena",
  },
];
const HS = [
  { x: 480, y: 110, i: "🚪", n: "Puerta de la mazmorra", f: () => startRun() },
  { x: 250, y: 300, i: "🗿", n: "Pedestal de clases", f: () => clsMenu() },
  { x: 140, y: 150, i: "📜", n: "Tablón de logros", f: () => achMenu() },
  { x: 820, y: 150, i: "📚", n: "Bestiario", f: () => bestMenu() },
  { x: 150, y: 450, i: "📊", n: "Mesa de estadísticas", f: () => statsMenu() },
  {
    x: 810,
    y: 450,
    i: "⚙️",
    n: "Ajustes",
    f: () => {
      G.cfg = 1;
      cfgMenu();
    },
  },
  { x: 810, y: 300, i: "🔨", n: "Forja de almas", f: () => forgeMenu() },
  { x: 480, y: 500, i: "🌀", n: "Arena de jefes", f: () => arenaMenu() },
  { x: 330, y: 500, i: "🎯", n: "Campo de entrenamiento", f: () => trainMenu() },
  { x: 630, y: 500, i: "🪧", n: "Progresión y créditos", f: () => infoMenu() },
];
function hub() {
  if (G.fromRun) {
    G.fromRun = 0;
    trnCubes("up", G.st == "over"); // tras morir la pantalla ya está oscura: solo se descubre
  }
  hide();
  G.st = "hub";
  G.cfg = 0;
  if (!HB) HB = { x: 480, y: 420 };
}
function menu() {
  if (G.cfg) cfgMenu();
  else hub();
}
function hubUse(s) {
  s = s || HS.find((q) => Math.hypot(q.x - HB.x, q.y - HB.y) < 60);
  if (s) s.f();
}
const back = () => ({
  t: "Volver al hub",
  nc: 1,
  f: () => {
    G.cfg = 0;
    hub();
  },
});
function startRun() {
  const c = CLS[S.cls || 0];
  show(`<h2>¿Entrar como ${c.n}?</h2><p>${c.d}</p>`, [
    { t: "Confirmar y descender", nc: 1, f: () => run(c.w) },
    { t: "Cambiar de clase", nc: 1, f: clsMenu },
    back(),
  ]);
}

