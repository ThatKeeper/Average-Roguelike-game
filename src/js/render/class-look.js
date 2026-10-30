/* ======================================================================
 * src/js/render/class-look.js
 * Aspecto único de cada clase nueva (cuerpo del héroe visto desde arriba) y dibujo de las zonas
 * de habilidad (lluvia, sello, nube, danza) y trampas.
 *
 * drawHeroBody (draw-entities.js) llama a drawClassBody cuando la clase tiene aspecto propio.
 *
 * Define:
 * LKP, CLOOK, drawClassBody, drawFZ, drawTR
 * ====================================================================== */

// Todos los dibujos usan el sistema de coordenadas del héroe: origen en el cuerpo, `a` = ángulo de mirada,
// `r` = radio. `fl` = parpadeo de daño (todo blanco). `t` = reloj para animaciones.
const LKP = (fl, c) => (fl ? "#fff" : c);
function lkCape(c, a, r, mv, col, len, wid, split) {
  const bx = -Math.cos(a),
    by = -Math.sin(a),
    px = -Math.sin(a),
    py = Math.cos(a),
    L = len + mv * 9;
  c.fillStyle = col;
  c.beginPath();
  c.moveTo(bx * 6, by * 6 - 8);
  c.lineTo(bx * L + px * wid, by * L + py * wid);
  c.lineTo(bx * L - px * wid, by * L - py * wid);
  c.closePath();
  c.fill();
}
const CLOOK = {
  // Tanque: armadura de acero con hombreras redondas, yelmo con cresta y visera
  tank(c, a, r, mv, fl, t) {
    lkCape(c, a, r, mv, LKP(fl, "#2c3b5a"), 17, 9);
    c.strokeStyle = "#000";
    c.lineWidth = 2;
    c.fillStyle = LKP(fl, "#8a9bb8");
    c.beginPath();
    c.arc(0, 0, r * 1.08, 0, 7);
    c.fill();
    c.stroke();
    c.save();
    c.rotate(a);
    // hombreras
    for (const sy of [-1, 1]) {
      c.fillStyle = LKP(fl, "#46556f");
      c.beginPath();
      c.arc(-r * 0.05, sy * r * 0.95, r * 0.5, 0, 7);
      c.fill();
      c.stroke();
      c.fillStyle = LKP(fl, "#e0b84a");
      c.beginPath();
      c.arc(-r * 0.05, sy * r * 0.95, r * 0.16, 0, 7);
      c.fill();
    }
    // yelmo y cresta
    c.fillStyle = LKP(fl, "#b6c4dc");
    c.beginPath();
    c.arc(r * 0.05, 0, r * 0.62, 0, 7);
    c.fill();
    c.stroke();
    c.fillStyle = LKP(fl, "#c0392b");
    c.fillRect(-r * 0.6, -r * 0.13, r * 1.2, r * 0.26);
    c.fillStyle = "#000";
    c.fillRect(r * 0.22, -r * 0.34, r * 0.34, r * 0.1);
    c.fillRect(r * 0.22, r * 0.24, r * 0.34, r * 0.1);
    c.restore();
  },
  // Asesino: capucha puntiaguda, bufanda roja larga y ojos brillantes
  assa(c, a, r, mv, fl, t) {
    const bx = -Math.cos(a),
      by = -Math.sin(a),
      px = -Math.sin(a),
      py = Math.cos(a),
      w = Math.sin(t * 9) * 2 * mv;
    c.fillStyle = LKP(fl, "#e0405a");
    for (const s of [-1, 1]) {
      c.beginPath();
      c.moveTo(bx * 4 + px * s * 3, by * 4 + py * s * 3);
      c.quadraticCurveTo(bx * (16 + mv * 8) + px * (s * 7 + w), by * (16 + mv * 8) + py * (s * 7 + w), bx * (28 + mv * 12) + px * (s * 3 - w), by * (28 + mv * 12) + py * (s * 3 - w));
      c.lineTo(bx * (24 + mv * 12) + px * s * 6, by * (24 + mv * 12) + py * s * 6);
      c.closePath();
      c.fill();
    }
    c.strokeStyle = "#000";
    c.lineWidth = 2;
    c.fillStyle = LKP(fl, "#3b2f5a");
    c.beginPath();
    c.arc(0, 0, r, 0, 7);
    c.fill();
    c.stroke();
    c.save();
    c.rotate(a);
    c.fillStyle = LKP(fl, "#1f1636");
    c.beginPath();
    c.moveTo(-r * 1.55, 0);
    c.lineTo(-r * 0.2, -r * 0.8);
    c.lineTo(r * 0.55, 0);
    c.lineTo(-r * 0.2, r * 0.8);
    c.closePath();
    c.fill();
    c.stroke();
    c.fillStyle = fl ? "#fff" : "#ff3050";
    c.fillRect(r * 0.18, -r * 0.34, r * 0.28, r * 0.16);
    c.fillRect(r * 0.18, r * 0.18, r * 0.28, r * 0.16);
    c.restore();
  },
  // Ballestero: sombrero de ala ancha, carcaj con flechas a la espalda, capa corta de cuero
  xbow(c, a, r, mv, fl, t) {
    lkCape(c, a, r, mv, LKP(fl, "#5d4528"), 14, 8);
    c.save();
    c.rotate(a);
    c.fillStyle = LKP(fl, "#4a3420");
    c.strokeStyle = "#000";
    c.lineWidth = 1.5;
    c.save();
    c.rotate(0.35);
    c.fillRect(-r * 1.45, -r * 0.3, r * 0.95, r * 0.6);
    c.strokeRect(-r * 1.45, -r * 0.3, r * 0.95, r * 0.6);
    c.fillStyle = LKP(fl, "#e8d8a8");
    for (let i = -1; i <= 1; i++) c.fillRect(-r * 1.62, i * r * 0.18 - 1, r * 0.2, 2);
    c.restore();
    c.restore();
    c.strokeStyle = "#000";
    c.lineWidth = 2;
    c.fillStyle = LKP(fl, "#b08a58");
    c.beginPath();
    c.arc(0, 0, r, 0, 7);
    c.fill();
    c.stroke();
    c.save();
    c.rotate(a);
    c.fillStyle = LKP(fl, "#6e5030");
    c.beginPath();
    c.ellipse(0, 0, r * 1.3, r * 1.05, 0, 0, 7); // ala del sombrero
    c.fill();
    c.stroke();
    c.fillStyle = LKP(fl, "#8a6a40");
    c.beginPath();
    c.arc(-r * 0.05, 0, r * 0.6, 0, 7);
    c.fill();
    c.fillStyle = LKP(fl, "#d9a441");
    c.fillRect(-r * 0.62, -r * 0.12, r * 1.2, r * 0.24);
    c.restore();
  },
  // Disparador rúnico: gafas de lente, mochila rúnica y runas orbitando
  rune(c, a, r, mv, fl, t) {
    lkCape(c, a, r, mv, LKP(fl, "#1c5a6b"), 15, 8);
    c.save();
    c.rotate(a);
    c.fillStyle = LKP(fl, "#0f3a46");
    c.strokeStyle = "#000";
    c.lineWidth = 1.5;
    c.beginPath();
    for (let i = 0; i < 6; i++) c.lineTo(-r * 1.1 + Math.cos(i * 1.047) * r * 0.55, Math.sin(i * 1.047) * r * 0.55);
    c.closePath();
    c.fill();
    c.stroke();
    c.fillStyle = LKP(fl, "#8ff4ff");
    c.beginPath();
    c.arc(-r * 1.1, 0, r * 0.2, 0, 7);
    c.fill();
    c.restore();
    c.strokeStyle = "#000";
    c.lineWidth = 2;
    c.fillStyle = LKP(fl, "#3fb7c9");
    c.beginPath();
    c.arc(0, 0, r, 0, 7);
    c.fill();
    c.stroke();
    c.save();
    c.rotate(a);
    for (const s of [-1, 1]) {
      c.fillStyle = LKP(fl, "#0f3a46");
      c.beginPath();
      c.arc(r * 0.42, s * r * 0.34, r * 0.3, 0, 7);
      c.fill();
      c.stroke();
      c.fillStyle = LKP(fl, "#8ff4ff");
      c.beginPath();
      c.arc(r * 0.46, s * r * 0.34, r * 0.16, 0, 7);
      c.fill();
    }
    c.restore();
    // runas orbitantes
    c.fillStyle = LKP(fl, "#8ff4ff");
    for (let i = 0; i < 3; i++) {
      const q = t * 2.4 + i * 2.094;
      c.save();
      c.translate(Math.cos(q) * r * 1.7, Math.sin(q) * r * 1.7);
      c.rotate(q * 2);
      c.fillRect(-2.2, -2.2, 4.4, 4.4);
      c.restore();
    }
  },
  // Mago de fuego y hielo: cuerpo partido en dos mitades, sombrero bicolor y llama y cristal flotando
  fimg(c, a, r, mv, fl, t) {
    const bx = -Math.cos(a),
      by = -Math.sin(a),
      px = -Math.sin(a),
      py = Math.cos(a),
      L = 20 + mv * 9;
    for (const [s, col] of [[1, "#c4522a"], [-1, "#2f7aa0"]]) {
      c.fillStyle = LKP(fl, col);
      c.beginPath();
      c.moveTo(bx * 6, by * 6 - 8);
      c.lineTo(bx * L + px * s * 9, by * L + py * s * 9);
      c.lineTo(bx * L, by * L);
      c.closePath();
      c.fill();
    }
    c.strokeStyle = "#000";
    c.lineWidth = 2;
    c.save();
    c.rotate(a);
    c.fillStyle = LKP(fl, "#ff8a4a");
    c.beginPath();
    c.arc(0, 0, r, -Math.PI / 2, Math.PI / 2);
    c.closePath();
    c.fill();
    c.fillStyle = LKP(fl, "#7fd0ff");
    c.beginPath();
    c.arc(0, 0, r, Math.PI / 2, (3 * Math.PI) / 2);
    c.closePath();
    c.fill();
    c.beginPath();
    c.arc(0, 0, r, 0, 7);
    c.stroke();
    c.restore();
    // sombrero puntiagudo bicolor
    c.save();
    c.rotate(-a);
    for (const [s, col] of [[1, "#a63a1a"], [-1, "#2a6a90"]]) {
      c.fillStyle = LKP(fl, col);
      c.beginPath();
      c.moveTo(0, -r * 2.2);
      c.lineTo(s * r * 0.85, -r * 0.55);
      c.lineTo(0, -r * 0.45);
      c.closePath();
      c.fill();
    }
    c.beginPath();
    c.moveTo(-r * 0.85, -r * 0.55);
    c.lineTo(0, -r * 2.2);
    c.lineTo(r * 0.85, -r * 0.55);
    c.closePath();
    c.stroke();
    c.restore();
    // llama y cristal de hielo orbitando
    const q = t * 2.2;
    c.fillStyle = LKP(fl, "#ffb347");
    c.beginPath();
    c.arc(Math.cos(q) * r * 1.8, Math.sin(q) * r * 1.8, 3.4 + Math.sin(t * 14) * 0.7, 0, 7);
    c.fill();
    c.fillStyle = LKP(fl, "#cfF4ff");
    c.save();
    c.translate(Math.cos(q + Math.PI) * r * 1.8, Math.sin(q + Math.PI) * r * 1.8);
    c.rotate(q);
    c.beginPath();
    c.moveTo(0, -4.4);
    c.lineTo(3, 0);
    c.lineTo(0, 4.4);
    c.lineTo(-3, 0);
    c.closePath();
    c.fill();
    c.restore();
    c.fillStyle = "#fff";
    c.beginPath();
    c.arc(Math.cos(a) * r * 0.45, Math.sin(a) * r * 0.45, 2.2, 0, 7);
    c.fill();
  },
  // Alquimista: máscara de pico, sombrero, mochila con frasco burbujeante y vapor verde
  alch(c, a, r, mv, fl, t) {
    const bx = -Math.cos(a),
      by = -Math.sin(a),
      px = -Math.sin(a),
      py = Math.cos(a);
    // vapor
    c.fillStyle = "#8fe06a";
    for (let i = 0; i < 3; i++) {
      const u = (t * 0.9 + i / 3) % 1;
      c.globalAlpha *= 0.45 * (1 - u);
      c.beginPath();
      c.arc(bx * (12 + u * 20) + px * Math.sin(t * 3 + i) * 5, by * (12 + u * 20) + py * Math.sin(t * 3 + i) * 5, 2 + u * 3, 0, 7);
      c.fill();
      c.globalAlpha = 1;
    }
    lkCape(c, a, r, mv, LKP(fl, "#3d5a2a"), 15, 9);
    c.save();
    c.rotate(a);
    c.fillStyle = LKP(fl, "#5a4a30");
    c.strokeStyle = "#000";
    c.lineWidth = 1.5;
    c.beginPath();
    c.arc(-r * 1.1, 0, r * 0.62, 0, 7);
    c.fill();
    c.stroke();
    c.fillStyle = LKP(fl, "#7ee050");
    c.beginPath();
    c.arc(-r * 1.1, 0, r * 0.42, 0, 7);
    c.fill();
    c.fillStyle = "#e8ffd0";
    c.beginPath();
    c.arc(-r * 1.1 + Math.sin(t * 5) * 2, Math.cos(t * 4) * 2, 1.6, 0, 7);
    c.fill();
    c.restore();
    c.strokeStyle = "#000";
    c.lineWidth = 2;
    c.fillStyle = LKP(fl, "#8fb85a");
    c.beginPath();
    c.arc(0, 0, r, 0, 7);
    c.fill();
    c.stroke();
    c.save();
    c.rotate(a);
    c.fillStyle = LKP(fl, "#4a5a2a");
    c.beginPath();
    c.ellipse(-r * 0.1, 0, r * 1.1, r * 0.95, 0, 0, 7); // ala del sombrero
    c.fill();
    c.stroke();
    c.fillStyle = LKP(fl, "#e8e0c0"); // pico de la máscara
    c.beginPath();
    c.moveTo(r * 0.2, -r * 0.34);
    c.lineTo(r * 1.35, 0);
    c.lineTo(r * 0.2, r * 0.34);
    c.closePath();
    c.fill();
    c.stroke();
    c.fillStyle = "#1a1a10";
    c.beginPath();
    c.arc(r * 0.2, -r * 0.3, r * 0.17, 0, 7);
    c.arc(r * 0.2, r * 0.3, r * 0.17, 0, 7);
    c.fill();
    c.restore();
  },
};
// Devuelve true si la clase tiene aspecto propio y lo ha dibujado.
function drawClassBody(c, ck, a, r, mv, fl) {
  const f = CLOOK[ck];
  if (!f) return false;
  f(c, a, r, mv, fl, Date.now() / 1000);
  return true;
}

// ---- zonas y trampas de clase (se dibujan bajo los enemigos) ----
function drawFZ(z) {
  const a = z.t / (z.m || 1),
    t = Date.now() / 1000;
  x.save();
  x.globalAlpha = 0.16 + 0.1 * Math.sin(t * 6);
  x.fillStyle = z.c;
  x.beginPath();
  x.arc(z.x, z.y, z.r, 0, 7);
  x.fill();
  x.globalAlpha = 0.7;
  x.strokeStyle = z.c;
  x.lineWidth = 2;
  x.setLineDash([8, 6]);
  x.lineDashOffset = -t * 20;
  x.beginPath();
  x.arc(z.x, z.y, z.r, 0, 7);
  x.stroke();
  x.setLineDash([]);
  if (z.k == "seal") {
    x.translate(z.x, z.y);
    x.rotate(t * 0.8);
    x.globalAlpha = 0.65;
    for (const off of [0, Math.PI / 3]) {
      x.beginPath();
      for (let i = 0; i < 3; i++) x.lineTo(Math.cos(off + i * 2.094 - 1.57) * z.r * 0.78, Math.sin(off + i * 2.094 - 1.57) * z.r * 0.78);
      x.closePath();
      x.stroke();
    }
  } else if (z.k == "cloud") {
    x.globalAlpha = 0.28;
    for (let i = 0; i < 7; i++) {
      const q = t * 0.6 + i * 0.9;
      x.beginPath();
      x.arc(z.x + Math.cos(q) * z.r * 0.55, z.y + Math.sin(q * 1.3) * z.r * 0.55, z.r * 0.28, 0, 7);
      x.fill();
    }
  } else if (z.k == "dance") {
    x.translate(z.x, z.y);
    x.rotate(t * 14);
    x.globalAlpha = 0.9;
    x.strokeStyle = "#fff";
    x.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      x.rotate(1.571);
      x.beginPath();
      x.moveTo(z.r * 0.25, 0);
      x.lineTo(z.r * 0.95, 0);
      x.stroke();
    }
  }
  x.restore();
  // tiempo restante
  x.save();
  x.strokeStyle = "#fff";
  x.globalAlpha = 0.5;
  x.lineWidth = 3;
  x.beginPath();
  x.arc(z.x, z.y, z.r + 5, -1.57, -1.57 + 6.283 * a);
  x.stroke();
  x.restore();
}
function drawTR(t) {
  const arm = t.arm > 0;
  x.save();
  x.globalAlpha = arm ? 0.4 : 0.9;
  x.strokeStyle = t.c || "#9fe8ff";
  x.lineWidth = 2;
  x.beginPath();
  x.arc(t.x, t.y, 14, 0, 7);
  x.stroke();
  x.fillStyle = t.c || "#9fe8ff";
  for (let i = 0; i < 6; i++) {
    const q = i * 1.047;
    x.beginPath();
    x.moveTo(t.x + Math.cos(q - 0.2) * 9, t.y + Math.sin(q - 0.2) * 9);
    x.lineTo(t.x + Math.cos(q) * 18, t.y + Math.sin(q) * 18);
    x.lineTo(t.x + Math.cos(q + 0.2) * 9, t.y + Math.sin(q + 0.2) * 9);
    x.fill();
  }
  x.restore();
}
