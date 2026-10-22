/* ======================================================================
 * src/js/render/draw-entities.js
 * Sprites procedurales del jugador y de los enemigos normales.
 *
 * Define:
 * star, drawEnemy, drawP
 * ====================================================================== */

// ===== SPRITES PROCEDURALES (formas por capas con animación) Y SONIDOS DE JEFE =====
// Los enemigos normales y el jugador se dibujan con siluetas propias, orientadas hacia su objetivo, con balanceo al moverse,
// anticipación de ataque (pulso), estiramiento en embestidas, destello al recibir daño y animación de muerte (FX 'dead').
const star = (n, r1, r2, o) => {
  x.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const q = o + (i * Math.PI) / n,
      rr = i % 2 ? r2 : r1;
    x.lineTo(Math.cos(q) * rr, Math.sin(q) * rr);
  }
  x.closePath();
  x.fill();
  x.stroke();
};
function drawEnemy(e) {
  const T = ET[e.t],
    r = e.r,
    a = Math.atan2(P.y - e.y, P.x - e.x),
    t = e.tm || 0,
    F = e.fl > 0 ? "#fff" : T.c,
    mvs = e.sp > 0 ? 0 : 1,
    bob = Math.sin(t * 7 + e.x) * 1.6 * mvs;
  x.save();
  x.fillStyle = "#0005";
  x.beginPath();
  x.ellipse(e.x, e.y + r * 0.85, r * 0.95, r * 0.35, 0, 0, 7);
  x.fill();
  x.translate(e.x, e.y + bob);
  const pw = e.wind > 0 ? 1 + 0.12 * Math.sin(t * 35) : 1,
    st = e.lu > 0 ? 1.25 : 1;
  x.scale(pw * st, pw / (st * 0.95 + 0.05));
  x.rotate(a);
  x.strokeStyle = e.mod ? "#ffd34a" : "#000";
  x.lineWidth = e.mod ? 3 : 2;
  x.fillStyle = F;
  const C = (q, f = 1) => {
      x.beginPath();
      x.arc(0, 0, q, 0, 7);
      if (f) x.fill();
      x.stroke();
    },
    L = (x1, y1, x2, y2, c, w) => {
      x.save();
      x.strokeStyle = c;
      x.lineWidth = w;
      x.beginPath();
      x.moveTo(x1, y1);
      x.lineTo(x2, y2);
      x.stroke();
      x.restore();
    },
    eye = (ex, ey) => {
      x.save();
      x.fillStyle = "#fff";
      x.beginPath();
      x.arc(ex, ey, r * 0.16, 0, 7);
      x.fill();
      x.fillStyle = "#000";
      x.beginPath();
      x.arc(ex + r * 0.05, ey, r * 0.07, 0, 7);
      x.fill();
      x.restore();
    };
  switch (e.t) {
    case "grunt":
      C(r * 0.9);
      L(r * 0.3, r * 0.6, r * 1.5, -r * 0.4, "#7a5a3a", 4);
      x.save();
      x.fillStyle = "#7a5a3a";
      x.beginPath();
      x.arc(r * 1.5, -r * 0.4, r * 0.28, 0, 7);
      x.fill();
      x.restore();
      eye(r * 0.45, -r * 0.25);
      eye(r * 0.45, r * 0.25);
      break;
    case "runner":
      x.beginPath();
      x.ellipse(0, 0, r * 1.2, r * 0.7, 0, 0, 7);
      x.fill();
      x.stroke();
      L(r * 0.6, -r * 0.45, r * 1.7, -r * 0.2, "#fff", 3);
      L(r * 0.6, r * 0.45, r * 1.7, r * 0.2, "#fff", 3);
      eye(r * 0.6, 0);
      break;
    case "archer":
      x.beginPath();
      x.moveTo(r * 1.1, 0);
      x.lineTo(-r * 0.8, -r * 0.95);
      x.lineTo(-r * 0.8, r * 0.95);
      x.closePath();
      x.fill();
      x.stroke();
      x.save();
      x.strokeStyle = "#cb8";
      x.lineWidth = 3;
      x.beginPath();
      x.arc(r * 0.5, 0, r * 1.05, -1.1, 1.1);
      x.stroke();
      x.restore();
      eye(r * 0.3, 0);
      break;
    case "mage":
      C(r);
      x.save();
      x.rotate(-a);
      x.beginPath();
      x.moveTo(-r * 0.7, -r * 0.7);
      x.lineTo(0, -r * 1.9);
      x.lineTo(r * 0.7, -r * 0.7);
      x.closePath();
      x.fill();
      x.stroke();
      x.restore();
      L(r * 0.2, r * 0.9, r * 1.4, -r * 0.9, "#8a6a4a", 3);
      x.save();
      x.fillStyle = "#e8a8ff";
      x.shadowColor = "#c8f";
      x.shadowBlur = 10;
      x.beginPath();
      x.arc(r * 1.4, -r * 0.9, r * 0.28 + Math.sin(t * 8) * 1.5, 0, 7);
      x.fill();
      x.restore();
      eye(r * 0.45, 0);
      break;
    case "tank":
      x.fillRect(-r, -r, 2 * r, 2 * r);
      x.strokeRect(-r, -r, 2 * r, 2 * r);
      x.save();
      x.fillStyle = "#9ab";
      x.fillRect(r * 0.45, -r * 1.05, r * 0.45, r * 2.1);
      x.strokeRect(r * 0.45, -r * 1.05, r * 0.45, r * 2.1);
      x.restore();
      eye(r * 0.1, -r * 0.3);
      eye(r * 0.1, r * 0.3);
      break;
    case "bomber":
      C(r);
      L(-r * 0.6, -r * 0.6, -r * 1.2, -r * 1.1, "#a85", 2);
      x.save();
      x.fillStyle = Math.sin(t * 25) > 0 ? "#ff0" : "#f80";
      x.beginPath();
      x.arc(-r * 1.25, -r * 1.15, r * 0.2, 0, 7);
      x.fill();
      x.restore();
      eye(r * 0.4, -r * 0.2);
      eye(r * 0.4, r * 0.2);
      break;
    case "summoner":
      star(4, r * 1.3, r * 0.55, t);
      for (let i = 0; i < 3; i++) {
        const q = t * 2 + i * 2.09;
        x.save();
        x.fillStyle = "#8df";
        x.beginPath();
        x.arc(Math.cos(q) * r * 1.7, Math.sin(q) * r * 1.7, r * 0.2, 0, 7);
        x.fill();
        x.restore();
      }
      C(r * 0.35);
      break;
    case "guardian":
      C(r * 0.85);
      x.save();
      x.strokeStyle = "#8fc";
      x.lineWidth = 6;
      x.beginPath();
      x.arc(0, 0, r * 1.2, -1, 1);
      x.stroke();
      x.restore();
      eye(r * 0.3, -r * 0.25);
      eye(r * 0.3, r * 0.25);
      break;
    case "stalker":
      x.beginPath();
      x.ellipse(-r * 0.2, 0, r * 1.3, r * 0.65, 0, 0, 7);
      x.fill();
      x.stroke();
      for (let i = -1; i <= 1; i++) L(r * 0.9, i * r * 0.3, r * 1.7, i * r * 0.45, "#fff", 2);
      x.beginPath();
      x.moveTo(r * 0.5, -r * 0.5);
      x.lineTo(r * 0.9, -r * 1.1);
      x.lineTo(r * 0.9, -r * 0.4);
      x.fill();
      x.beginPath();
      x.moveTo(r * 0.5, r * 0.5);
      x.lineTo(r * 0.9, r * 1.1);
      x.lineTo(r * 0.9, r * 0.4);
      x.fill();
      eye(r * 0.7, -r * 0.15);
      eye(r * 0.7, r * 0.15);
      break;
    case "elite":
      star(7, r * 1.3, r * 0.85, t * 0.6);
      C(r * 0.6);
      x.save();
      x.fillStyle = "#fd4";
      x.rotate(-a);
      x.translate(0, -r * 1.5);
      star(3, r * 0.4, r * 0.2, -1.57);
      x.restore();
      eye(r * 0.3, -r * 0.2);
      eye(r * 0.3, r * 0.2);
      break;
    default:
      C(r);
  }
  x.restore();
  if (e.al && e.nl > 1.5 && e.lk) {
    x.save();
    x.fillStyle = "#ff0";
    x.font = "bold 16px Georgia";
    x.textAlign = "center";
    x.fillText("?", e.x, e.y - r - 14);
    x.restore();
  }
}
function drawP() {
  drawStatusRow(statusList(P, P, STATUS_P), P.x, P.y - P.r - 14, 12);
  const s = P.w.s,
    a = P.face,
    mv = Math.min(1, Math.hypot(P.vx, P.vy) / P.spd),
    bob = Math.sin(Date.now() / 85) * 2.2 * mv,
    col = P.fl > 0 ? "#fff" : { m: "#d8b36a", r: "#7fd08a", g: "#8aa8ff" }[s],
    dk = { m: "#6b5530", r: "#3c6a44", g: "#3a4a8a" }[s];
  x.save();
  x.fillStyle = "#0006";
  x.beginPath();
  x.ellipse(P.x, P.y + 11, 12, 4.5, 0, 0, 7);
  x.fill();
  x.translate(P.x, P.y + bob);
  x.fillStyle = dk;
  x.beginPath();
  x.moveTo(-Math.cos(a) * 6, -Math.sin(a) * 6 - 8);
  x.lineTo(
    -Math.cos(a) * (20 + mv * 9) + Math.sin(a) * 8,
    -Math.sin(a) * (20 + mv * 9) - Math.cos(a) * 8,
  );
  x.lineTo(
    -Math.cos(a) * (20 + mv * 9) - Math.sin(a) * 8,
    -Math.sin(a) * (20 + mv * 9) + Math.cos(a) * 8,
  );
  x.closePath();
  x.fill();
  x.fillStyle = col;
  x.strokeStyle = "#000";
  x.lineWidth = 2;
  x.beginPath();
  x.arc(0, 0, P.r, 0, 7);
  x.fill();
  x.stroke();
  x.save();
  x.rotate(a);
  x.fillStyle = dk;
  if (s == "m") {
    x.fillRect(P.r * 0.2, -P.r * 0.55, P.r * 0.7, P.r * 1.1);
    x.fillStyle = "#000";
    x.fillRect(P.r * 0.55, -P.r * 0.2, P.r * 0.3, P.r * 0.4);
  } else if (s == "r") {
    x.beginPath();
    x.moveTo(P.r * 0.9, 0);
    x.lineTo(-P.r * 0.4, -P.r * 1.1);
    x.lineTo(-P.r * 0.4, P.r * 1.1);
    x.closePath();
    x.fill();
  } else {
    x.save();
    x.rotate(-a);
    x.beginPath();
    x.moveTo(-P.r * 0.8, -P.r * 0.6);
    x.lineTo(0, -P.r * 2.1);
    x.lineTo(P.r * 0.8, -P.r * 0.6);
    x.closePath();
    x.fill();
    x.stroke();
    x.restore();
  }
  x.restore();
  x.fillStyle = "#fff";
  x.beginPath();
  x.arc(Math.cos(a) * P.r * 0.45, Math.sin(a) * P.r * 0.45, 2.2, 0, 7);
  x.fill();
  if (s == "m") drawHeldMelee();
  else if (RANGED_ART[P.w.n]) drawHeldRanged();
  if (P.g) {
    x.strokeStyle = P.gt < 0.22 && !(P.pcd > 0) ? "#fff" : P.pcd > 0 ? "#667" : "#8cf";
    x.lineWidth = 4;
    x.beginPath();
    x.arc(0, 0, P.r + 5, a - 1, a + 1);
    x.stroke();
  }
  if (P.sh > 0) {
    x.strokeStyle = "#6cf";
    x.lineWidth = 2;
    x.beginPath();
    x.arc(0, 0, P.r + 6, 0, 7);
    x.stroke();
  }
  x.restore();
}

