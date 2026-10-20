/* ======================================================================
 * src/js/render/draw-boss.js
 * Dibujado de jefes y utilidades de color (hx, safe).
 *
 * Define:
 * hx, safe, drawBoss
 * ====================================================================== */

// hx: añade transparencia a un color #RGB o #RRGGBB (concatenar '77' a '#b87' daba un color inválido y rompía el render)
const hx = (h, a) => (h.length == 4 ? "#" + h[1] + h[1] + h[2] + h[2] + h[3] + h[3] : h) + a;
function safe(f, e) {
  x.save();
  try {
    f(e);
  } catch (er) {
    console.error(er);
  } finally {
    x.restore();
  }
}
function drawBoss(e) {
  const B = BD[e.bi] || BD[0],
    r = e.r,
    c = e.col || B.c,
    t = e.tm || 0,
    a = Math.atan2(P.y - e.y, P.x - e.x),
    F = e.fl > 0 ? "#fff" : c;
  x.save();
  x.translate(e.x, e.y);
  if (e.t == "decoy") x.globalAlpha = 0.78 + 0.2 * Math.sin(t * 9);
  const g = x.createRadialGradient(0, 0, r * 0.2, 0, 0, r * 1.8);
  g.addColorStop(0, hx(c, "77"));
  g.addColorStop(1, hx(c, "00"));
  x.fillStyle = g;
  x.beginPath();
  x.arc(0, 0, r * 1.8, 0, 7);
  x.fill();
  const S2 = (n, r1, r2, o) => {
      x.beginPath();
      for (let i = 0; i < n * 2; i++) {
        const q = o + (i * Math.PI) / n;
        x.lineTo(Math.cos(q) * (i % 2 ? r2 : r1), Math.sin(q) * (i % 2 ? r2 : r1));
      }
      x.closePath();
      x.fill();
      x.stroke();
    },
    C = (rr, fill) => {
      x.beginPath();
      x.arc(0, 0, rr, 0, 7);
      if (fill) x.fill();
      else x.stroke();
    };
  x.fillStyle = F;
  x.strokeStyle = "#000";
  x.lineWidth = 3;
  if (e.t == "orb") {
    x.fillStyle = "#a4f";
    C(r, 1);
    x.stroke();
  } else
    switch (e.bi > 11 ? 100 + BD[e.bi].sh : e.bi) {
      case 0:
        x.save();
        x.rotate(a);
        x.beginPath();
        x.ellipse(0, 0, r, r * 0.8, 0, 0, 7);
        x.fill();
        x.stroke();
        x.strokeStyle = "#fff";
        x.lineWidth = 4;
        x.beginPath();
        x.moveTo(r * 0.4, -r * 0.5);
        x.lineTo(r * 2, r * 0.2);
        x.moveTo(r * 0.4, r * 0.5);
        x.lineTo(r * 2, -r * 0.2);
        x.stroke();
        x.restore();
        break;
      case 1:
        x.fillRect(-r, -r, 2 * r, 2 * r);
        x.strokeRect(-r, -r, 2 * r, 2 * r);
        for (const s of [-1, 1]) {
          x.beginPath();
          x.arc(s * r * 1.15, Math.sin(t * 3) * 5, r * 0.45, 0, 7);
          x.fill();
          x.stroke();
        }
        S2(8, r * 1.25, r * 0.95, t * 0.2);
        break;
      case 2:
        x.save();
        x.rotate(a);
        S2(4, r * 1.4, r * 0.5, 0);
        x.strokeStyle = "#fff";
        x.lineWidth = 3;
        x.beginPath();
        x.arc(0, 0, r * 1.7, -1, 1);
        x.stroke();
        x.restore();
        break;
      case 3:
        for (let i = 0; i < 3; i++) {
          x.save();
          x.rotate(t + i * 2.09);
          x.globalAlpha *= 0.75;
          S2(3, r * 1.1, r * 0.5, 0);
          x.restore();
        }
        break;
      case 4:
        S2(6, r, r * 0.9, 0);
        for (let i = 0; i < 4; i++) {
          const q = t * 1.5 + i * 1.57;
          x.fillRect(Math.cos(q) * r * 1.6 - 4, Math.sin(q) * r * 1.6 - 4, 8, 8);
        }
        break;
      case 5:
        if (!e.tf) S2(8, r * 1.35, r * 0.7, t);
        else {
          for (const s of [-1, 1]) {
            x.beginPath();
            x.moveTo(0, 0);
            x.lineTo(s * r * 2.2, -r * 1.1 + Math.sin(t * 8) * 6);
            x.lineTo(s * r * 1.5, r * 0.6);
            x.closePath();
            x.fill();
            x.stroke();
          }
          C(r * 0.8, 1);
          x.stroke();
        }
        break;
      case 6:
        C(r, 1);
        x.stroke();
        x.strokeStyle = "#fff";
        C(r * 1.3);
        C(r * 1.55);
        x.strokeStyle = "#000";
        x.save();
        x.translate(0, -r * 0.9);
        S2(5, r * 0.6, r * 0.3, -1.57);
        x.restore();
        break;
      case 7:
        C(r, 1);
        x.stroke();
        x.fillStyle = "#000";
        x.beginPath();
        x.arc(-r * 0.35, -r * 0.1, r * 0.2, 0, 7);
        x.arc(r * 0.35, -r * 0.1, r * 0.2, 0, 7);
        x.fill();
        x.fillRect(-r * 0.3, r * 0.3, r * 0.6, r * 0.12);
        x.fillStyle = "#fd4";
        x.save();
        x.translate(0, -r * 1.05);
        S2(4, r * 0.5, r * 0.25, -1.57);
        x.restore();
        break;
      case 8:
        S2(6, r * 1.5, r * 0.45, t * 3);
        x.fillStyle = "#fff";
        C(r * 0.3, 1);
        break;
      case 9:
        x.fillStyle = "#120818";
        C(r, 1);
        x.strokeStyle = c;
        x.lineWidth = 4;
        C(r);
        x.fillStyle = "#fff";
        x.beginPath();
        x.arc(0, 0, r * 0.5, 0, 7);
        x.fill();
        x.fillStyle = "#000";
        x.beginPath();
        x.arc(Math.cos(a) * r * 0.2, Math.sin(a) * r * 0.2, r * 0.22, 0, 7);
        x.fill();
        break;
      case 10:
        C(r, 1);
        x.stroke();
        x.strokeStyle = "#124";
        x.lineWidth = 3;
        for (let i = 0; i < 12; i++) {
          x.beginPath();
          x.moveTo(Math.cos(i * 0.524) * r * 0.85, Math.sin(i * 0.524) * r * 0.85);
          x.lineTo(Math.cos(i * 0.524) * r, Math.sin(i * 0.524) * r);
          x.stroke();
        }
        x.beginPath();
        x.moveTo(0, 0);
        x.lineTo(
          Math.cos(t * (e.ch > 0 ? -6 : 1)) * r * 0.8,
          Math.sin(t * (e.ch > 0 ? -6 : 1)) * r * 0.8,
        );
        x.moveTo(0, 0);
        x.lineTo(Math.cos(t * 0.2) * r * 0.5, Math.sin(t * 0.2) * r * 0.5);
        x.stroke();
        break;
      case 100:
        S2(6, r * 1.3, r * 0.6, t);
        break;
      case 101:
        S2(10, r * 1.2, r * 0.95, t * 0.5);
        C(r * 0.5, 1);
        x.stroke();
        break;
      case 102:
        S2(4, r * 1.4, r * 0.8, t * 0.3);
        break;
      case 103:
        for (let i = 0; i < 3; i++) {
          x.save();
          x.rotate(-t + i * 2.09);
          S2(3, r * 1.2, r * 0.5, 0);
          x.restore();
        }
        break;
      case 104:
        x.fillRect(-r, -r, 2 * r, 2 * r);
        x.strokeRect(-r, -r, 2 * r, 2 * r);
        x.fillStyle = "#000";
        x.fillRect(-r * 0.5, -r * 0.3, r * 0.3, r * 0.3);
        x.fillRect(r * 0.2, -r * 0.3, r * 0.3, r * 0.3);
        break;
      case 105:
        C(r, 1);
        x.stroke();
        x.strokeStyle = "#fff";
        for (let i = 0; i < 3; i++) {
          x.beginPath();
          x.arc(0, 0, r * (0.35 + i * 0.25), t * 2 + i, t * 2 + i + 3);
          x.stroke();
        }
        break;
      default:
        x.fillStyle = "#050508";
        C(r, 1);
        x.strokeStyle = "#99c";
        x.lineWidth = 3;
        for (let i = 0; i < 3; i++) {
          x.beginPath();
          x.arc(0, 0, r * (0.4 + i * 0.3), t * 2 + i, t * 2 + i + 3.5);
          x.stroke();
        }
    }
  if (e.bi > 11 && FIN(e.bi)) {
    x.strokeStyle = "#fff";
    x.lineWidth = 2;
    x.beginPath();
    x.arc(0, 0, r * 1.4 + Math.sin(t * 4) * 2, 0, 7);
    x.stroke();
  }
  if (e.t == "boss") {
    x.fillStyle = e.imm > 0 ? "#999" : e.vul > 0 ? "#ffd34a" : "#f33";
    x.beginPath();
    x.moveTo(0, -r - 24);
    x.lineTo(7, -r - 14);
    x.lineTo(0, -r - 4);
    x.lineTo(-7, -r - 14);
    x.fill();
    if (e.wd > 0 || e.ch > 0) {
      x.strokeStyle = "#f33";
      x.lineWidth = 2;
      x.setLineDash([6, 6]);
      x.beginPath();
      x.moveTo(0, 0);
      x.lineTo(Math.cos(a) * 300, Math.sin(a) * 300);
      x.stroke();
      x.setLineDash([]);
      x.beginPath();
      x.arc(0, 0, r + 14 + Math.sin(t * 20) * 3, 0, 7);
      x.stroke();
    }
    if (e.imm > 0) {
      x.strokeStyle = "#bbb";
      x.lineWidth = 3;
      x.beginPath();
      x.arc(0, 0, r + 8, 0, 7);
      x.stroke();
    }
  }
  x.restore();
}
