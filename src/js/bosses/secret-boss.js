/* ======================================================================
 * src/js/bosses/secret-boss.js
 * Jefe secreto: datos, comportamiento, peligros propios (pétalos, anillo estelar, espadas de luz, líneas),
 * dibujo y cinemática de aparición. No figura en ningún listado (bestiario, arena, estadísticas) hasta
 * haber sido derrotado: usa BDV() en lugar de BD.length.
 *
 * Define:
 * SB, BDV, SBH, sbSpawn, sbIntro, csTick, drawCS, sbhTick, drawSBH, drawSB, sbBarThr
 * ====================================================================== */

const SB = BD.length; // índice del jefe secreto en BD / BO / BDS (siempre el último)
BD.push({ n: "Heliarca, Soberano de los Astros", c: "#ffd86a", r: 34, hp: 3.4, sh: 0 });
BO[SB] = { up: (e, dt, c) => sbUp(e, dt, c) };
BDS[SB] = "Un astro despierto que ejecuta a quien se interpone. Ataques: Astros errantes, Embestida prismática, Danza del sol y Anillo estelar. Al llegar a la mitad de su vida se vuelve invulnerable y desata el Reloj de arena de espadas de luz y las Líneas del alba.";
// Cuántos jefes "existen" de cara al jugador: el secreto solo cuenta una vez derrotado
const BDV = () => BD.length - (S.bosses && S.bosses[SB] ? 0 : 1);
const sbBarThr = (e) => (e.sb ? [0.5] : BOSS_THR);

let SBH = []; // peligros del jefe secreto: pétalos, anillos, espadas, líneas, relojes de arena
const hue = (h, a = 1, l = 62) => `hsla(${((h % 360) + 360) % 360},95%,${l}%,${a})`;
const sbMove = (e, tx, ty, sp, dt) => {
  const d = Math.hypot(tx - e.x, ty - e.y);
  if (d > 2) {
    const k = Math.min(1, (sp * dt) / d);
    e.x += (tx - e.x) * k;
    e.y += (ty - e.y) * k;
  }
  return d;
};
const sbText = (e, t, c = "#ffd86a") => NM.push({ x: e.x, y: e.y - e.r - 28, t, c, l: 1.3 });

function sbSpawn() {
  const b = spawn("boss", 480, 260),
    B = BD[SB];
  b.bi = SB;
  b.nm = B.n;
  b.r = B.r;
  b.sb = 1;
  b.hp = b.mhp *= B.hp * 1.1;
  b.dmg *= 1.3;
  b.al = 1;
  b.sp = 0;
  b.t1 = 2;
  b.x = 480;
  b.y = 260;
  b.app = 1;
  return b;
}

// ======================= peligros =======================
// Estrellas errantes: giran con dificultad, hay que rodearlas con un medio círculo
function sbAstros(e) {
  const n = 6 + (Math.random() < 0.5 ? 1 : 0),
    a0 = Math.atan2(P.y - e.y, P.x - e.x);
  FX.push({ k: "ring", x: e.x, y: e.y, r: 70, t: 0.4, m: 0.4, c: "#ffd86a" });
  for (let i = 0; i < n; i++) {
    const a = a0 + (i / (n - 1) - 0.5) * 2.1,
      h = i * 52;
    PR.push({
      x: e.x,
      y: e.y,
      vx: Math.cos(a) * 250,
      vy: Math.sin(a) * 250,
      r: 11,
      d: e.dmg * 0.8,
      l: 7,
      f: "e",
      c: hue(h),
      cv: 0,
      hm: 1.25, // giro lento: ~190 px de radio de curva
      dr: (p) => drawAstro(p, h),
    });
  }
  snd(520, 0.3, "triangle", 0.05);
}
function drawAstro(p, h) {
  const t = Date.now() / 1000,
    a = Math.atan2(p.vy, p.vx);
  x.save();
  x.translate(p.x, p.y);
  const g = x.createRadialGradient(0, 0, 2, 0, 0, 24);
  g.addColorStop(0, hue(h + t * 90, 0.9, 75));
  g.addColorStop(1, hue(h + t * 90, 0, 60));
  x.fillStyle = g;
  x.beginPath();
  x.arc(0, 0, 24, 0, 7);
  x.fill();
  x.rotate(t * 4 + h);
  x.fillStyle = hue(h + t * 90, 1, 70);
  x.strokeStyle = "#fff";
  x.lineWidth = 1.5;
  x.beginPath();
  for (let i = 0; i < 10; i++) x.lineTo(Math.cos((i * Math.PI) / 5) * (i % 2 ? 6 : 13), Math.sin((i * Math.PI) / 5) * (i % 2 ? 6 : 13));
  x.closePath();
  x.fill();
  x.stroke();
  x.restore();
  // estela corta
  x.strokeStyle = hue(h + t * 90, 0.35, 70);
  x.lineWidth = 6;
  x.beginPath();
  x.moveTo(p.x, p.y);
  x.lineTo(p.x - Math.cos(a) * 30, p.y - Math.sin(a) * 30);
  x.stroke();
}
// Danza del sol: 5 pétalos grandes con forma de estrella que giran sobre el eje del jefe
function sbPetals(e, off, tele, act, dmg) {
  const life = tele + act; // vida total = aviso + tiempo con daño
  for (let i = 0; i < 5; i++)
    SBH.push({ k: "petal", e, a0: e.pa + off + (i * Math.PI * 2) / 5, w0: e.pw, L: 410, w: 64, age: 0, tele, life, d: dmg, h: i * 40 + off * 60 });
}
const sbSun = (e) => {
  e.pa = rnd(0, 6.28);
  e.pw = 0.45 * (Math.random() < 0.5 ? 1 : -1); // giro ligero
  sbPetals(e, 0, 0, 1.9, e.dmg * 1.2); // daño inmediato
  skLaterB(e, 1.0, () => sbPetals(e, Math.PI / 5, 0.9, 1.4, e.dmg * 1.2));
  skLaterB(e, 2.4, () => sbPetals(e, 0, 0.9, 1.4, e.dmg * 1.2));
};
const skLaterB = (e, t, f) => later(e, t, f); // later() es el planificador de los jefes (boss-kits.js)
// Anillo de estrellas con enorme estela multicolor
function sbRing(e) {
  const g0 = rnd(0, 6.28);
  SBH.push({ k: "sring", cx: e.x, cy: e.y, r: 36, v: 135, age: 0, life: 7.6, trail: 96, g0, gw: 0.62, d: e.dmg });
  FX.push({ k: "ring", x: e.x, y: e.y, r: 90, t: 0.5, m: 0.5, c: "#fff" });
  snd(260, 0.6, "sawtooth", 0.06);
  shake = Math.max(shake, 4);
}
// Reloj de arena de espadas de luz centrado en el jugador
function sbHourglass(e, idx) {
  const rots = [Math.PI / 2, 0, Math.PI / 4, -Math.PI / 4, Math.PI / 6],
    ord = [0, 3, 1, 2, 4],
    sw = [],
    H = 125,
    B = 95;
  for (const sg of [-1, 1]) {
    // dos triángulos que se tocan en el centro: bordes y base
    const pts = [];
    for (let i = 1; i <= 4; i++) pts.push([(-B * i) / 4, sg * ((H * i) / 4)], [(B * i) / 4, sg * ((H * i) / 4)]);
    for (let i = -2; i <= 2; i++) pts.push([(B * i) / 2, sg * H]);
    for (const p of pts) if (!sw.some((q) => Math.hypot(q.lx - p[0], q.ly - p[1]) < 14)) sw.push({ lx: p[0], ly: p[1], fired: 0 });
  }
  const o = ord[idx % 5],
    flip = idx % 2 ? -1 : 1,
    key = (s) =>
      o == 0 ? s.ly * flip : o == 1 ? -s.ly * flip : o == 2 ? s.lx * flip : o == 3 ? -s.lx * flip : Math.atan2(s.ly, s.lx) * flip;
  sw.sort((a, b) => key(a) - key(b));
  sw.forEach((s, i) => (s.at = 1.2 + i * 0.035));
  SBH.push({ k: "hg", cx: P.x, cy: P.y, rot: rots[idx % 5], age: 0, sw, d: e.dmg * 0.9 });
  snd(330, 0.5, "triangle", 0.05);
}
// Líneas del alba: siguen un poco al jugador, se fijan y disparan una espada por la línea
function sbLines(e) {
  const n = 14;
  for (let i = 0; i < n; i++)
    later(e, i * 0.15, () => {
      const a = rnd(0, Math.PI),
        s = (Math.random() < 0.5 ? -1 : 1) * (40 + Math.random() * 190);
      SBH.push({
        k: "sline",
        ox: -Math.sin(a) * s,
        oy: Math.cos(a) * s,
        ax: P.x - Math.sin(a) * s,
        ay: P.y + Math.cos(a) * s,
        a,
        age: 0,
        fix: 0.95,
        fired: 0,
        h: i * 27,
        d: e.dmg * 0.9,
      });
      snd(700 + i * 14, 0.05, "square", 0.015);
    });
}
function sbSword(x0, y0, a, sp, d, len = 46) {
  SBH.push({ k: "sword", x: x0, y: y0, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, a, d, len, life: 2.6, h: (a * 57) | 0 });
}

function sbhTick(dt) {
  for (const s of SBH) {
    s.age = (s.age || 0) + dt;
    if (s.k == "petal") {
      if (s.age >= s.tele && s.age < s.life) {
        const e = s.e,
          dx = P.x - e.x,
          dy = P.y - e.y,
          a = s.a0 + s.w0 * s.age + e.pa * 0,
          u = dx * Math.cos(a) + dy * Math.sin(a),
          v = -dx * Math.sin(a) + dy * Math.cos(a),
          hw = u < 0.35 * s.L ? (s.w * u) / (0.35 * s.L) : s.w * (1 - (u - 0.35 * s.L) / (0.65 * s.L));
        if (u > 0 && u < s.L && Math.abs(v) < hw + 4) hurtP(s.d, e);
      }
    } else if (s.k == "sring") {
      s.r += s.v * dt;
      s.v = Math.max(95, s.v - 6 * dt);
      s.g0 += 0.3 * dt;
      const dd = Math.hypot(P.x - s.cx, P.y - s.cy);
      if (dd < s.r + 6 && dd > s.r - s.trail) {
        const a = Math.atan2(P.y - s.cy, P.x - s.cx);
        let gap = false;
        for (const g of [s.g0, s.g0 + Math.PI]) if (Math.abs(nrm(a - g)) < s.gw / 2) gap = true;
        if (!gap) hurtP(s.d);
      }
    } else if (s.k == "hg") {
      // el centro sigue un poco al jugador mientras se forma; luego se fija y dispara
      if (s.age < 0.9) {
        s.cx += (P.x - s.cx) * Math.min(1, dt * 5);
        s.cy += (P.y - s.cy) * Math.min(1, dt * 5);
      }
      const c = Math.cos(s.rot),
        sn = Math.sin(s.rot);
      for (const w of s.sw)
        if (!w.fired && s.age >= w.at) {
          w.fired = 1;
          const wx = s.cx + w.lx * c - w.ly * sn,
            wy = s.cy + w.lx * sn + w.ly * c;
          sbSword(wx, wy, Math.atan2(P.y - wy, P.x - wx), 560, s.d);
        }
      if (s.sw.every((w) => w.fired)) s.dead = 1;
    } else if (s.k == "sline") {
      if (s.age < s.fix) {
        const k = Math.min(1, dt * 2.4);
        s.ax += (P.x + s.ox - s.ax) * k;
        s.ay += (P.y + s.oy - s.ay) * k;
      } else if (!s.fired && s.age >= s.fix + 0.3) {
        s.fired = 1;
        const dr = Math.random() < 0.5 ? 1 : -1;
        sbSword(s.ax - Math.cos(s.a) * dr * 760, s.ay - Math.sin(s.a) * dr * 760, s.a + (dr < 0 ? Math.PI : 0), 1050, s.d, 70);
        snd(900, 0.1, "sawtooth", 0.03);
      }
      if (s.age > s.fix + 0.7) s.dead = 1;
    } else if (s.k == "sword") {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt;
      const ca = Math.cos(s.a),
        sa = Math.sin(s.a);
      for (const q of [0, 0.5, 1]) {
        if (Math.hypot(P.x - (s.x - ca * s.len * q), P.y - (s.y - sa * s.len * q)) < 13 + P.r * 0.5) {
          hurtP(s.d);
          s.life = 0;
          break;
        }
      }
      if (s.x < -120 || s.x > 1080 || s.y < -120 || s.y > 720) s.life = 0;
      if (s.life <= 0) s.dead = 1;
    }
    if (s.k == "petal" && s.age > s.life) s.dead = 1;
    if (s.k == "sring" && s.age > s.life) s.dead = 1;
    if (s.k == "petal" && s.e.hp <= 0) s.dead = 1;
  }
  SBH = SBH.filter((s) => !s.dead);
}

// ======================= dibujo de peligros =======================
function drawSBH() {
  const t = Date.now() / 1000;
  for (const s of SBH) {
    x.save();
    if (s.k == "petal") {
      const a = s.a0 + s.w0 * s.age,
        on = s.age >= s.tele,
        fade = s.age > s.life - 0.3 ? Math.max(0, (s.life - s.age) / 0.3) : 1,
        grow = on ? 1 : cl(s.age / s.tele, 0, 1);
      x.translate(s.e.x, s.e.y);
      x.rotate(a);
      const L = s.L * (on ? 1 : 0.35 + 0.65 * grow),
        w = s.w;
      x.beginPath();
      x.moveTo(0, 0);
      x.lineTo(0.35 * L, w);
      x.lineTo(L, 0);
      x.lineTo(0.35 * L, -w);
      x.closePath();
      if (on) {
        const g = x.createLinearGradient(0, 0, L, 0);
        g.addColorStop(0, hue(s.h + 20, 0.95 * fade, 80));
        g.addColorStop(0.5, hue(s.h + 50, 0.85 * fade, 62));
        g.addColorStop(1, hue(s.h + 330, 0.8 * fade, 55));
        x.fillStyle = g;
        x.fill();
        x.strokeStyle = `rgba(255,255,255,${0.9 * fade})`;
        x.lineWidth = 3;
        x.stroke();
      } else {
        x.fillStyle = hue(s.h + 40, 0.1 + 0.12 * grow, 70);
        x.fill();
        x.setLineDash([8, 6]);
        x.strokeStyle = hue(s.h + 40, 0.55, 75);
        x.lineWidth = 2;
        x.stroke();
      }
    } else if (s.k == "sring") {
      const N = 34,
        fade = s.age > s.life - 0.8 ? Math.max(0, (s.life - s.age) / 0.8) : 1;
      for (let i = 0; i < N; i++) {
        const a0 = s.g0 * 0 + (i / N) * 6.283 + s.age * 0.18,
          a1 = a0 + 6.283 / N + 0.02;
        const am = (a0 + a1) / 2;
        let gap = false;
        for (const g of [s.g0, s.g0 + Math.PI]) if (Math.abs(nrm(am - g)) < s.gw / 2) gap = true;
        if (gap) continue;
        const h = (i / N) * 360 + t * 80;
        for (let k = 0; k < 6; k++) {
          const rk = s.r - k * (s.trail / 6) - s.trail / 12;
          if (rk <= 1) break; // el anillo aún es pequeño: la estela no cabe
          x.strokeStyle = hue(h, 0.62 * (1 - k / 6) * fade, 62);
          x.lineWidth = s.trail / 6 + 1.5;
          x.beginPath();
          x.arc(s.cx, s.cy, rk, a0, a1);
          x.stroke();
        }
        // estrella en el borde
        x.fillStyle = hue(h, fade, 80);
        x.save();
        x.translate(s.cx + Math.cos(am) * s.r, s.cy + Math.sin(am) * s.r);
        x.rotate(t * 3 + i);
        x.beginPath();
        for (let q = 0; q < 8; q++) x.lineTo(Math.cos((q * Math.PI) / 4) * (q % 2 ? 3.5 : 10), Math.sin((q * Math.PI) / 4) * (q % 2 ? 3.5 : 10));
        x.closePath();
        x.fill();
        x.restore();
      }
    } else if (s.k == "hg") {
      const c = Math.cos(s.rot),
        sn = Math.sin(s.rot),
        fadeIn = Math.min(1, s.age / 0.5);
      for (const w of s.sw) {
        if (w.fired) continue;
        const wx = s.cx + w.lx * c - w.ly * sn,
          wy = s.cy + w.lx * sn + w.ly * c,
          a = Math.atan2(s.cy - wy, s.cx - wx),
          pre = cl((s.age - (w.at - 0.25)) / 0.25, 0, 1); // el último instante tiembla antes de salir
        drawLightSword(wx + rnd(-1, 1) * pre * 2, wy + rnd(-1, 1) * pre * 2, a, 40, 200, fadeIn);
      }
    } else if (s.k == "sline") {
      const fixed = s.age >= s.fix,
        al = fixed ? 1 : 0.55,
        h = s.h + t * 120;
      x.translate(s.ax, s.ay);
      x.rotate(s.a);
      const g = x.createLinearGradient(-900, 0, 900, 0);
      for (let i = 0; i <= 6; i++) g.addColorStop(i / 6, hue(h + i * 55, al, 65));
      x.strokeStyle = g;
      x.lineWidth = fixed ? 6 : 2.5;
      x.beginPath();
      x.moveTo(-900, 0);
      x.lineTo(900, 0);
      x.stroke();
      if (fixed) {
        x.strokeStyle = "rgba(255,255,255,.8)";
        x.lineWidth = 2;
        x.stroke();
      }
    } else if (s.k == "sword") {
      drawLightSword(s.x, s.y, s.a, s.len, s.h + t * 100, 1);
    }
    x.restore();
  }
}
// Espada de luz (apunta en la dirección `a`)
function drawLightSword(px, py, a, len, h, al) {
  x.save();
  x.translate(px, py);
  x.rotate(a);
  const g = x.createLinearGradient(-len, 0, 6, 0);
  g.addColorStop(0, hue(h, 0, 70));
  g.addColorStop(1, hue(h, 0.9 * al, 78));
  x.fillStyle = g;
  x.beginPath();
  x.moveTo(-len, -2.5);
  x.lineTo(-8, -6);
  x.lineTo(14, 0);
  x.lineTo(-8, 6);
  x.lineTo(-len, 2.5);
  x.closePath();
  x.fill();
  x.strokeStyle = `rgba(255,255,255,${0.85 * al})`;
  x.lineWidth = 1.5;
  x.stroke();
  x.fillStyle = hue(h + 40, al, 60);
  x.fillRect(-12, -8, 3, 16);
  x.restore();
}

// ======================= comportamiento =======================
const SBA = {
  astros(e, dt) {
    if (e.ts == dt) sbText(e, "✦");
    if (e.ap == 0 && e.ts > 0.55) {
      e.ap = 1;
      sbAstros(e);
    }
    return e.ts > 1.1;
  },
  charge(e, dt) {
    // 0-0.85 grito y aviso · 0.85-1.45 embestida con rastro multicolor · luego recuperación
    if (e.ap == 0) {
      if (e.ts == dt) {
        sbText(e, "¡¡AAAH!!");
        shake = Math.max(shake, 6);
        for (let i = 0; i < 3; i++) FX.push({ k: "ring", x: e.x, y: e.y, r: 70 + i * 40, t: 0.45 + i * 0.12, m: 0.45 + i * 0.12, c: hue(i * 90) });
        snd(180, 0.7, "sawtooth", 0.08);
      }
      if (e.ts < 0.6) e.cta = Math.atan2(P.y - e.y, P.x - e.x);
      if (e.ts > 0.85) {
        e.ap = 1;
        e.cdt = 0;
        e.chit = 0;
        bsnd(SB, "atk");
      }
    } else if (e.ap == 1) {
      e.cdt += dt;
      const sp = 1300;
      e.x += Math.cos(e.cta) * sp * dt;
      e.y += Math.sin(e.cta) * sp * dt;
      e.gt = (e.gt || 0) - dt;
      if (e.gt <= 0) {
        e.gt = 0.03;
        e.gh.push({ x: e.x, y: e.y, t: 0.5, m: 0.5, h: (e.tm * 300) % 360 });
      }
      if (!e.chit && Math.hypot(P.x - e.x, P.y - e.y) < e.r + P.r + 4) {
        e.chit = 1;
        hurtP(e.dmg * 1.3, e);
      }
      const wall = e.x < RB.x0 + e.r || e.x > RB.x1 - e.r || e.y < RB.y0 + e.r || e.y > RB.y1 - e.r;
      e.x = cl(e.x, RB.x0 + e.r, RB.x1 - e.r);
      e.y = cl(e.y, RB.y0 + e.r, RB.y1 - e.r);
      if (e.cdt > 0.55 || wall) {
        e.ap = 2;
        e.rt = 0;
        if (wall) shake = Math.max(shake, 5);
      }
    } else {
      e.rt += dt;
      return e.rt > 0.55;
    }
    return false;
  },
  sun(e, dt) {
    if (e.ap == 0) {
      if (sbMove(e, 480, 300, 700, dt) < 8) {
        e.ap = 1;
        e.at2 = 0;
        FX.push({ k: "ring", x: e.x, y: e.y, r: 130, t: 0.5, m: 0.5, c: "#ffd86a" });
      }
      return false;
    }
    e.at2 += dt;
    if (e.ap == 1 && e.at2 > 0.45) {
      e.ap = 2;
      sbSun(e);
      shake = Math.max(shake, 5);
      snd(150, 0.8, "sawtooth", 0.07);
    }
    return e.at2 > 5.2;
  },
  ring(e, dt) {
    sbMove(e, 480, 300, 500, dt);
    if (e.ap == 0 && e.ts > 0.25) {
      e.ap = 1;
      sbRing(e);
    }
    return e.ts > 1.3;
  },
  hg(e, dt) {
    // nuevo ataque de la fase 2: dos relojes de arena mientras lanza astros
    sbMove(e, 480, 260, 300, dt);
    if (e.ap == 0) {
      e.ap = 1;
      sbHourglass(e, (Math.random() * 5) | 0);
    }
    if (e.ap == 1 && e.ts > 1.4) {
      e.ap = 2;
      sbHourglass(e, (Math.random() * 5) | 0);
    }
    if (e.ap == 2 && e.ts > 1.9) {
      e.ap = 3;
      sbAstros(e);
    }
    return e.ts > 4;
  },
  lines(e, dt) {
    sbMove(e, 480, 260, 300, dt);
    if (e.ap == 0) {
      e.ap = 1;
      sbLines(e);
      sbText(e, "✦");
    }
    return e.ts > 4.2;
  },
  // apertura de la fase 2: invulnerable en el centro; 5 relojes (cambiando sentido) + astros, astros, y líneas
  p2in(e, dt) {
    e.invl = true;
    sbMove(e, 480, 300, 400, dt);
    const t = e.ts;
    if (e.ap == 0) {
      while (e.hgN < 5 && t >= e.hgN * 1.5) sbHourglass(e, e.hgN++);
      for (const tt of [0.9, 3.4, 5.9]) if (!e.av[tt] && t >= tt) ((e.av[tt] = 1), sbAstros(e));
      if (t >= 8.6) {
        e.ap = 1;
        e.t2s = 0;
        sbAstros(e); // tras el reloj, vuelve a lanzar el primer ataque del combo
      }
    } else if (e.ap == 1) {
      e.t2s += dt;
      if (e.t2s > 1.7) {
        e.ap = 2;
        e.t2s = 0;
        sbLines(e);
      }
    } else {
      e.t2s += dt;
      if (e.t2s > 4.4) {
        e.invl = false;
        flash("Heliarca vuelve a ser vulnerable");
        return true;
      }
    }
    return false;
  },
};
const SB_COMBO = ["astros", "charge", "sun", "ring"];
function sbStart(e, name) {
  e.at = name;
  e.ts = 0;
  e.ap = 0;
  if (name == "p2in") {
    e.hgN = 0;
    e.av = {};
  }
}
function sbNext(e) {
  if (!e.ph2) {
    sbStart(e, SB_COMBO[e.ci++ % 4]);
    return;
  }
  if (!e.q || !e.q.length) {
    e.q = [];
    for (const c of SB_COMBO) {
      e.q.push(c);
      if (Math.random() < 0.45) e.q.push(Math.random() < 0.5 ? "hg" : "lines"); // ataques de la nueva fase, de vez en cuando
    }
  }
  sbStart(e, e.q.shift());
}
function sbUp(e, dt, c) {
  if (e.gh === undefined) {
    e.gh = [];
    e.ci = 0;
    e.at = null;
    e.idle = 1.4;
    e.ph2 = 0;
    e.pa = 0;
    e.pw = 0.4;
  }
  for (const g of e.gh) g.t -= dt;
  e.gh = e.gh.filter((g) => g.t > 0);
  if (e.invl) e.imm = 0.3;
  // mitad de la vida: grito, centro del escenario e invulnerabilidad
  if (!e.ph2 && !e.tr && !e.at && e.hp < e.mhp * 0.5) {
    e.tr = { t: 0 };
    e.invl = true;
    SBH = SBH.filter((s) => s.k == "sword");
  }
  if (e.tr) {
    const T = e.tr;
    T.t += dt;
    sbMove(e, 480, 300, 600, dt);
    if (!T.s) {
      T.s = 1;
      sbText(e, "¡¡AAAAAH!!");
      shake = 12;
      for (let i = 0; i < 5; i++) FX.push({ k: "ring", x: e.x, y: e.y, r: 90 + i * 60, t: 0.5 + i * 0.15, m: 0.5 + i * 0.15, c: hue(i * 70) });
      snd(120, 1.2, "sawtooth", 0.1);
      bsnd(SB, "ph");
    }
    if (T.t > 1.5) {
      e.tr = null;
      e.ph2 = 1;
      sbStart(e, "p2in");
    }
    return;
  }
  if (e.at) {
    e.ts += dt;
    if (SBA[e.at](e, dt, c)) {
      e.at = null;
      e.idle = e.ph2 ? 0.7 : 0.9;
    }
    return;
  }
  sbMove(e, 480, 190 + Math.sin(e.tm * 0.9) * 14, 140, dt);
  e.idle -= dt;
  if (e.idle <= 0) sbNext(e);
}

// ======================= dibujo del jefe =======================
function drawSB(e) {
  const r = e.r,
    t = Date.now() / 1000,
    ap = e.app ?? 1,
    sc = 0.15 + 0.85 * ap;
  // copias multicolor de la embestida
  if (e.gh)
    for (const g of e.gh) {
      x.save();
      x.globalAlpha = (g.t / g.m) * 0.6;
      x.translate(g.x, g.y);
      x.fillStyle = hue(g.h, 1, 62);
      x.beginPath();
      x.arc(0, 0, r * 0.95, 0, 7);
      x.fill();
      x.strokeStyle = hue(g.h + 60, 1, 80);
      x.lineWidth = 3;
      x.stroke();
      x.restore();
    }
  x.save();
  x.translate(e.x, e.y);
  x.scale(sc, sc);
  x.globalAlpha = Math.min(1, ap * 1.6);
  const g = x.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 2.6);
  g.addColorStop(0, "rgba(255,230,140,.55)");
  g.addColorStop(1, "rgba(255,160,60,0)");
  x.fillStyle = g;
  x.beginPath();
  x.arc(0, 0, r * 2.6, 0, 7);
  x.fill();
  // rayos
  x.save();
  x.rotate(t * 0.5);
  for (let i = 0; i < 12; i++) {
    x.rotate(Math.PI / 6);
    x.fillStyle = hue(i * 30 + t * 40, 0.55, 70);
    x.beginPath();
    x.moveTo(r * 0.9, -4);
    x.lineTo(r * (1.7 + 0.25 * Math.sin(t * 4 + i)), 0);
    x.lineTo(r * 0.9, 4);
    x.fill();
  }
  x.restore();
  // cuerpo
  const body = x.createRadialGradient(-r * 0.3, -r * 0.3, 2, 0, 0, r);
  body.addColorStop(0, e.fl > 0 ? "#fff" : "#fffbe0");
  body.addColorStop(0.55, e.fl > 0 ? "#fff" : "#ffd45a");
  body.addColorStop(1, e.fl > 0 ? "#fff" : "#e8721e");
  x.fillStyle = body;
  x.strokeStyle = "#000";
  x.lineWidth = 3;
  x.beginPath();
  x.arc(0, 0, r, 0, 7);
  x.fill();
  x.stroke();
  // estrella interior
  x.save();
  x.rotate(-t * 0.9);
  x.fillStyle = "rgba(255,120,40,.8)";
  x.beginPath();
  for (let i = 0; i < 16; i++) x.lineTo(Math.cos((i * Math.PI) / 8) * (i % 2 ? r * 0.3 : r * 0.72), Math.sin((i * Math.PI) / 8) * (i % 2 ? r * 0.3 : r * 0.72));
  x.closePath();
  x.fill();
  x.restore();
  // ojos
  const a = Math.atan2(P.y - e.y, P.x - e.x);
  x.fillStyle = "#3a1408";
  for (const s of [-1, 1]) {
    x.beginPath();
    x.ellipse(Math.cos(a) * 6 + (-Math.sin(a)) * s * r * 0.3, Math.sin(a) * 6 + Math.cos(a) * s * r * 0.3, 3.2, 5.5, a, 0, 7);
    x.fill();
  }
  // satélites
  for (let i = 0; i < 3; i++) {
    const q = t * 1.6 + (i * Math.PI * 2) / 3;
    x.fillStyle = hue(i * 120 + t * 60, 1, 70);
    x.beginPath();
    x.arc(Math.cos(q) * r * 1.55, Math.sin(q) * r * 1.55, 5, 0, 7);
    x.fill();
  }
  if (e.invl) {
    x.strokeStyle = `rgba(190,230,255,${0.6 + 0.3 * Math.sin(t * 9)})`;
    x.lineWidth = 4;
    for (let i = 0; i < 2; i++) {
      x.beginPath();
      x.arc(0, 0, r * (1.35 + i * 0.25), 0, 7);
      x.stroke();
    }
  }
  x.restore();
}

// ======================= cinemática de aparición =======================
// El jefe secreto ejecuta al jefe que iba a aparecer y toma su lugar con una presentación en el centro.
function sbIntro() {
  const b = spawnBoss(); // el jefe original aparece primero
  G.intro = null;
  const s = sbSpawn();
  s.sp = 0.001;
  s.app = 0;
  s.x = 480;
  s.y = 300;
  G.cs = { t: 0, orig: b, sb: s, ex: 0, fl: 0 };
}
function csTick(dt) {
  const c = G.cs;
  c.t += dt;
  const t = c.t;
  if (t > 1.1 && !c.beam) {
    c.beam = 1;
    snd(900, 0.6, "sawtooth", 0.07);
    snd(1400, 0.4, "square", 0.04);
  }
  if (t > 1.45 && !c.ex) {
    c.ex = 1;
    c.fl = 1;
    const b = c.orig;
    FX.push({ k: "ring", x: b.x, y: b.y, r: 160, t: 0.7, m: 0.7, c: "#fff" }, { k: "dead", x: b.x, y: b.y, r: b.r, c: BD[b.bi].c, t: 0.6, m: 0.6 });
    for (let i = 0; i < 12; i++) FX.push({ k: "p", x: b.x, y: b.y, vx: rnd(-260, 260), vy: rnd(-260, 260), t: 0.8, m: 0.8, c: i % 2 ? "#fff" : BD[b.bi].c });
    b.hp = 0;
    b.dead = 1;
    E = E.filter((q) => q !== b);
    shake = 16;
    snd(70, 1, "sawtooth", 0.1);
  }
  if (c.fl > 0) c.fl = Math.max(0, c.fl - dt * 1.4);
  if (t > 2.7 && !c.born) {
    c.born = 1;
    c.fl = 1;
    shake = 12;
    snd(110, 1.6, "sawtooth", 0.09);
    snd(220, 1.4, "sine", 0.07);
    for (let i = 0; i < 6; i++) FX.push({ k: "ring", x: 480, y: 300, r: 80 + i * 70, t: 0.6 + i * 0.18, m: 0.6 + i * 0.18, c: hue(i * 60) });
  }
  if (t > 2.7) {
    c.sb.app = Math.min(1, (t - 2.7) / 1.4);
    if (t < 6) shake = Math.max(shake, 3 + 3 * Math.sin(t * 25)); // temblor ligero mientras se presenta
    if (Math.random() < dt * 22) FX.push({ k: "p", x: 480 + rnd(-30, 30), y: 300 + rnd(-30, 30), vx: rnd(-240, 240), vy: rnd(-240, 240), t: 0.9, m: 0.9, c: hue(rnd(0, 360)) });
  }
  if (t > 6.6) {
    c.sb.sp = 0;
    c.sb.app = 1;
    c.sb.t1 = 1;
    G.cs = null;
    K = {};
    bsnd(SB, "in");
  }
}
function drawCS() {
  const c = G.cs,
    t = c.t;
  x.save();
  // oscurece el escenario
  const dk = t < 0.5 ? t / 0.5 : 1;
  x.fillStyle = `rgba(4,2,12,${0.55 * dk * (t > 2.7 ? Math.max(0.15, 1 - (t - 2.7) / 2) : 1)})`;
  x.fillRect(0, 0, W, H);
  // barras de cine
  const bar = Math.min(1, t / 0.6) * 54;
  x.fillStyle = "#000";
  x.fillRect(0, 0, W, bar);
  x.fillRect(0, H - bar, W, bar);
  // haz de luz que ejecuta al jefe original
  if (c.beam && !c.ex) {
    const o = c.orig,
      k = Math.min(1, (t - 1.1) / 0.35);
    const g = x.createLinearGradient(0, 0, W, 0);
    for (let i = 0; i <= 6; i++) g.addColorStop(i / 6, hue(i * 55 + t * 200, 0.95, 70));
    x.strokeStyle = g;
    x.lineWidth = 10 * k;
    x.beginPath();
    x.moveTo(o.x - 600 * (1 - k), o.y - 380 * (1 - k));
    x.lineTo(o.x, o.y);
    x.stroke();
  }
  if (c.ex && t < 2.7) {
    // sombra del que ejecuta, recortada contra la luz
    const o = c.orig;
    x.strokeStyle = `rgba(255,255,255,${Math.max(0, 1 - (t - 1.45) / 0.6)})`;
    x.lineWidth = 6;
    x.beginPath();
    x.moveTo(o.x - 220, o.y - 160);
    x.lineTo(o.x + 220, o.y + 160);
    x.stroke();
  }
  // presentación en el centro
  if (t > 2.7) {
    const k = Math.min(1, (t - 2.7) / 1.2);
    x.globalCompositeOperation = "lighter";
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * 6.283 + t * 0.4;
      x.fillStyle = hue(i * 26 + t * 90, 0.28 * k, 60);
      x.save();
      x.translate(480, 300);
      x.rotate(a);
      x.beginPath();
      x.moveTo(40, -9);
      x.lineTo(520 * k, 0);
      x.lineTo(40, 9);
      x.fill();
      x.restore();
    }
    x.globalCompositeOperation = "source-over";
  }
  if (t > 3.5) {
    const a = Math.min(1, (t - 3.5) / 0.9) * (t > 6 ? Math.max(0, 1 - (t - 6) / 0.6) : 1);
    x.globalAlpha = a;
    x.textAlign = "center";
    x.shadowColor = "#ffb030";
    x.shadowBlur = 30;
    x.fillStyle = "#fff4c0";
    x.font = "bold 62px Georgia";
    x.fillText("HELIARCA", 480, 470 - 8 * (1 - Math.min(1, (t - 3.5) / 0.9)));
    x.shadowBlur = 0;
    x.fillStyle = "#ffd86a";
    x.font = "italic 20px Georgia";
    x.fillText("Soberano de los Astros", 480, 504);
    x.globalAlpha = 1;
  }
  if (c.fl > 0) {
    x.fillStyle = `rgba(255,255,255,${c.fl * 0.85})`;
    x.fillRect(0, 0, W, H);
  }
  x.restore();
}
