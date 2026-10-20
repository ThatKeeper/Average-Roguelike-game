/* ======================================================================
 * src/js/hub/hub-frame.js
 * Actualización y dibujado de cada fotograma del hub.
 *
 * Define:
 * hubFrame
 * ====================================================================== */

function hubFrame(dt) {
  tcSync();
  if (!G.ov) {
    const ix = (K[KY.right] ? 1 : 0) - (K[KY.left] ? 1 : 0),
      iy = (K[KY.down] ? 1 : 0) - (K[KY.up] ? 1 : 0),
      l = Math.hypot(ix, iy) || 1;
    HB.x = cl(HB.x + (ix / l) * 210 * dt, 80, 880);
    HB.y = cl(HB.y + (iy / l) * 210 * dt, 95, 535);
    if (M.d) {
      M.d = 0;
      const q = HS.find((q) => Math.hypot(q.x - M.x, q.y - M.y) < 42);
      if (q) hubUse(q);
    }
  }
  const b = BI[0],
    t = Date.now() / 1000;
  x.save();
  x.clearRect(0, 0, W, H);
  x.fillStyle = b[1];
  x.fillRect(0, 0, W, H);
  x.fillStyle = b[2];
  x.fillRect(50, 50, 860, 500);
  x.strokeStyle = b[1];
  x.globalAlpha = 0.35;
  for (let i = 50; i <= 910; i += 40) {
    x.beginPath();
    x.moveTo(i, 50);
    x.lineTo(i, 550);
    x.stroke();
  }
  for (let i = 50; i <= 550; i += 40) {
    x.beginPath();
    x.moveTo(50, i);
    x.lineTo(910, i);
    x.stroke();
  }
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
  x.textAlign = "center";
  const near = HS.find((q) => Math.hypot(q.x - HB.x, q.y - HB.y) < 60);
  for (const q of HS) {
    x.fillStyle = "#0006";
    x.beginPath();
    x.ellipse(q.x, q.y + 16, 22, 7, 0, 0, 7);
    x.fill();
    spr(q.i, q.x, q.y, 34, q == near);
    x.fillStyle = q == near ? "#ffd34a" : "#fffa";
    x.font = (q == near ? "bold " : "") + "12px Georgia";
    x.fillText(q.n, q.x, q.y + 34);
  }
  x.fillStyle = "#0006";
  x.beginPath();
  x.ellipse(HB.x, HB.y + 11, 12, 4.5, 0, 0, 7);
  x.fill();
  x.fillStyle = "#e8e8ee";
  x.strokeStyle = "#000";
  x.lineWidth = 2;
  x.beginPath();
  x.arc(HB.x, HB.y + Math.sin(t * 3) * 1.5, 12, 0, 7);
  x.fill();
  x.stroke();
  x.fillStyle = b[3];
  x.font = "bold 22px Georgia";
  x.fillText("AVERAGE ROGUELIKE GAME", 480, 36);
  x.fillStyle = "#fff";
  x.font = "13px Georgia";
  x.textAlign = "left";
  x.fillText(
    `Clase: ${CLS[S.cls || 0].n} · Almas ${S.souls} · Mejor profundidad ${S.best}`,
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
