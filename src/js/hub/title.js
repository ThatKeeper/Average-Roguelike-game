/* ======================================================================
 * src/js/hub/title.js
 * Pantalla de título animada.
 *
 * Define:
 * TE, title, titleFrame
 * ====================================================================== */

// ===== PANTALLA DE TITULO: animada, con efecto al pasar el raton; al pulsar entra al hub =====
let TE = [];
function title() {
  hide();
  G.st = "title";
  G.tf = 0;
  if (!TE.length)
    for (let i = 0; i < 70; i++)
      TE.push({ x: rnd(0, W), y: rnd(0, H), v: rnd(10, 40), s: rnd(1, 3.5), p: rnd(0, 6) });
}
function titleFrame(dt) {
  tcSync();
  const t = Date.now() / 1000,
    bx = 480,
    by = 430,
    bw = 270,
    bh = 58,
    hov = Math.abs(M.x - bx) < bw / 2 && Math.abs(M.y - by) < bh / 2;
  cv.style.cursor = hov ? "pointer" : "default";
  if (G.tf > 0) {
    G.tf -= dt;
    if (G.tf <= 0) {
      cv.style.cursor = "";
      hub();
      return;
    }
  } else if (M.d || tapped()) {
    M.d = 0;
    G.tf = 0.5;
  }
  x.save();
  x.clearRect(0, 0, W, H);
  const g = x.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#05040a");
  g.addColorStop(1, "#1c1226");
  x.fillStyle = g;
  x.fillRect(0, 0, W, H);
  for (const q of TE) {
    q.y -= q.v * dt;
    q.x += Math.sin((q.p += dt)) * 12 * dt;
    const dx = q.x - M.x,
      dy = q.y - M.y,
      d = Math.hypot(dx, dy);
    if (d < 110) {
      q.x += (dx / d) * 160 * dt;
      q.y += (dy / d) * 160 * dt;
    }
    if (q.y < -5) {
      q.y = H + 5;
      q.x = rnd(0, W);
    }
    x.globalAlpha = 0.25 + 0.55 * Math.abs(Math.sin(q.p * 2));
    x.fillStyle = d < 110 ? "#fff2a0" : "#ff9a3a";
    x.fillRect(q.x, q.y, q.s, q.s);
  }
  x.globalAlpha = 1;
  for (const tx of [110, 850]) {
    const f = 0.6 + 0.4 * Math.sin(t * 8 + tx);
    x.fillStyle = "#ff9a3a";
    x.globalAlpha = 0.1 * f;
    x.beginPath();
    x.arc(tx, 300, 170, 0, 7);
    x.fill();
    x.globalAlpha = 0.9;
    x.beginPath();
    x.ellipse(tx, 300, 12 * f, 22 * f, 0, 0, 7);
    x.fill();
    x.fillStyle = "#ffe08a";
    x.beginPath();
    x.ellipse(tx, 304, 6 * f, 12 * f, 0, 0, 7);
    x.fill();
    x.fillStyle = "#3a2a20";
    x.globalAlpha = 1;
    x.fillRect(tx - 5, 322, 10, 90);
  }
  x.textAlign = "center";
  x.textBaseline = "alphabetic";
  const L1 = "AVERAGE",
    L2 = "ROGUELIKE GAME";
  const row = (txt, y, sz, col) => {
    x.font = `bold ${sz}px Georgia`;
    const w = x.measureText(txt).width + txt.length * 6;
    let px = 480 - w / 2;
    for (const ch of txt) {
      const cw = x.measureText(ch).width + 6,
        cx = px + cw / 2,
        lift = Math.max(0, 1 - Math.hypot(M.x - cx, M.y - (y - sz * 0.3)) / 130) * 16,
        fl = G.tf > 0 ? -(0.5 - G.tf) * 40 : 0;
      x.save();
      x.shadowColor = col;
      x.shadowBlur = 14 + lift * 2;
      x.fillStyle = lift > 2 ? "#fff" : col;
      x.fillText(ch, cx, y - lift + fl + Math.sin(t * 2 + px * 0.02) * 2);
      x.restore();
      px += cw;
    }
  };
  row(L1, 190, 76, "#c9a24a");
  row(L2, 262, 44, "#e8e2f0");
  x.fillStyle = "#8a7fa3";
  x.font = "italic 16px Georgia";
  x.fillText("Una mazmorra infinita. Nada especial. Todo te quiere muerto.", 480, 310);
  x.save();
  x.translate(bx, by);
  const sc = hov ? 1.08 : 1 + Math.sin(t * 3) * 0.015;
  x.scale(sc, sc);
  x.shadowColor = "#c9a24a";
  x.shadowBlur = hov ? 32 : 10;
  x.fillStyle = hov ? "#3a2c52" : "#1a1722";
  x.strokeStyle = hov ? "#ffe08a" : "#c9a24a";
  x.lineWidth = hov ? 3 : 2;
  rr(-bw / 2, -bh / 2, bw, bh, 10);
  x.fill();
  x.stroke();
  x.shadowBlur = 0;
  x.fillStyle = hov ? "#fff" : "#e8e2f0";
  x.font = "bold 24px Georgia";
  x.textBaseline = "middle";
  x.fillText(hov ? "▸ COMENZAR ◂" : "COMENZAR", 0, 2);
  x.restore();
  if (hov && Math.random() < 0.6)
    TE.push({
      x: M.x + rnd(-20, 20),
      y: M.y + rnd(-5, 10),
      v: rnd(40, 90),
      s: rnd(2, 4),
      p: rnd(0, 6),
    });
  if (TE.length > 140) TE.splice(0, TE.length - 140);
  x.textBaseline = "alphabetic";
  x.fillStyle = "#fff8";
  x.font = "12px Georgia";
  x.fillText("Pulsa cualquier tecla o haz clic", 480, H - 20);
  if (S.hard) {
    x.fillStyle = "#f55";
    x.fillText("☠ MODO DIFÍCIL ACTIVO", 480, H - 40);
  }
  if (G.tf > 0) {
    x.fillStyle = "#000";
    x.globalAlpha = 1 - G.tf / 0.5;
    x.fillRect(0, 0, W, H);
  }
  x.restore();
}
