/* ======================================================================
 * src/js/render/finale.js
 * Final de la expedición (piso 10, primera vez, fuera del modo difícil): al caer el último jefe todo se hunde en
 * negro y solo queda el protagonista, con zoom y sin HUD. Puede moverse, pero lento. Unas manos se asoman por el
 * borde superior de la pantalla, primero agarrándose a él y luego acercándose a rastras; mientras tanto una Parca
 * (pixel art) lo observa y camina hacia él. Cuando lo alcanza le asesta un guadañazo que le quita el 100 % de la
 * vida; las manos lo agarran y se lo llevan. Después aparece la pantalla de estadísticas (die(0, 1)).
 *
 * Es la entrada al modo difícil: bossDie() lo activa (S.hard) y arma el contador G.finWait.
 *
 * Define:
 * FIN_RP, FIN_SC, finSprites, finStart, finTick, drawFinale, finEnd
 * ====================================================================== */

// Sprites pixel art de la Parca (30×40) y de su guadaña (28×50). Paleta: ver FIN_PAL.
const FIN_RP = [
  "..............dhd.............",
  "...........hhdhdddk...........",
  ".........hhhdddddddkk.........",
  "........hhhdddddddddkk........",
  ".......hhhddddddddddkkk.......",
  ".......hhdddddxxdddddkk.......",
  "......hhddddxxxxxxddddkk......",
  "......hhdddxxbbbbxxdddkk......",
  "......hdddxxbbbbbbxxdddk......",
  "......ddddxbbbbbbbsxdddk......",
  "......dddxxxxxbbbxxxxddk......",
  "......dddxbxxxbbbxxxxddk......",
  "......dddxbxrxbbbxrxxddd......",
  "......dddxxxxxbbbxxxxddd......",
  ".......ddxxsbbbxbbssxdd.......",
  ".......dddxbbbxxxbsxddd.......",
  "........ddkxbbbbbbsxkd........",
  ".....kkkkkkxbxbxbxbdkkkkkk....",
  ".....kkkkkkdbbbbbssckkkkkk....",
  ".....kkkkkkcccxxcccckkkkkd....",
  "....kdkkkkkccccccccckkkdddk...",
  "....kdddddcccccccccccdddddk...",
  "....kddddddccccdccccddddddd...",
  "....dddddddccccdccccddddddd...",
  "....dddddddccccdccccddddddd...",
  "....dddddgggggggggggggddddd...",
  "....dddddcdccccgccccdcdddddd..",
  "...ddddddcdccccgccccdcbbbbbd..",
  "...ddddddcdcccbbbcccdcbbbbbk..",
  "...hbbbbdcdccccsccccdcbbsbbk..",
  "...bbbbbccdccccdccccdcccckkk..",
  "...dbbbcccdccccdccccdcccckkk..",
  "...dssscccdccccdccccdcccckkk..",
  "...ddcccccdccccdccccdcccckkk..",
  "...ddcccccdccccdccccdcccckkk..",
  "..ddccccccdccccdccccdccccckkk.",
  "..dd..cc.cd..cc.cc..dc.ck..kk.",
  "....d..dc..c..cd..c..ck..k..k.",
  "..c..c...c..c...c..c...c..c.c.",
  ".............................."
];
const FIN_SC = [
  "............................",
  "............................",
  "................W...........",
  ".........WWWWWWWSW..........",
  "........WSSSSSSSSSWW........",
  ".......WSSSSSSSSSSSSW.......",
  "......WSSSSSSSSSSSSSSWW.....",
  ".....WSSSSSSSSSSSSSSSSS.....",
  "....WSSSSSSSSTTTTTTTTSSv....",
  "....SSSSSSSTT........SSS....",
  "...WSSSSSST..........vvS....",
  "...SSSSSTT...........wwv....",
  "..WSSSST.............wwv....",
  "..SSSST..............wwv....",
  ".WSSST...............wwv....",
  ".SSSST...............wwv....",
  ".SSST................vvv....",
  ".SST.................wwv....",
  ".ST..................wwv....",
  ".ST..................wwv....",
  "WT...................wwv....",
  "ST...................wwv....",
  "T....................vvv....",
  "T....................wwv....",
  ".....................wwv....",
  ".....................wwv....",
  ".....................wwv....",
  ".....................wwv....",
  ".....................vvv....",
  ".....................wwv....",
  ".....................wwv....",
  ".....................wwv....",
  ".....................wwv....",
  ".....................wwv....",
  ".....................vvv....",
  ".....................wwv....",
  ".....................wwv....",
  ".....................wwv....",
  ".....................wwv....",
  ".....................wwv....",
  ".....................vvv....",
  ".....................wwv....",
  ".....................wwv....",
  ".....................wwv....",
  ".....................wwv....",
  ".....................wwv....",
  ".....................vvv....",
  ".....................wwv....",
  ".....................wwv....",
  ".....................wwv...."
];
const FIN_PAL = {
  k: "#0c0914", d: "#181226", c: "#251c3a", h: "#3a2d5c", b: "#e9e3cc", s: "#b9b199", x: "#020105", r: "#ff3030", g: "#6b6b78", // Parca
  w: "#58422f", v: "#3c2c20", S: "#bec6d8", W: "#f5f8ff", T: "#6e768c", // guadaña
};
let FIN_SPR = null;
function finSprites() {
  if (FIN_SPR) return FIN_SPR;
  const mk = (rows) => {
    const c = document.createElement("canvas");
    c.width = rows[0].length;
    c.height = rows.length;
    const g = c.getContext("2d");
    rows.forEach((r, y) => {
      for (let i = 0; i < r.length; i++)
        if (r[i] != ".") {
          g.fillStyle = FIN_PAL[r[i]] || "#f0f";
          g.fillRect(i, y, 1, 1);
        }
    });
    return c;
  };
  return (FIN_SPR = { rp: mk(FIN_RP), sc: mk(FIN_SC) });
}

const finEase = (p) => (p <= 0 ? 0 : p >= 1 ? 1 : p * p * (3 - 2 * p));
const FIN_HX = [0.22, 0.74, 0.42, 0.6, 0.12, 0.86, 0.5, 0.32]; // dónde se agarra cada mano (fracción del ancho)
const FIN_HT = [4.6, 5.4, 8.0, 8.9, 11.6, 12.4, 15.2, 16.0]; // cuándo se asoma cada mano (s)

function finStart() {
  if (G.st != "play" || G.fin) return;
  hide();
  G.finWait = 0;
  const side = Math.random() < 0.5 ? -1 : 1;
  G.fin = {
    t: 0,
    x0: P.x,
    y0: P.y,
    cam: { x: P.x, y: P.y, z: 1 },
    side,
    hands: FIN_HT.map((t0, i) => ({ t0, gx: W * FIN_HX[i], sz: 58 + ((i * 7) % 5) * 4, p: 0, ph: i * 1.7, ang: (i / FIN_HT.length) * 6.283, gr: 0 })),
    rp: { x: P.x + side * 205, y: P.y + 40, al: 0, st: 0, ts: 0, sw: -0.14, d: 999 },
    hit: 0,
    th: 0,
    hb: 0,
    lastBeat: 0,
    sh: 0,
    ps: { x: W / 2, y: H / 2 },
  };
  E = [];
  PR = [];
  Z = [];
  FX = [];
  NM = [];
  BHZ = [];
  O = RM_.O = [];
  G.dk = 0;
  P.inv = P.dr = P.sh = 0;
  P.dash = null;
  P.g = 0;
  P.vx = P.vy = 0;
  shake = 0;
  snd(46, 3.2, "sine", 0.07);
  snd(61, 3.6, "triangle", 0.04);
}

// Posición en pantalla de un punto del mundo con la cámara del final
function finSc(F, wx, wy) {
  return { x: (wx - F.cam.x) * F.cam.z + W / 2, y: (wy - F.cam.y) * F.cam.z + H / 2 };
}

function finTick(dt) {
  const F = G.fin;
  F.t += dt;
  const t = F.t,
    C = F.cam;
  C.z = 1 + 1.65 * finEase(t / 3.4);
  C.x += (P.x - C.x) * Math.min(1, dt * 1.4);
  C.y += (P.y - C.y) * Math.min(1, dt * 1.4);
  // --- el protagonista: movimiento lento dentro de un círculo ---
  const can = t > 1 && !F.hit,
    ix = (K[KY.right] ? 1 : 0) - (K[KY.left] ? 1 : 0),
    iy = (K[KY.down] ? 1 : 0) - (K[KY.up] ? 1 : 0),
    il = Math.hypot(ix, iy) || 1,
    sp = can ? 50 : 0,
    k = Math.min(1, dt * 8);
  P.vx += ((ix / il) * sp - P.vx) * k;
  P.vy += ((iy / il) * sp - P.vy) * k;
  P.x += P.vx * dt;
  P.y += P.vy * dt;
  const dx = P.x - F.x0,
    dy = P.y - F.y0,
    dd = Math.hypot(dx, dy);
  if (dd > 140) {
    P.x = F.x0 + (dx / dd) * 140;
    P.y = F.y0 + (dy / dd) * 140;
  }
  const ps = (F.ps = finSc(F, P.x, P.y));
  if (!F.hit) P.face = Math.atan2(M.y - ps.y, M.x - ps.x);
  // --- latido que se acelera al acercarse la Parca ---
  const R = F.rp,
    near = cl(1 - (R.d - 60) / 220, 0, 1);
  if (t > 3 && t - F.lastBeat > 1.25 - near * 0.7 && !F.hit) {
    F.lastBeat = t;
    snd(54, 0.16, "sine", 0.09);
    setTimeout(() => snd(48, 0.2, "sine", 0.07), 160);
  }
  // --- manos ---
  for (const h of F.hands) {
    if (F.hb && h.t0 > t) h.t0 = t; // al rematarlo todas acuden de golpe
    if (t < h.t0) continue;
    if (!h.snd) {
      h.snd = 1;
      snd(70 + Math.random() * 20, 0.25, "sawtooth", 0.035);
    }
    const reach = t - h.t0 - 2.4;
    if (F.hb) h.p = Math.min(1, h.p + dt * 0.9);
    else if (reach > 0 && h.p < 0.8) h.p = Math.min(0.8, h.p + dt * (0.03 + 0.12 * Math.pow(Math.max(0, Math.sin(t * 2.1 + h.ph)), 2)));
  }
  // --- la Parca ---
  R.al = cl((t - 8.2) / 3.4, 0, 1);
  R.d = Math.hypot(P.x - R.x, P.y - R.y);
  R.fl = P.x < R.x ? -1 : 1; // hacia dónde mira (-1 = mira a la izquierda)
  if (R.st == 0) {
    if (t > 10 && R.d > 62) {
      const s = 9 + (t - 10) * 0.7 + (t > 27 ? 30 : 0),
        a = Math.atan2(P.y - R.y, P.x - R.x);
      R.x += Math.cos(a) * s * dt;
      R.y += Math.sin(a) * s * dt;
    }
    if ((R.d <= 70 && t > 14) || t > 38) {
      R.st = 1; // preparar el golpe
      R.ts = t;
      snd(90, 1.1, "sawtooth", 0.05);
    }
    R.sw += (-0.14 + Math.sin(t * 1.3) * 0.03 - R.sw) * Math.min(1, dt * 4);
  } else if (R.st == 1) {
    // levanta la guadaña
    const p = finEase((t - R.ts) / 1.15);
    R.sw = -0.14 + (-1.45 + 0.14) * p;
    if (t - R.ts > 1.15) {
      R.st = 2;
      R.ts = t;
      snd(420, 0.18, "sawtooth", 0.08);
    }
  } else if (R.st == 2) {
    // guadañazo
    const p = (t - R.ts) / 0.26;
    R.sw = -1.45 + 2.9 * finEase(p);
    if (p >= 0.62 && !F.hit) {
      F.hit = 1;
      F.th = t;
      P.hp = 0;
      F.sh = 1;
      snd(120, 0.6, "sawtooth", 0.12);
      snd(60, 0.9, "square", 0.1);
      snd(900, 0.12, "triangle", 0.08);
    }
    if (p >= 1) R.st = 3;
  } else {
    R.sw += (0.5 - R.sw) * Math.min(1, dt * 2);
  }
  // --- tras el golpe: caída, manos y arrastre ---
  if (F.hit) {
    P.vx = P.vy = 0;
    F.sh = Math.max(0, F.sh - dt * 1.4);
    if (!F.hb && t - F.th > 1.3) {
      F.hb = 1;
      F.tb = t;
      snd(75, 1.4, "sawtooth", 0.06);
    }
    if (F.hb && t - F.tb > 1.5) F.hl = Math.min(1, (F.hl || 0) + dt / 3.2); // arrastre hacia arriba
    if (F.hl >= 1 && !F.te) F.te = t;
    if (F.te && t - F.te > 1.6) finEnd();
  }
}

function drawFinale() {
  const F = G.fin,
    t = F.t,
    C = F.cam,
    z = C.z,
    R = F.rp,
    dark = finEase(t / 2.2),
    ps = F.ps,
    hl = finEase(F.hl || 0),
    sy = ps.y - hl * (ps.y + 170); // la altura del protagonista en pantalla (sube al ser arrastrado)
  x.save();
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.globalAlpha = 1;
  x.fillStyle = "#000";
  x.fillRect(0, 0, W, H);
  // 1) mientras se oscurece: la sala (sin el protagonista) con el zoom, y el HUD
  if (dark < 1) {
    x.save();
    x.setTransform(z, 0, 0, z, W / 2 - C.x * z, H / 2 - C.y * z);
    drawWorld(true);
    x.restore();
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.globalAlpha = 1;
    hud();
    x.fillStyle = `rgba(0,0,0,${dark})`;
    x.fillRect(0, 0, W, H);
  }
  // 2) un halo muy tenue alrededor del protagonista
  if (dark > 0.5) {
    const g = x.createRadialGradient(ps.x, sy, 10, ps.x, sy, 230 + Math.sin(t * 1.7) * 8);
    g.addColorStop(0, `rgba(150,140,190,${0.16 * dark})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);
  }
  // 3) la Parca
  if (R.al > 0) drawReaper(F, R, z, t);
  // 4) el protagonista (con el zoom; se desploma tras el golpe)
  {
    const sx0 = F.sh * (Math.random() - 0.5) * 14,
      sy0 = F.sh * (Math.random() - 0.5) * 14,
      fall = F.hit ? finEase((t - F.th) / 0.9) : 0;
    x.save();
    x.setTransform(z, 0, 0, z, W / 2 - C.x * z + sx0, H / 2 - C.y * z + (sy - ps.y) + sy0);
    x.translate(P.x, P.y);
    x.rotate(fall * 1.45 + (F.hb ? Math.sin(t * 7) * 0.05 * (1 - hl) : 0));
    x.translate(-P.x, -P.y);
    x.globalAlpha = 1 - fall * 0.25;
    const sf = P.face,
      si = P.inv,
      sfl = P.fl,
      sat = P.at;
    P.inv = 0;
    P.fl = F.hit && t - F.th < 0.18 ? 1 : 0;
    P.at = 0;
    safe(drawP);
    P.face = sf;
    P.inv = si;
    P.fl = sfl;
    P.at = sat;
    x.restore();
  }
  // 5) las manos
  for (const h of F.hands) {
    if (t < h.t0) continue;
    const ap = finEase((t - h.t0) / 1.1); // se asoma por el borde
    const px = ps.x,
      py = sy;
    let tx, ty;
    if (F.hb) {
      tx = px + Math.cos(h.ang) * 62;
      ty = py + Math.sin(h.ang) * 52;
    } else {
      tx = px + (h.gx / W - 0.5) * 460; // se reparten en abanico sobre él sin taparlo
      ty = py - 165 - (h.ph % 3) * 14;
    }
    const e = finEase(h.p / 0.8),
      gy = 4;
    let dxp = F.hb ? tx : h.gx + (tx - h.gx) * e * 0.8,
      dyp = F.hb ? ty : gy + (ty - gy) * e * 0.8;
    dyp = dyp * ap - 80 * (1 - ap);
    if (h.hx === undefined) {
      h.hx = dxp;
      h.hy = dyp;
    }
    const kk = F.hb ? (F.hl ? 0.3 : 0.12) : 1; // tras el golpe se lanzan hacia él con suavidad
    h.hx += (dxp - h.hx) * kk;
    h.hy += (dyp - h.hy) * kk;
    const hx = h.hx + Math.sin(t * 3 + h.ph) * 1.5,
      hy = h.hy + Math.sin(t * 2.4 + h.ph) * 2;
    const ox = h.gx + (hx - h.gx) * 0.4,
      oy = -100,
      ang = Math.atan2(hy - oy, hx - ox),
      grip = F.hb ? Math.min(1, h.p * 1.3) : h.p < 0.01 ? 0.88 : 0.35 + 0.2 * Math.sin(t * 3 + h.ph) + h.p * 0.35, // agarrada al borde → abierta al avanzar
      L = Math.hypot(hx - ox, hy - oy) + 12;
    drawHand(hx, hy, ang, h.sz, grip, Math.min(1, ap * 1.6), L);
  }
  // 6) destello y número del golpe
  if (F.hit) {
    const q = t - F.th;
    if (q < 0.35) {
      x.fillStyle = `rgba(255,255,255,${0.75 * (1 - q / 0.35)})`;
      x.fillRect(0, 0, W, H);
    }
    if (q < 2.2) {
      x.globalAlpha = Math.min(1, (2.2 - q) / 1.2);
      x.fillStyle = "#ff3a3a";
      x.strokeStyle = "#000";
      x.lineWidth = 5;
      x.font = "bold 46px Georgia";
      x.textAlign = "center";
      x.strokeText("-100%", ps.x, ps.y - 70 - q * 26);
      x.fillText("-100%", ps.x, ps.y - 70 - q * 26);
      x.globalAlpha = 1;
    }
    const g = x.createRadialGradient(W / 2, H / 2, 180, W / 2, H / 2, 560);
    g.addColorStop(0, "rgba(120,0,0,0)");
    g.addColorStop(1, `rgba(120,0,0,${0.5 * Math.max(0, 1 - (t - F.th) / 3)})`);
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);
  }
  // 7) fundido final a negro
  if (F.hl >= 1) {
    x.fillStyle = `rgba(0,0,0,${finEase((t - (F.te || t)) / 1.2)})`;
    x.fillRect(0, 0, W, H);
  }
  x.restore();
}

// La Parca: sprite escalado sin suavizado (2 px de mundo por píxel de sprite) + guadaña que gira sobre su mano
function drawReaper(F, R, z, t) {
  const S = finSprites(),
    ps = z * 2,
    sc = finSc(F, R.x, R.y),
    bob = Math.sin(t * 1.6) * 2.2 * z,
    fl = R.fl || -1;
  x.save();
  x.imageSmoothingEnabled = false;
  x.globalAlpha = R.al;
  x.translate(sc.x, sc.y + bob);
  x.scale(-fl, 1); // el sprite mira al frente: se refleja según de qué lado esté el protagonista
  // la guadaña va detrás del cuerpo
  x.save();
  x.translate((23 - 15) * ps, (28 - 40) * ps);
  x.rotate(R.sw);
  x.drawImage(S.sc, -22 * ps, -42 * ps, 28 * ps, 50 * ps);
  x.restore();
  x.drawImage(S.rp, -15 * ps, -40 * ps, 30 * ps, 40 * ps);
  // ojos: brillo rojo que se intensifica al acercarse
  const gl = (0.5 + 0.5 * R.al) * (0.7 + 0.3 * Math.sin(t * 5)) * (R.st ? 1.5 : 1);
  x.globalCompositeOperation = "lighter";
  for (const ex of [12.5, 18.5]) {
    const g = x.createRadialGradient((ex - 15) * ps, (12.5 - 40) * ps, 0, (ex - 15) * ps, (12.5 - 40) * ps, ps * 5);
    g.addColorStop(0, `rgba(255,60,40,${0.7 * gl})`);
    g.addColorStop(1, "rgba(255,0,0,0)");
    x.fillStyle = g;
    x.fillRect((ex - 15) * ps - ps * 5, (12.5 - 40) * ps - ps * 5, ps * 10, ps * 10);
  }
  x.restore();
}

// Fin de la escena: la expedición termina y se muestran las estadísticas
function finEnd() {
  if (!G.fin) return;
  G.fin = null;
  die(0, 1);
}
