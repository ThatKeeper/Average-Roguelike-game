/* ======================================================================
 * src/js/hub/hub-frame.js
 * Actualización y dibujado de cada fotograma del hub.
 *
 * Define:
 * hubFrame
 * ====================================================================== */

// Sala virtual del hub para dibujar su suelo y paredes con el tilemap
const HUB_ROOM = { obs: [], nb: {}, cl: 1, st: 1, wv: 0, tp: "hub", hz: [], O: [], gx: -1, gy: 0, dens: 0.03 };
function hubFrame(dt) {
  tcSync();
  // G.hr: 1 = sala de clases · 2 = sala de pruebas. Ambas se dibujan y actualizan en crFrame
  // (antes solo se comprobaba G.hr == 1: en la sala de pruebas se ejecutaba el código del hub y te devolvía a la sala de clases).
  if (G.hr) return crFrame(dt);
  if (!G.ov && !trnBusy()) {
    const ix = (K[KY.right] ? 1 : 0) - (K[KY.left] ? 1 : 0),
      iy = (K[KY.down] ? 1 : 0) - (K[KY.up] ? 1 : 0),
      l = Math.hypot(ix, iy) || 1;
    HB.x = cl(HB.x + (ix / l) * 210 * dt, 80, 882);
    HB.y = cl(HB.y + (iy / l) * 210 * dt, 95, 535);
    if (HB.x >= 874 && Math.abs(HB.y - 300) < 55) return goClassRoomSlide(); // arco de la derecha
    if (M.d || tapped()) {
      M.d = 0;
      // clic en el arco de la sala de clases: te lleva directamente
      if (M.x >= 880 && Math.abs(M.y - 300) < 80) return goClassRoomSlide();
      const q = HS.find((q) => Math.hypot(q.x - M.x, q.y - M.y) < 42);
      if (q) hubUse(q);
    }
  }
  hubDraw();
}
// Dibujo del hub (noHero: sin el personaje, para la transición de cámara)
function hubDraw(noHero) {
  const b = BI[0],
    t = Date.now() / 1000;
  x.save();
  x.clearRect(0, 0, W, H);
  G.bi = BI[0];
  drawRoomBase(HUB_ROOM); // suelo y paredes con los tilesets del juego
  x.globalAlpha = 1;
  for (const tx of [90, 870])
    for (const ty of [80, 520]) {
      x.fillStyle = "#ff9a3a";
      x.globalAlpha = 0.5 + 0.3 * Math.sin(t * 9 + tx + ty);
      x.beginPath();
      x.arc(tx, ty, 9, 0, 7);
      x.fill();
      x.globalAlpha = 0.12;
      x.beginPath();
      x.arc(tx, ty, 60, 0, 7);
      x.fill();
      x.globalAlpha = 1;
    }
  // arco a la sala de clases (pared derecha)
  x.fillStyle = "#0a0710";
  x.fillRect(916, 240, 44, 120);
  x.strokeStyle = "#c9a24a";
  x.lineWidth = 3;
  x.strokeRect(916, 238, 44, 124);
  x.textAlign = "center";
  const near = HS.find((q) => Math.hypot(q.x - HB.x, q.y - HB.y) < 60);
  for (const q of HS) {
    if (q.door) {
      x.fillStyle = q == near ? "#ffd34a" : "#e8c97a";
      x.font = (q == near ? "bold " : "") + "12px Georgia";
      x.textAlign = "right";
      x.fillText("Sala de clases ▶", 906, 232);
      x.textAlign = "center";
      continue;
    }
    x.fillStyle = "#0006";
    x.beginPath();
    x.ellipse(q.x, q.y + 16, 22, 7, 0, 0, 7);
    x.fill();
    spr(q.i, q.x, q.y, 34, q == near);
    x.fillStyle = q == near ? "#ffd34a" : "#fffa";
    x.font = (q == near ? "bold " : "") + "12px Georgia";
    x.fillText(q.n, q.x, q.y + 34);
  }
  if (!noHero) drawHubHero(HB.x, HB.y);
  x.fillStyle = b[3];
  x.font = "bold 22px Georgia";
  x.fillText("AVERAGE ROGUELIKE GAME", 480, 36);
  x.fillStyle = "#fff";
  x.font = "13px Georgia";
  x.textAlign = "left";
  x.fillText(
    `Clase: ${chosenCls() >= 0 ? CLS[chosenCls()].n : "sin elegir"} · Almas ${S.souls} · Mejor profundidad ${S.best}`,
    14,
    20,
  );
  if (S.hard) {
    x.fillStyle = "#f55";
    x.fillText("☠ MODO DIFÍCIL", 14, 38);
  }
  x.textAlign = "center";
  x.fillStyle = "#fffb";
  x.fillText(
    near
      ? `[${KL(KY.use)}] o clic: ${near.n}`
      : "Muévete con WASD · acércate a un objeto e interactúa con F o clic",
    480,
    H - 12,
  );
  x.restore();
}

