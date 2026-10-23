/* ======================================================================
 * src/js/render/draw-melee.js
 * Dibujo del arma cuerpo a cuerpo en la mano (reposo, guardia y golpe)
 * y de la estela que deja al atacar.
 *
 * Define:
 * drawMeleeSprite, drawHeldMelee, drawSwingTrail
 * ====================================================================== */

/**
 * Dibuja el sprite con la mano en (px, py) y el eje del arma apuntando a `wa`.
 * `k` escala el arma, `sy` = -1 la voltea, `alpha` multiplica la opacidad actual.
 */
function drawMeleeSprite(A, px, py, wa, k, sy, alpha, glow) {
  const rec = A.spr && WSPR[A.spr],
    s = A.s * k;
  x.save();
  x.globalAlpha *= alpha;
  x.translate(px, py);
  x.rotate(wa);
  if (sy < 0) x.scale(1, -1);
  if (rec && rec.ready) {
    x.imageSmoothingEnabled = false;
    x.rotate(Math.PI / 4); // el sprite viene en diagonal: así su eje queda en +x
    x.scale(s, s);
    if (glow) {
      x.shadowColor = glow;
      x.shadowBlur = 8;
    }
    // la mano queda en el origen: la empuñadura está en gu sobre el eje
    x.drawImage(rec.img, -(8 + A.gu / SQ2), -(8 - A.gu / SQ2));
  } else {
    // sin sprite: hoja sencilla
    x.strokeStyle = "#dde";
    x.lineWidth = 4;
    x.beginPath();
    x.moveTo(0, 0);
    x.lineTo((A.tu - A.gu) * s, 0);
    x.stroke();
    x.strokeStyle = "#864";
    x.lineWidth = 5;
    x.beginPath();
    x.moveTo(2, -5);
    x.lineTo(2, 5);
    x.stroke();
  }
  x.restore();
}

/** Arma en la mano del jugador. Se llama dentro de drawP, ya trasladado al jugador. */
function drawHeldMelee() {
  const A = meleeArt(P.w),
    f = P.face;
  if (SW && SW.owner === P) {
    const pose = swingPose(SW, SW.t);
    drawMeleeSprite(A, pose.hx, pose.hy, pose.ang, pose.k, pose.sy, 1, pose.ph == 1 ? SW.fx.c : null);
  } else if (P.g) {
    // guardia: el arma cruzada delante del cuerpo; brilla durante la ventana de parry
    const parry = P.gt < 0.22 && !(P.pcd > 0);
    drawMeleeSprite(A, Math.cos(f + 0.25) * 12, Math.sin(f + 0.25) * 12, f - 1.1, 0.9, 1, 1, parry ? "#fff" : null);
  } else {
    const wob = Math.sin(Date.now() / 240) * 0.03,
      sy = A.edge ? (A.edge === SWDIR ? 1 : -1) : 1;
    drawMeleeSprite(A, Math.cos(f + A.idle * 0.45) * IDLE_HR, Math.sin(f + A.idle * 0.45) * IDLE_HR, f + A.idle + wob, IDLE_K, sy, 1, null);
  }
}

/** Estela de un golpe: banda translúcida entre posiciones sucesivas del arma + copias fantasma del sprite. */
function drawSwingTrail(f) {
  const age = f.m - f.t,
    pts = f.pts,
    A = f.art;
  x.save();
  for (let i = 0; i < pts.length; i++) {
    const b = pts[i],
      al = 1 - (age - b.t) / f.life;
    if (al <= 0) continue;
    if (i % 3 == 0) {
      // copia fantasma del sprite (uno por fotograma)
      x.globalAlpha = 1;
      drawMeleeSprite(A, b.gx, b.gy, b.ang, b.k, b.sy, al * 0.22, null);
    }
    if (i == 0) continue;
    const a = pts[i - 1];
    if (A.fam == "thrust") {
      // estocada: líneas de velocidad a lo largo del arma
      const dx = b.x2 - b.x1,
        dy = b.y2 - b.y1,
        n = Math.hypot(dx, dy) || 1;
      x.strokeStyle = f.c;
      x.lineWidth = 2;
      for (const o of [-6, 0, 6]) {
        x.globalAlpha = al * 0.6;
        x.beginPath();
        x.moveTo(b.x1 - (dy / n) * o, b.y1 + (dx / n) * o);
        x.lineTo(b.x2 - (dy / n) * o, b.y2 + (dx / n) * o);
        x.stroke();
      }
      continue;
    }
    x.globalAlpha = al * 0.5;
    x.fillStyle = f.c;
    x.beginPath();
    x.moveTo(a.x1, a.y1);
    x.lineTo(a.x2, a.y2);
    x.lineTo(b.x2, b.y2);
    x.lineTo(b.x1, b.y1);
    x.closePath();
    x.fill();
    x.globalAlpha = al * 0.9;
    x.strokeStyle = "#fff";
    x.lineWidth = f.lw;
    x.beginPath();
    x.moveTo(a.x2, a.y2);
    x.lineTo(b.x2, b.y2);
    x.stroke();
  }
  x.restore();
}
