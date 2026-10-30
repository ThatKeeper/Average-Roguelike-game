/* ======================================================================
 * src/js/spells/casting.js
 * Construcción y lanzamiento de hechizos (proyectil, rayo, meteoro, nova, cono y zona), impacto, efectos
 * posteriores (zarzas, nubes, contagio, parásito) y entidades persistentes (ZN: zonas, ondas y vínculos).
 *
 * Define:
 * build, spHit, spBeam, spImpact, spEnd, spNova, spCone, castSp, zn
 * ====================================================================== */

// Tabla base por forma: [coste de maná, enfriamiento, multiplicador de daño, radio]
const SPFORM = {
  bolt: [20, 2.5, 1, 0],
  nova: [28, 5, 0.85, 120],
  cone: [22, 3, 1.1, 170],
  zone: [30, 7, 0.55, 90],
};
// Elementos -> sonido base del lanzamiento
const SPSND = { fire: 300, ice: 760, light: 960, water: 430, plant: 260, wind: 560, rock: 140, dark: 190, blood: 170, corr: 230 };

// Construye el hechizo de la clave k ("fire" o "fire+ice"); también acepta (a, b) por compatibilidad.
function build(a, b) {
  const k = b ? [a, b].filter(Boolean).sort().join("+") : a,
    c = CB[k],
    [ea, eb] = k.split("+"),
    f2 = c.f,
    F = SPFORM[f2],
    has = (z) => ea == z || eb == z,
    els =
      eb && eb != ea
        ? [
            [ea, 0.6],
            [eb, 0.4],
          ]
        : [[ea, 1]];
  let cost = F[0] * (eb ? 1.2 : 1) * (1 - tv("mpc")) * mpK(),
    cd = F[1],
    hpc = has("blood") ? P.mhp * (k == "blood+dark" ? 0.15 : 0.06) : 0;
  const dmg = wd(1) * F[2] * (c.m || 1) * (has("blood") ? 1.35 : 1);
  if (has("corr")) {
    cost *= 1.25;
    cd *= 1.25;
  }
  const rb = f2 == "bolt" ? (c.lob ? 105 : 0) : F[3];
  return {
    k,
    a: ea,
    b: eb || "",
    f: f2,
    c,
    els,
    name: c.n,
    cost,
    cd: cd * (c.cdm || 1) * (1 - tv("ccd")),
    hpc,
    dmg,
    r: rb * (c.r || 1) * (has("wind") && f2 != "bolt" ? 1.3 : 1) * (1 + tv("cardR")),
    dur: 4 + tv("cardD"),
    desc: c.d,
    risk:
      [hpc ? `Sacrificas ${Math.ceil(hpc)} de vida.` : "", has("corr") ? "+25% coste y enfriamiento." : "", c.rk && !hpc ? c.rk : "", k == "fire+water" || k == "fire+ice" ? "Los elementos se contrarrestan." : ""]
        .filter(Boolean)
        .join(" ") || "Sin riesgos.",
  };
}
function spHit(e, s, x0, y0) {
  if (e.hp <= 0 || e.sp > 0) return;
  s.cx = x0;
  s.cy = y0;
  for (const [k, sh] of s.els) {
    hit(e, s.dmg * sh, "m", { el: k, ch: k == "light", a: Math.atan2(e.y - y0, e.x - x0) });
    if (e.hp > 0) EL[k].h(e, s, x0, y0);
  }
  if (s.c && e.hp > 0) s.c.h(e, s);
}
// Rayo solar: golpea al instante a todos los enemigos de la línea (se detiene en muros).
function spBeam(sp) {
  const a = P.face,
    ca = Math.cos(a),
    sa = Math.sin(a),
    ox = P.x + ca * 18,
    oy = P.y + sa * 18;
  let d = 0;
  for (; d < 560; d += 8) {
    const px = ox + ca * d,
      py = oy + sa * d;
    if (px < RB.x0 || px > RB.x1 || py < RB.y0 || py > RB.y1) break;
    if (RM_.obs.some((b) => !b.pit && px > b.x && px < b.x + b.w && py > b.y && py < b.y + b.h)) break;
  }
  const ex = ox + ca * d,
    ey = oy + sa * d;
  for (const e of E) {
    if (e.hp <= 0 || e.sp > 0) continue;
    const t = cl(((e.x - ox) * ca + (e.y - oy) * sa) / Math.max(1, d), 0, 1),
      q = Math.hypot(e.x - (ox + ca * d * t), e.y - (oy + sa * d * t));
    if (q < e.r + 10) spHit(e, sp, ox, oy);
  }
  FX.push({ k: "sfx", v: "beam", sv: sp.k, x: ox, y: oy, x2: ex, y2: ey, t: 0.45, m: 0.45 });
  shake = Math.max(shake, 2);
}
function spImpact(p, e) {
  const s = p.sf;
  FX.push({ k: "sfx", v: "hit", sv: s.k, x: p.x, y: p.y, a: Math.atan2(p.vy, p.vx), t: 0.5, m: 0.5 });
  if (p.lob) return;
  if (s.c.hops && !p.hopd) {
    p.hopd = 1;
    spPlague(e, s, s.c.hops);
  }
  if (s.c.link && !p.lkd) {
    p.lkd = 1;
    ZN.push({ zk: "link", e, t: s.c.link.t, t0: s.c.link.t, k: s.c.link.tk, sp: s, lk: s.c.link, key: s.k });
  }
}
// Contagio carmesí: la infección salta al enemigo más cercano hasta n veces.
function spPlague(e0, s, n) {
  let cur = e0;
  const used = new Set([e0]);
  for (let i = 0; i < n; i++)
    skLater(0.32 * (i + 1), () => {
      let b = null,
        bd = 200;
      for (const q of E) if (q.hp > 0 && q.sp <= 0 && !used.has(q) && dist(q, cur) < bd) ((bd = dist(q, cur)), (b = q));
      if (!b) return;
      FX.push({ k: "sfx", v: "jump", sv: s.k, x: cur.x, y: cur.y, x2: b.x, y2: b.y, t: 0.32, m: 0.32 });
      used.add(b);
      cur = b;
      hit(b, s.dmg * 0.65, "m", { el: "blood", a: 0 });
      apply(b, s.c.fx);
      FX.push({ k: "sfx", v: "hit", sv: s.k, x: b.x, y: b.y, a: 0, t: 0.5, m: 0.5 });
    });
}
// Al terminar el recorrido de un proyectil de hechizo (impacto final, muro o fin de alcance).
function spEnd(p) {
  const s = p.sf,
    c = s.c;
  if (p.lob) {
    FX.push({ k: "sfx", v: "crater", sv: s.k, x: p.x, y: p.y, r: s.r, t: 1.1, m: 1.1 });
    shake = Math.max(shake, 7);
    snd(90, 0.3, "sawtooth", 0.06);
    for (const e of E) if (e.hp > 0 && e.sp <= 0 && dist(p, e) < s.r + e.r) spHit(e, s, p.x, p.y);
    if (c.cap) P.stcd = 6;
  }
  if (c.fz) {
    const fz = c.fz,
      sub = {
        k: s.k,
        a: fz.el || s.a,
        els: [[fz.el || s.a, 1]],
        dmg: s.dmg * fz.m,
        st: false,
        tick: 1,
        c: {
          h: (e, q) => {
            const f = Object.assign({}, fz.fx);
            if (f.slow && e.st.slow > 0) {
              e.st.slow = Math.max(e.st.slow, f.slow); // renovar sin aturdir en bucle (re-ralentizar aturdiría 0,9 s)
              delete f.slow;
            }
            apply(e, f);
            if (fz.pull && e.t != "boss") {
              const an = Math.atan2(q.cy - e.y, q.cx - e.x);
              e.vx += Math.cos(an) * fz.pull;
              e.vy += Math.sin(an) * fz.pull;
            }
          },
        },
      },
      r = fz.r * (1 + tv("cardR")),
      t = fz.dur + tv("cardD") * 0.4;
    ZN.push({ zk: "zone", x: cl(p.x, RB.x0, RB.x1), y: cl(p.y, RB.y0, RB.y1), r, t, t0: t, u: 0, k: 0.25, tk: 0.5, sp: sub, v: fz.v, key: s.k });
  }
}
// Onda (nova o cono): se expande y golpea a cada enemigo en cuanto el frente le llega.
function spWave(sp, f, x0, y0, a, delay) {
  const T = f == "nova" ? 0.45 : 0.4,
    w = { zk: "wave", f, x: x0, y: y0, a, r: sp.r, t: T + 0.55, t0: T + 0.55, u: -(delay || 0), T, hit: new Set(), sp, key: sp.k };
  sp.cx = x0;
  sp.cy = y0;
  ZN.push(w);
  return w;
}
function castSp(spec, ci = 4) {
  const s = spec;
  if (!s || !s.k || !CB[s.k] || P.cd[ci] > 0 || P.dash) return;
  const sp = build(s.k);
  if (P.mp < sp.cost || P.hp <= sp.hpc + 1) {
    flash(P.mp < sp.cost ? "Man\u00e1 insuficiente" : "Vida insuficiente");
    return;
  }
  P.mp -= sp.cost;
  P.hp -= sp.hpc;
  P.cd[ci] = sp.cd;
  if (s.u) for (const i of s.u.slots) P.cd[4 + i] = sp.cd; // una pareja fundida comparte enfriamiento
  sp.st = !(P.stcd > 0);
  sp.tick = sp.f == "zone" ? 1 : 0; // los golpes repetidos de una zona no encadenan aturdimientos
  const art = SPA[sp.k],
    c = sp.c,
    col = art.p[1],
    a = P.face,
    base = SPSND[sp.a];
  FX.push({ k: "sfx", v: "cast", sv: sp.k, x: P.x + Math.cos(a) * 20, y: P.y + Math.sin(a) * 20, a, t: 0.3, m: 0.3 });
  if (sp.f == "bolt") {
    if (c.beam) spBeam(sp);
    else if (c.lob) {
      const d = cl(dist(P, M), 140, 380),
        tx = cl(P.x + Math.cos(a) * d, RB.x0 + 14, RB.x1 - 14),
        ty = cl(P.y + Math.sin(a) * d, RB.y0 + 14, RB.y1 - 14),
        T = 0.8,
        sx = P.x + Math.cos(a) * 18,
        sy = P.y + Math.sin(a) * 18;
      PR.push({ x: sx, y: sy, vx: (tx - sx) / T, vy: (ty - sy) / T, s: 0, r: 8, d: sp.dmg, t: "m", l: T, l0: T, pc: 0, bn: 0, f: "p", h: new Set(), c: col, sf: sp, sv: sp.k, lob: 1, sx, sy, tx, ty, dr: drawSpellProj });
    } else {
      const spd = c.spd || 560;
      shoot(a, spd, sp.dmg, "m", {
        sf: sp,
        sv: sp.k,
        c: col,
        r: c.pierce >= 3 ? 9 : 8,
        pierce: c.pierce || 0,
        bounce: c.bounce || 0,
        l: Math.min(1.8, 620 / spd),
        dr: drawSpellProj,
      });
    }
  } else if (sp.f == "zone") {
    const d = Math.min(300, dist(P, M)),
      zx = cl(P.x + Math.cos(a) * d, RB.x0 + 10, RB.x1 - 10),
      zy = cl(P.y + Math.sin(a) * d, RB.y0 + 10, RB.y1 - 10);
    sp.cx = zx;
    sp.cy = zy;
    ZN.push({ zk: "zone", x: zx, y: zy, r: sp.r, t: sp.dur, t0: sp.dur, u: 0, k: 0.3, tk: 0.6, sp, v: art.v, key: sp.k });
  } else if (sp.f == "nova") {
    const g = c.ground ? aimPt(300) : { x: P.x, y: P.y };
    spWave(sp, "nova", g.x, g.y, a);
    if (c.pulses > 1)
      skLater(0.55, () => spWave(Object.assign({}, sp, { dmg: sp.dmg * 0.75, st: false }), "nova", g.x, g.y, a));
  } else spWave(sp, "cone", P.x, P.y, a);
  if (c.cap && !c.lob) P.stcd = 6; // el meteoro lo activa al caer
  rangedKick();
  snd(base, 0.14, sp.f == "zone" ? "sine" : sp.f == "cone" ? "sawtooth" : "triangle", 0.05);
  if (sp.f == "nova" || sp.f == "zone") snd(base * 0.5, 0.25, "sine", 0.04);
}
// Entidades persistentes (ZN): zonas con daño periódico, ondas en expansión y vínculos (parásito).
function zn(dt) {
  for (const z of ZN) {
    z.t -= dt;
    z.u = (z.u || 0) + dt;
    if (z.zk == "wave") {
      if (z.u < 0) continue;
      const k = Math.min(1, z.u / z.T),
        rr = z.r * (1 - (1 - k) * (1 - k)),
        cone = z.f == "cone";
      for (const e of E)
        if (e.hp > 0 && e.sp <= 0 && !z.hit.has(e) && dist(z, e) < rr + e.r && (!cone || Math.abs(nrm(ang(z, e) - z.a)) < 0.65)) {
          z.hit.add(e);
          spHit(e, z.sp, z.x, z.y);
        }
    } else if (z.zk == "link") {
      z.k -= dt;
      if (z.e.hp <= 0) z.t = 0;
      else if (z.k <= 0) {
        z.k = z.lk.tk;
        const d = z.sp.dmg * z.lk.m;
        hit(z.e, d, "m", { el: "plant", nl: 1 });
        P.hp = Math.min(P.mhp, P.hp + d * z.lk.heal);
      }
    } else {
      z.k -= dt;
      if (z.k <= 0) {
        z.k = z.tk || 0.6;
        if (z.sp) for (const e of E) if (e.hp > 0 && dist(z, e) < z.r + e.r) spHit(e, z.sp, z.x, z.y);
      }
    }
  }
  ZN = ZN.filter((z) => z.t > 0);
}
