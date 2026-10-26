/* ======================================================================
 * src/js/render/draw.js
 * Dibujado principal del juego en el canvas.
 *
 * Define:
 * ammoBar, draw, drawWorld
 * ====================================================================== */

// ===== RENDER =====
function ammoBar() {
  const w = P.w;
  if (!w.mag) return;
  const m = w.mag,
    rl = P.rl > 0,
    f = rl ? 1 - P.rl / (w.rt || 1.6) : (P.am ?? m) / m,
    bw = Math.min(40, 10 + m * 3),
    bx = P.x - bw / 2,
    by = P.y + 20;
  x.save();
  x.fillStyle = "#000a";
  x.fillRect(bx - 1, by - 1, bw + 2, 6);
  x.fillStyle = rl ? "#fb3" : f <= 0.25 ? "#f55" : "#8cf";
  x.fillRect(bx, by, bw * cl(f, 0, 1), 4);
  x.restore();
}
function draw() {
  if (G.st == "over" && G.dth) {
    // escena de muerte; al terminar se muestran las estadísticas
    if (drawDeath()) {
      G.dth = null;
      deathStats();
    }
    return;
  }
  if (G.st != "play") {
    x.save();
    x.clearRect(0, 0, W, H);
    x.fillStyle = "#0b0a10";
    x.fillRect(0, 0, W, H);
    x.restore();
    return;
  }
  // zoom de cámara (escena del mercader)
  const zs = G.zm ? sqZoom() : 1;
  if (zs != 1 && G.zm) {
    x.save();
    x.translate(G.zm.tx, G.zm.ty);
    x.scale(zs, zs);
    x.translate(-G.zm.tx, -G.zm.ty);
    drawWorld();
    x.restore();
  } else drawWorld();
  hud();
  if (G.cs) drawCS();
  dbgHud();
}
// Dibuja la sala y todo lo que hay en ella (sin HUD). noPlayer: omite al jugador (transición de cámara).
function drawWorld(noPlayer) {
  x.save();
  x.clearRect(0, 0, W, H);
  const sk = S.nosh ? 0 : shake;
  x.translate(rnd(-sk, sk), rnd(-sk, sk));
  for (const a of AMB) {
    x.globalAlpha = 0.25;
    x.fillStyle = G.bi[3];
    x.fillRect(a.x, a.y, a.s, a.s);
  }
  x.globalAlpha = 1;
  const b = G.bi,
    r = RM_;
  drawRoomBase(r);
  drawDoors(r);
  if (r.tp == "puzzle") sqDraw(r);
  x.textAlign = "center";
  const cx = 480,
    cy = 300;
  if (["treasure", "shrine", "shop", "event"].includes(r.tp)) drawProp(r, cx, cy);
  if (r.tp == "boss" && r.cl) {
    x.fillStyle = "#5ff";
    x.beginPath();
    x.arc(cx, cy, 24 + Math.sin(Date.now() / 150) * 3, 0, 7);
    x.fill();
    x.fillStyle = "#fff";
    x.font = "12px Georgia";
    x.fillText(G.train ? "Salir al hub [F]" : "Descender [F]", cx, cy - 34);
  }
  for (const o of O) {
    if (o.k == "i") {
      if (!drawItemIcon(o.it, o.x, o.y, 26)) spr(o.it.i, o.x, o.y, 20);
    }
    else {
      x.fillStyle = o.k == "g" ? "#ffd34a" : "#f55";
      x.beginPath();
      x.arc(o.x, o.y, o.k == "g" ? 4 : 6, 0, 7);
      x.fill();
    }
  }
  for (const h of r.hz || []) {
    x.globalAlpha = 0.4;
    x.fillStyle = ["", "", "", "#3a6", "", "#f60", "#8ef", "#c3a"][(G.d - 1) % 8];
    x.beginPath();
    x.arc(h.x, h.y, h.r, 0, 7);
    x.fill();
    x.globalAlpha = 1;
  }
  if (G.dk) {
    const g = x.createRadialGradient(P.x, P.y, G.dk * 0.5, P.x, P.y, G.dk);
    g.addColorStop(0, "#0000");
    g.addColorStop(1, "#000c");
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);
  }
  drawActors(noPlayer);
  dbgWorld();
  x.restore();
}
// Zonas, enemigos, proyectiles, efectos y jugador (compartido por la mazmorra y la sala de clases).
function drawActors(noPlayer) {
  for (const z of ZN) {
    x.globalAlpha = 0.22;
    x.fillStyle = EL[z.sp.a].c;
    x.beginPath();
    x.arc(z.x, z.y, z.r, 0, 7);
    x.fill();
    x.globalAlpha = 1;
  }
  if (SBH.length) drawSBH();
  for (const z of FZ) drawFZ(z);
  for (const t of TR) drawTR(t);
  for (const z of Z) {
    x.strokeStyle = z.c;
    x.fillStyle = z.c;
    x.globalAlpha = 0.25 + 0.3 * (1 - z.t / (z.m || 1));
    x.beginPath();
    x.arc(z.x, z.y, z.r, 0, 7);
    x.fill();
    x.globalAlpha = 1;
    x.stroke();
  }
  for (const e of E) {
    const T = ET[e.t];
    x.globalAlpha = e.sp > 0 && !e.sb ? 0.3 : 1;
    if (e.t == "boss" || e.t == "decoy" || e.t == "orb") safe(drawBoss, e);
    else safe(drawEnemy, e);
    if (e.sh > 0) {
      x.strokeStyle = "#4fa";
      x.beginPath();
      x.arc(e.x, e.y, e.r + 5, 0, 7);
      x.stroke();
    }
    if (e.st.slow > 0) {
      x.strokeStyle = "#9ef";
      x.beginPath();
      x.arc(e.x, e.y, e.r + 2, 0, 7);
      x.stroke();
    }
    drawStatusRow(statusList(e, e.st, STATUS_E), e.x, e.y - e.r - 12, 12);
    {
      const a = Math.atan2(P.y - e.y, P.x - e.x);
      x.fillStyle = "#fff";
      x.beginPath();
      x.arc(e.x + Math.cos(a) * e.r * 0.5, e.y + Math.sin(a) * e.r * 0.5, e.r * 0.2, 0, 7);
      x.fill();
    }

    if (e.wind > 0) {
      x.strokeStyle = "#f44";
      x.beginPath();
      x.arc(e.x, e.y, e.r + 26, 0, 7);
      x.stroke();
    }
    if (e.t != "decoy" && e.t != "orb" && (e.hp < e.mhp || e.t == "boss")) {
      x.fillStyle = "#000";
      x.fillRect(e.x - e.r, e.y - e.r - 12, e.r * 2, 4);
      x.fillStyle = "#e44";
      x.fillRect(e.x - e.r, e.y - e.r - 12, e.r * 2 * cl(e.hp / e.mhp, 0, 1), 4);
    }
    x.globalAlpha = 1;
  }
  for (const p of PR) {
    if (p.dr) {
      p.dr(p); // dibujo propio (astros del jefe secreto)
      continue;
    }
    if (p.spr && drawProj(p)) continue;
    x.fillStyle = p.c;
    x.beginPath();
    x.arc(p.x, p.y, p.r, 0, 7);
    x.fill();
  }
  for (const f of FX) {
    const a = f.t / (f.m || 1);
    x.globalAlpha = a;
    if (f.k == "trail") {
      drawSwingTrail(f);
    } else if (f.k == "arc") {
      x.fillStyle = "#fff";
      x.beginPath();
      x.moveTo(f.x, f.y);
      x.arc(f.x, f.y, f.r, f.a - f.w / 2, f.a + f.w / 2);
      x.fill();
    } else if (f.k == "ring") {
      x.strokeStyle = f.c;
      x.lineWidth = 4;
      x.beginPath();
      x.arc(f.x, f.y, f.r * (1.1 - a * 0.3), 0, 7);
      x.stroke();
    } else if (f.k == "dead") {
      const q = 1 - a;
      x.fillStyle = f.c;
      x.save();
      x.translate(f.x, f.y);
      x.rotate(q * 3);
      x.scale(1 + q * 0.3, 1 - q * 0.8);
      x.beginPath();
      x.arc(0, 0, f.r, 0, 7);
      x.fill();
      x.restore();
    } else if (f.k == "star") {
      // estrella de cuatro puntas que gira y se encoge
      const sz = f.s * (0.35 + 0.65 * a);
      x.fillStyle = f.c;
      x.save();
      x.translate(f.x, f.y);
      x.rotate(f.rot + (f.m - f.t) * f.sp);
      x.beginPath();
      for (let i = 0; i < 8; i++) {
        const rr2 = i % 2 ? sz * 0.35 : sz;
        x.lineTo(Math.cos((i * Math.PI) / 4) * rr2, Math.sin((i * Math.PI) / 4) * rr2);
      }
      x.fill();
      x.restore();
    } else if (f.k == "beam") {
      // columna de luz que se eleva y se estrecha
      const g = x.createLinearGradient(0, f.y, 0, f.y - 190);
      g.addColorStop(0, f.c);
      g.addColorStop(1, "#ffd34a00");
      x.fillStyle = g;
      const bw = 8 + 24 * a;
      x.fillRect(f.x - bw / 2, f.y - 190, bw, 190);
    } else if (f.k == "line") {
      x.strokeStyle = "#fff27a";
      x.lineWidth = 3;
      x.beginPath();
      x.moveTo(f.x, f.y);
      x.lineTo(f.x2, f.y2);
      x.stroke();
    } else {
      x.fillStyle = f.c;
      x.fillRect(f.x, f.y, 3, 3);
    }
    x.globalAlpha = 1;
  }
  if (!noPlayer) {
    x.globalAlpha = P.inv > 0 && Math.floor(Date.now() / 60) % 2 ? 0.4 : 1;
    safe(drawP);
    ammoBar();
  }
  x.globalAlpha = 1;
  for (const n of NM) {
    x.fillStyle = n.c;
    x.font = "bold 14px Georgia";
    x.fillText(n.t, n.x, n.y);
  }
}

