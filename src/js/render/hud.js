/* ======================================================================
 * src/js/render/hud.js
 * Barras y HUD superpuesto.
 *
 * Define:
 * bar, hud
 * ====================================================================== */

function bar(x0, y0, w, v, c) {
  x.fillStyle = "#000a";
  x.fillRect(x0, y0, w, 12);
  x.fillStyle = c;
  x.fillRect(x0, y0, w * cl(v, 0, 1), 12);
}
function hud() {
  x.textAlign = "left";
  x.font = "12px Georgia";
  bar(12, 10, 200, P.hp / P.mhp, "#c33");
  bar(12, 26, 200, P.mp / P.mmp, "#38c");
  bar(12, 42, 200, P.xp / P.nx, "#cb3");
  x.fillStyle = "#fff";
  x.fillText(`Vida ${Math.ceil(P.hp)}/${P.mhp}`, 16, 20);
  x.fillText(`Maná ${Math.floor(P.mp)}`, 16, 36);
  x.fillText(
    `Nv ${P.lv}` +
      (P.sh > 0 ? `  Escudo ${Math.ceil(P.sh)}` : "") +
      (P.tm ? `  [R] ${TM[P.tm]}` : "  [R] acción de clase"),
    16,
    52,
  );
  x.font = "14px Georgia";
  x.fillText(
    `Profundidad ${G.d} · ${G.bi[0]}${EBI[(G.d - 1) % 8] ? " [daño de " + { fire: "fuego", ice: "hielo", poison: "veneno", corr: "corrupción", light: "rayo" }[EBI[(G.d - 1) % 8]] + "]" : ""}   Oro ${P.gold}   Puntos ${P.pts}   ${P.w.n} (${P.w.rn})`,
    12,
    74,
  );
  {
    // estados del jugador: iconos que se oscurecen al agotarse
    const ps = statusList(P, P, STATUS_P);
    drawStatusRow(ps, 12 + 9 + ((ps.length - 1) * 20) / 2, 96, 18);
  }
  hudSlots();

  const t = G.R,
    sz = bigmap ? (S.hard ? 12 : 26) : S.hard ? 9 : 12,
    Cc = G.R[G.cur],
    rel = S.hard && !bigmap,
    ox = bigmap ? 480 - 0 : 940,
    oy = bigmap ? 300 : 20;
  t.forEach((r, i) => {
    if (!G.seen[i]) return;
    if (rel && (Math.abs(r.gx - Cc.gx) > 5 || Math.abs(r.gy - Cc.gy) > 4)) return;
    const px = (bigmap ? 480 : rel ? 860 : 900) + (rel ? r.gx - Cc.gx : r.gx) * (sz + 3),
      py = (bigmap ? 300 : rel ? 60 : 50) + (rel ? r.gy - Cc.gy : r.gy) * (sz + 3);
    x.fillStyle =
      i == G.cur
        ? "#fff"
        : {
            boss: "#f35",
            treasure: "#ca4",
            shrine: "#a7e",
            shop: "#5c8",
            elite: "#e83",
            start: "#888",
            combat: "#556",
            event: "#e66",
          }[r.tp];
    x.globalAlpha = r.cl || i == G.cur ? 1 : 0.6;
    x.fillRect(px, py, sz, sz);
  });
  x.globalAlpha = 1;
  const bs = E.find((e) => e.t == "boss");
  if (bs) drawBossBar(bs);
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
    x.fillText(msg[0], 480, 100);
  }
}

