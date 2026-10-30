/* ======================================================================
 * src/js/hub/hub.js
 * Sala central (hub): clases, estaciones, menú de inicio y arranque de partida.
 *
 * Define:
 * HB, HS, hub, menu, hubUse, back, startRun
 * (las clases están en data/classes.js y la sala de clases en hub/class-room.js)
 * ====================================================================== */

// ===== HUB: habitacion central (menu de inicio). Estaciones interactivas con F o clic; el menu antiguo sigue en Ajustes =====
let HB = null;
const HS = [
  { x: 480, y: 110, i: "🚪", n: "Puerta de la mazmorra", f: () => startRun() },
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
      cfgMenu(null);
    },
  },
  { x: 250, y: 300, i: "🔨", n: "Forja de almas", f: () => forgeMenu() },
  { x: 872, y: 300, i: "▶", n: "Sala de clases", f: () => goClassRoomSlide(), door: 1 },
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
  G.hr = 0;
  G.sbx = 0;
  G.nocb = 0;
  G.cs = null;
  G.zm = null;
  dlgClose();
  if (!HB) HB = { x: 480, y: 420 };
}
function menu() {
  if (G.cfg) cfgMenu();
  else hub();
}
function hubUse(s) {
  if (G.hr) return G.hr == 1 ? crUse() : undefined; // en la sala de pruebas no hay nada que usar
  if (trnBusy()) return;
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
  const ci = chosenCls();
  if (ci < 0) {
    // sin clase: el botón de elegir te lleva con una animación a la sala de clases
    show("<h2>Aún no has elegido clase</h2><p>Antes de descender tienes que elegir una clase en la sala de clases (a la derecha del hub).</p>", [
      { t: "Elegir clase", nc: 1, f: goClassRoom },
      back(),
    ]);
    return;
  }
  const c = CLS[ci];
  show(`<h2>¿Entrar como ${c.n}?</h2><p>${c.d}</p><p><small>Arma inicial: ${WP[c.w].n}</small></p>`, [
    { t: "Confirmar y descender", nc: 1, f: () => run(ci) },
    { t: "Cambiar de clase", nc: 1, f: goClassRoom },
    back(),
  ]);
}
