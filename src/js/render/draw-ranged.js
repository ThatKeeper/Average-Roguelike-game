/* ======================================================================
 * src/js/render/draw-ranged.js
 * Dibujo del arma a distancia en la mano (arco, ballesta, arma rúnica,
 * chakram y báculos) y de los proyectiles con sus sprites.
 *
 * Define:
 * drawRangedSprite, drawHeldRanged, drawProj
 * ====================================================================== */

/**
 * Dibuja un sprite de arma a distancia con la mano en (px, py) y su dirección de disparo hacia `wa`.
 * `extra` es un giro adicional sobre su propio centro (chakram).
 */
function drawRangedSprite(A, key, px, py, wa, extra, glow) {
  const rec = WSPR[key];
  if (!rec || !rec.ready) return;
  x.save();
  x.translate(px, py);
  x.rotate(wa);
  x.imageSmoothingEnabled = false;
  if (extra) x.rotate(extra);
  x.rotate(A.rot);
  x.scale(A.s, A.s);
  if (glow) {
    x.shadowColor = glow;
    x.shadowBlur = 10;
  }
  x.drawImage(rec.img, -(8 + A.gu * Math.cos(A.rot)), -(8 - A.gu * Math.sin(A.rot)));
  x.restore();
}

/** Arma a distancia en la mano del jugador. Se llama dentro de drawP, ya trasladado al jugador. */
function drawHeldRanged() {
  const A = RANGED_ART[P.w.n];
  if (!A) return;
  const f = P.face,
    e = RK / RK_TIME, // 1 justo al disparar, 0 en reposo
    ready = rangedReady(),
    hd = A.hd - A.kick * e,
    tilt = A.kick > 0 ? -0.25 * e * (Math.cos(f) >= 0 ? 1 : -1) : 0,
    wob = A.kick < 0 ? Math.sin(Date.now() / 300) * 0.04 : 0;
  drawRangedSprite(
    A,
    ready ? A.spr2 : A.spr,
    Math.cos(f) * hd,
    Math.sin(f) * hd,
    f + tilt + wob,
    A.spin ? (Date.now() / 1000) * A.spin : 0,
    (ready && A.kick < 0) || e > 0 ? A.glow : null,
  );
}

/** Dibuja un proyectil del jugador con su sprite. Devuelve false si no hay sprite listo (se usa el círculo). */
function drawProj(p) {
  const A = PROJ_ART[p.spr],
    rec = A && WSPR[p.spr];
  if (!rec || !rec.ready) return false;
  const s = A.s * cl(p.r / A.r, 0.8, 1.5);
  x.save();
  x.translate(p.x, p.y);
  x.rotate(A.spin ? (p.l0 - p.l) * A.spin : Math.atan2(p.vy, p.vx));
  x.imageSmoothingEnabled = false;
  x.scale(s, s);
  if (p.gl) {
    x.shadowColor = p.gl;
    x.shadowBlur = 8;
  }
  x.drawImage(rec.img, -A.ax, -A.ay);
  x.restore();
  return true;
}
