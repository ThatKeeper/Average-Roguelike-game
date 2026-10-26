/* ======================================================================
 * src/js/render/hud.js
 * Barras y HUD superpuesto.
 *
 * Define:
 * hudBars, hud
 * ====================================================================== */

// ---- Barras de vida, maná y experiencia: mismo estilo que la barra de los jefes (boss-bar.js) ----
// Marco oscuro redondeado con borde de color, barra de "daño reciente" que se queda atrás, degradado,
// destello al recibir daño / curarse / subir de nivel y borde que pulsa cuando queda poca vida.
const HUDS = { P: null, h: 1, m: 1, x: 0, hp0: 0, mp0: 0, lv0: 0, fh: 0, fg: 0, fm: 0, fx: 0 };

/** Una barra: o = { bx, by, bw, bh, v (0..1), tr (estela), c1, c2 (degradado), edge, fl (destello 0..1), flc, alert, sh (0..1 escudo), ticks, l, r, fs } */
function hudBar(o) {
  const pulse = 0.5 + 0.5 * Math.sin((Date.now() / 1000) * 8);
  x.save();
  // marco
  rr(o.bx - 4, o.by - 4, o.bw + 8, o.bh + 8, o.bh > 12 ? 6 : 5);
  x.fillStyle = "#0b0a10e6";
  x.fill();
  x.lineWidth = o.alert ? 2 + pulse * 1.5 : 2;
  x.strokeStyle = o.alert ? `rgb(255,${(70 + pulse * 70) | 0},70)` : o.edge;
  x.stroke();
  // interior recortado a las esquinas
  x.save();
  rr(o.bx, o.by, o.bw, o.bh, 3);
  x.clip();
  x.fillStyle = "#15121c";
  x.fillRect(o.bx, o.by, o.bw, o.bh);
  x.fillStyle = o.trc || "#fff8"; // daño reciente
  x.fillRect(o.bx, o.by, o.bw * o.tr, o.bh);
  const g = x.createLinearGradient(0, o.by, 0, o.by + o.bh);
  g.addColorStop(0, o.c1);
  g.addColorStop(1, o.c2);
  x.fillStyle = g;
  x.fillRect(o.bx, o.by, o.bw * o.v, o.bh);
  if (o.v > 0) {
    x.fillStyle = "#fff3"; // brillo superior
    x.fillRect(o.bx, o.by + 1, o.bw * o.v, Math.max(1, o.bh * 0.18));
  }
  if (o.sh > 0) {
    x.fillStyle = "#8fd8ffd0"; // escudo: franja superior
    x.fillRect(o.bx, o.by, o.bw * Math.min(1, o.sh), Math.max(3, o.bh * 0.28));
  }
  x.strokeStyle = "#0007"; // marcas al 25 / 50 / 75 %
  x.lineWidth = 1;
  if (o.ticks)
    for (const t of [0.25, 0.5, 0.75]) {
      x.beginPath();
      x.moveTo(o.bx + o.bw * t, o.by);
      x.lineTo(o.bx + o.bw * t, o.by + o.bh);
      x.stroke();
    }
  if (o.fl > 0) {
    x.fillStyle = o.flc + o.fl * 0.8 + ")";
    x.fillRect(o.bx, o.by, o.bw, o.bh);
  }
  x.restore();
  // texto
  x.font = `bold ${o.fs}px Georgia`;
  x.shadowColor = "#000";
  x.shadowBlur = 3;
  x.fillStyle = "#fff";
  x.textAlign = "left";
  x.fillText(o.l, o.bx + 6, o.by + o.bh / 2 + o.fs * 0.35);
  if (o.r) {
    x.textAlign = "right";
    x.fillText(o.r, o.bx + o.bw - 6, o.by + o.bh / 2 + o.fs * 0.35);
  }
  x.shadowBlur = 0;
  x.restore();
}

function hudBars() {
  const S_ = HUDS,
    rh = cl(P.hp / P.mhp, 0, 1),
    rm = cl(P.mp / Math.max(1, P.mmp), 0, 1),
    rx = cl(P.xp / P.nx, 0, 1);
  if (S_.P !== P) {
    // jugador nuevo: sin destellos ni estelas heredadas
    Object.assign(S_, { P, h: rh, m: rm, x: rx, hp0: P.hp, mp0: P.mp, lv0: P.lv, fh: 0, fg: 0, fm: 0, fx: 0 });
  }
  if (P.hp < S_.hp0 - 0.05) S_.fh = 1;
  else if (P.hp > S_.hp0 + 0.05) S_.fg = 0.7;
  if (P.mp < S_.mp0 - 0.05) S_.fm = 0.35;
  if (P.lv != S_.lv0) {
    S_.fx = 1;
    S_.x = rx; // la experiencia vuelve a empezar: sin estela
  }
  S_.hp0 = P.hp;
  S_.mp0 = P.mp;
  S_.lv0 = P.lv;
  // las estelas se quedan atrás al bajar y suben a la vez que la barra
  S_.h = rh > S_.h ? rh : S_.h + (rh - S_.h) * 0.06;
  S_.m = rm > S_.m ? rm : S_.m + (rm - S_.m) * 0.06;
  S_.x = rx > S_.x ? rx : S_.x + (rx - S_.x) * 0.06;
  S_.fh = Math.max(0, S_.fh - 0.04);
  S_.fg = Math.max(0, S_.fg - 0.03);
  S_.fm = Math.max(0, S_.fm - 0.05);
  S_.fx = Math.max(0, S_.fx - 0.02);
  const bx = 38,
    bw = 184,
    low = rh < 0.3;
  x.save();
  // vida
  hudBar({
    bx, by: 12, bw, bh: 20, v: rh, tr: S_.h, c1: "#ff6a6a", c2: "#7a1018", edge: "#d9434e", alert: low, ticks: 1,
    fl: Math.max(S_.fh, S_.fg), flc: S_.fh >= S_.fg ? "rgba(255,255,255," : "rgba(140,255,160,",
    sh: P.sh > 0 ? P.sh / P.mhp : 0, fs: 12,
    l: "Vida", r: `${Math.ceil(P.hp)} / ${P.mhp}` + (P.sh > 0 ? `  +${Math.ceil(P.sh)}` : ""),
  });
  // maná
  hudBar({
    bx, by: 44, bw, bh: 14, v: rm, tr: S_.m, c1: "#6fb4ff", c2: "#12356e", edge: "#4a90e2", ticks: 1,
    fl: S_.fm, flc: "rgba(180,220,255,", trc: "#cfe6ff88", fs: 11,
    l: "Maná", r: `${Math.floor(P.mp)} / ${P.mmp}`,
  });
  // experiencia + clase
  hudBar({
    bx, by: 68, bw, bh: 10, v: rx, tr: S_.x, c1: "#ffe27a", c2: "#8a6212", edge: "#c9a24a",
    fl: S_.fx, flc: "rgba(255,240,170,", trc: "#fff2b088", fs: 9,
    l: `Nv ${P.lv} · ${P.nov ? "Sin clase" : curCls().n}`, r: `${Math.floor(P.xp)} / ${P.nx}`,
  });
  // iconos de cada barra (del tilemap del HUD; si no está cargado se dibuja un símbolo)
  [["bi_heart", "♥", 22, "#ff6a6a"], ["bi_manadrop", "◆", 51, "#6fb4ff"], ["bi_star", "★", 73, "#ffd34a"]].forEach(([n, f, cy, c]) => {
    if (!hPiece(n, 20, cy, 1)) {
      x.fillStyle = c;
      x.font = "bold 14px Georgia";
      x.textAlign = "center";
      x.fillText(f, 20, cy + 5);
    }
  });
  x.restore();
}
// Contador de oro: el número sube (o baja) con animación hacia el valor real y la moneda "late" al ganar
const HUDG = { P: null, v: 0, bump: 0 };
function goldShown() {
  if (HUDG.P !== P) Object.assign(HUDG, { P, v: P.gold, bump: 0 });
  const d = P.gold - HUDG.v;
  if (Math.abs(d) < 0.5) HUDG.v = P.gold;
  else {
    const st = d * 0.1;
    HUDG.v += Math.abs(st) < 1 ? Math.sign(d) : st;
    if (d > 0) HUDG.bump = 1;
  }
  HUDG.bump = Math.max(0, HUDG.bump - 0.045);
  return Math.round(HUDG.v);
}
const EL_DMG = { fire: "fuego", ice: "hielo", poison: "veneno", corr: "corrupción", light: "rayo" };
function hud() {
  hudBars();
  x.save();
  // oro (moneda prerenderizada) y puntos
  const gv = goldShown(),
    bp = HUDG.bump;
  if (!hIcon("coin", 24, 97, 22 + bp * 6)) {
    x.fillStyle = "#ffd34a";
    x.beginPath();
    x.arc(24, 97, 8, 0, 7);
    x.fill();
  }
  x.textAlign = "left";
  x.font = `bold ${16 + Math.round(bp * 3)}px Georgia`;
  x.shadowColor = "#000";
  x.shadowBlur = 3;
  x.fillStyle = bp > 0.05 ? "#fff3b0" : "#ffd34a";
  x.fillText(String(gv), 40, 103);
  const gw = x.measureText(String(gv)).width;
  x.font = "13px Georgia";
  x.fillStyle = "#fff";
  x.fillText(`Puntos ${P.pts}`, 40 + gw + 14, 102);
  const el = EBI[(G.d - 1) % 8];
  if (el) {
    x.fillStyle = "#f96";
    x.fillText(`Daño de ${EL_DMG[el]}`, 40 + gw + 14 + 70, 102);
  }
  x.restore();
  {
    // estados del jugador: iconos que se oscurecen al agotarse
    const ps = statusList(P, P, STATUS_P);
    drawStatusRow(ps, 12 + 9 + ((ps.length - 1) * 20) / 2, 116, 18);
  }
  hudSlots();

  drawMap();
  const bs = E.find((e) => e.t == "boss");
  if (bs && !G.cs) drawBossBar(bs);
  if (G.intro && G.intro.t > 0) {
    x.textAlign = "center";
    x.globalAlpha = Math.min(1, G.intro.t);
    x.fillStyle = "#000a";
    x.fillRect(0, 230, W, 100);
    x.fillStyle = BD[G.intro.i].c;
    x.font = "bold 34px Georgia";
    x.fillText(G.intro.n, 480, 285);
    x.fillStyle = "#fff";
    x.font = "14px Georgia";
    x.fillText(FIN(G.intro.i) ? "JEFE FINAL" : "JEFE", 480, 312);
    x.globalAlpha = 1;
  }
  if (S.hard) {
    x.textAlign = "right";
    x.fillStyle = "#f55";
    x.font = "bold 12px Georgia";
    x.fillText("☠ MODO DIFÍCIL", 948, H - 64);
  }
  if (G.ban && G.ban[1] > 0) {
    x.textAlign = "center";
    x.globalAlpha = Math.min(1, G.ban[1]);
    x.fillStyle = "#000b";
    x.fillRect(0, 130, W, 56);
    x.fillStyle = "#f55";
    x.font = "bold 28px Georgia";
    x.fillText(G.ban[0], 480, 168);
    x.globalAlpha = 1;
  }
  if (msg[1] > 0) {
    x.textAlign = "center";
    x.font = "18px Georgia";
    x.fillStyle = "#ffd34a";
    x.fillText(msg[0], 480, 140);
  }
}

