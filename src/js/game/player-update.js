/* ======================================================================
 * src/js/game/player-update.js
 * Actualización por fotograma del jugador (upP) y cambio de sala (go).
 *
 * Define:
 * upP, go
 * ====================================================================== */

// ===== ACTUALIZACIÓN =====
function upP(dt) {
  ST();
  if (TC.ah) tcAim();
  P.invc -= dt;
  const sg = P.invc > 0 ? -1 : 1,
    ix = sg * ((K[KY.right] ? 1 : 0) - (K[KY.left] ? 1 : 0)),
    iy = sg * ((K[KY.down] ? 1 : 0) - (K[KY.up] ? 1 : 0)),
    il = Math.hypot(ix, iy) || 1;
  P.face = Math.atan2(M.y - P.y, M.x - P.x);
  P.g = M.r && P.w.s == "m";
  if (!P.g && P.pg0) P.pcd = Math.max(P.pcd, 0.45);
  P.pg0 = P.g;
  P.pcd -= dt;
  P.potcd -= dt;
  P.gt = P.g ? P.gt + dt : 0;
  const sp = P.spd * (P.g ? 0.5 : 1) * (P.slow > 0 ? 0.55 : 1);
  if (P.dash) {
    P.x += P.dash.vx * dt;
    P.y += P.dash.vy * dt;
    P.dash.t -= dt;
    if (P.dash.t <= 0) {
      const e = P.dash.end;
      P.dash = null;
      e && e();
    }
  } else {
    const k = Math.min(1, dt * 12);
    P.vx += ((ix / il) * sp - P.vx) * k;
    P.vy += ((iy / il) * sp - P.vy) * k;
    P.x += P.vx * dt;
    P.y += P.vy * dt;
  }
  col(P);
  P.inv -= dt;
  P.acd -= dt;
  P.dcd -= dt;
  P.fl -= dt;
  P.bt -= dt;
  P.rl -= dt;
  P.at -= dt;
  P.slow -= dt;
  spl(dt);
  P.cd = P.cd.map((c) => c - dt);
  P.mp = Math.min(P.mmp, P.mp + P.mr * dt);
  P.hp = Math.min(P.mhp, P.hp + 0.1 * U("rec") * dt);
  swingTick(dt);
  rangedTick(dt);
  if (M.d && P.acd <= 0 && !P.dash && !G.ov) atk();
  if (K[KY.q]) ab(0);
  if (K[KY.e]) ab(1);
  if (M.r && P.w.s != "m") ab(2);
  if (K[KY.r]) classAction(dt);
  if (P.cls == "g") for (let i = 0; i < 4; i++) if (K[KY["c" + (i + 1)]]) castCard(i);
  const r = RM_;
  // Puertas: solo se cruzan con la sala limpia (r.cl). Arriba/abajo miden 2 tiles (80 px) y los lados 3 tiles (120 px).
  if (r.cl)
    for (const k in r.nb) {
      if (k == 0 && P.y <= RB.y0 + P.r + 2 && Math.abs(P.x - 480) < 40) return go(r.nb[0], 2, 0);
      if (k == 2 && P.y >= RB.y1 - P.r - 2 && Math.abs(P.x - 480) < 40) return go(r.nb[2], 0, 2);
      if (k == 1 && P.x >= RB.x1 - P.r - 2 && Math.abs(P.y - 300) < 60) return go(r.nb[1], 3, 1);
      if (k == 3 && P.x <= RB.x0 + P.r + 2 && Math.abs(P.y - 300) < 60) return go(r.nb[3], 1, 3);
    }
}
// Cruza la puerta k hacia la sala i (entrando por el lado f) con la cámara desplazándose hacia la nueva sala.
function go(i, f, k) {
  trnSlide(k, i, f);
}

