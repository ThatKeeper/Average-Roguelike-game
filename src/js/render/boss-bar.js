/* ======================================================================
 * src/js/render/boss-bar.js
 * Barra de vida del jefe: nombre, fase actual, marcas en los umbrales de
 * fase (66 % y 33 %), barra de daño reciente y estado (inmune/vulnerable).
 *
 * Define:
 * BOSS_THR, bossPhase, drawBossBar
 * ====================================================================== */

const BOSS_THR = [0.66, 0.33]; // % de vida a los que el jefe cambia de fase (igual que en ai/enemies.js)
const ROMAN = ["I", "II", "III"];

/** Fase actual del jefe: 0, 1 o 2. */
function bossPhase(e) {
  const r = e.hp / e.mhp;
  if (e.sb) return r < 0.5 ? 1 : 0; // el jefe secreto tiene dos fases
  return r < BOSS_THR[1] ? 2 : r < BOSS_THR[0] ? 1 : 0;
}

function drawBossBar(bs) {
  const B = BD[bs.bi],
    bx = 240,
    by = 24,
    bw = 480,
    bh = 20,
    tm = Date.now() / 1000,
    ratio = cl(bs.hp / bs.mhp, 0, 1),
    ph = bossPhase(bs),
    imm = bs.imm > 0,
    vul = bs.vul > 0;
  // barra de "daño reciente": se queda atrás y alcanza a la vida real poco a poco
  if (bs._hs === undefined || ratio > bs._hs) bs._hs = ratio;
  else bs._hs += (ratio - bs._hs) * 0.06;
  // destello al cambiar de fase
  if (bs._ph0 !== undefined && bs._ph0 !== ph) bs._fl = 1;
  bs._ph0 = ph;
  bs._fl = Math.max(0, (bs._fl || 0) - 0.025);
  const fl = bs._fl,
    pulse = 0.5 + 0.5 * Math.sin(tm * 8),
    edge = imm ? "#9ab" : vul ? "#ffd34a" : B.c;

  x.save();
  // marco
  rr(bx - 4, by - 4, bw + 8, bh + 8, 6);
  x.fillStyle = "#0b0a10e6";
  x.fill();
  x.lineWidth = vul ? 2 + pulse * 1.5 : 2;
  x.strokeStyle = edge;
  x.stroke();
  // daño reciente
  x.fillStyle = "#fff8";
  x.fillRect(bx, by, bw * bs._hs, bh);
  // vida actual: gris con rayas si es inmune, dorada si es vulnerable, color del jefe si no
  const g = x.createLinearGradient(0, by, 0, by + bh);
  const base = imm ? "#8a919a" : vul ? "#ffd34a" : B.c;
  g.addColorStop(0, base);
  g.addColorStop(1, "#000a");
  x.fillStyle = base;
  x.fillRect(bx, by, bw * ratio, bh);
  x.fillStyle = g;
  x.fillRect(bx, by, bw * ratio, bh);
  if (imm) {
    // rayas diagonales: no recibe daño ahora mismo
    x.save();
    x.beginPath();
    x.rect(bx, by, bw * ratio, bh);
    x.clip();
    x.strokeStyle = "#0006";
    x.lineWidth = 4;
    for (let i = -bh; i < bw * ratio + bh; i += 12) {
      x.beginPath();
      x.moveTo(bx + i, by + bh);
      x.lineTo(bx + i + bh, by);
      x.stroke();
    }
    x.restore();
  }
  if (fl > 0) {
    x.fillStyle = `rgba(255,255,255,${fl * 0.8})`;
    x.fillRect(bx, by, bw, bh);
  }
  // marcas de los umbrales de fase: brillan hasta que se cruzan
  sbBarThr(bs).forEach((t, i) => {
    const mx = bx + bw * t,
      done = ratio < t;
    x.strokeStyle = done ? "#fff3" : "#fff";
    x.lineWidth = 2;
    x.beginPath();
    x.moveTo(mx, by - 5);
    x.lineTo(mx, by + bh + 5);
    x.stroke();
    x.fillStyle = done ? "#fff3" : "#ffd34a";
    x.beginPath();
    x.moveTo(mx, by - 9);
    x.lineTo(mx + 4, by - 5);
    x.lineTo(mx, by - 1);
    x.lineTo(mx - 4, by - 5);
    x.fill();
    x.font = "10px Georgia";
    x.textAlign = "center";
    x.fillStyle = done ? "#fff4" : "#fffc";
    x.fillText(Math.round(t * 100) + "%", mx, by + bh + 16);
  });
  // porcentaje dentro de la barra
  x.font = "bold 12px Georgia";
  x.textAlign = "center";
  x.fillStyle = imm ? "#fff" : "#fff";
  x.shadowColor = "#000";
  x.shadowBlur = 3;
  x.fillText(Math.ceil(ratio * 100) + "%", bx + bw / 2, by + bh - 5);
  x.shadowBlur = 0;
  // nombre (izquierda)
  x.textAlign = "left";
  x.font = "bold 15px Georgia";
  x.fillStyle = "#fff";
  x.fillText(bs.nm + (FIN(bs.bi) ? "  ★ JEFE FINAL" : ""), bx, by - 10);
  // fase (derecha): rombos llenos hasta la fase actual
  x.textAlign = "right";
  x.font = `bold ${13 + fl * 5}px Georgia`;
  x.fillStyle = ph == 2 ? "#ff6a5a" : ph == 1 ? "#ffb04a" : "#cfe3ff";
  x.fillText("FASE " + ROMAN[ph], bx + bw, by - 10);
  for (let i = 0; i < 3; i++) {
    const dx = bx + bw - 88 - (2 - i) * 12 - 6;
    x.fillStyle = i <= ph ? "#ffd34a" : "#fff3";
    x.beginPath();
    x.moveTo(dx, by - 20);
    x.lineTo(dx + 5, by - 15);
    x.lineTo(dx, by - 10);
    x.lineTo(dx - 5, by - 15);
    x.fill();
  }
  // estado: inmune / vulnerable, debajo de la barra y alineado a la derecha (a la izquierda está el HUD)
  x.textAlign = "right";
  x.font = "bold 13px Georgia";
  if (imm) {
    x.fillStyle = "#bcd";
    x.fillText("🛡 INMUNE — rompe la protección", bx + bw, by + bh + 32);
  } else if (vul) {
    x.fillStyle = `rgba(255,${(200 + pulse * 40) | 0},80,1)`;
    x.fillText(`✦ VULNERABLE +60% · ${Math.max(0, bs.vul).toFixed(1)}s`, bx + bw, by + bh + 32);
  }
  if (P.invc > 0) {
    x.fillStyle = "#f5a";
    x.fillText("¡CONTROLES INVERTIDOS!", bx + bw, by + bh + (imm || vul ? 48 : 32));
  }
  x.restore();
}
