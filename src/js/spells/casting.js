/* ======================================================================
 * src/js/spells/casting.js
 * Construcción y lanzamiento de hechizos, impacto de hechizo y zonas persistentes.
 *
 * Define:
 * build, spHit, castSp, zn
 * ====================================================================== */

function build(a, b, f) {
  const k = [a, b].filter(Boolean).sort().join("+"),
    c = CB[k],
    f2 = c?.f || f,
    F = {
      bolt: [20, 2.5, 1, 0],
      nova: [28, 5, 0.85, 120],
      cone: [22, 3, 1.1, 170],
      zone: [30, 7, 0.55, 90],
    }[f2],
    has = (z) => a == z || b == z,
    els =
      b && b != a
        ? [
            [a, 0.6],
            [b, 0.4],
          ]
        : [[a, 1]];
  let cost = F[0] * (b && b != a ? 1.2 : 1) * (1 - 0.08 * (P.tal.alch || 0)) * mpK(),
    cd = F[1],
    hpc = has("blood") ? P.mhp * (k == "blood+dark" ? 0.15 : 0.06) : 0;
  const dmg = wd(1) * F[2] * (c?.m || 1) * (has("blood") ? 1.35 : 1);
  if (has("corr")) {
    cost *= 1.25;
    cd *= 1.25;
  }
  return {
    a,
    b,
    f: f2,
    c,
    els,
    name: c ? c.n : EL[a].n + (b && b != a ? " + " + EL[b].n : ""),
    cost,
    cd: cd * (c?.cdm || 1),
    hpc,
    dmg,
    r: F[3] * (c?.r || 1) * (has("wind") ? 1.3 : 1),
    dur: 4,
    k: 1,
    desc: els.map(([z]) => EL[z].d).join(" ") + (c ? " \u2605 " + c.d : ""),
    risk:
      [
        hpc ? `Sacrificas ${Math.ceil(hpc)} de vida.` : "",
        has("corr") ? "+25% coste y enfriamiento." : "",
        (c && c.rk) || "",
        k == "fire+water" || k == "fire+ice" ? "Los elementos se contrarrestan." : "",
      ]
        .filter(Boolean)
        .join(" ") || "Sin riesgos.",
  };
}
function spHit(e, s, x0, y0) {
  if (e.hp <= 0 || e.sp > 0) return;
  for (const [k, sh] of s.els) {
    hit(e, s.dmg * sh, "m", { el: k, ch: k == "light", a: Math.atan2(e.y - y0, e.x - x0) });
    if (e.hp > 0) EL[k].h(e, s, x0, y0);
  }
  if (s.c && e.hp > 0) s.c.h(e, s);
}
function castSp(spec, ci = 4) {
  const s = spec || P.sp;
  if (!s || P.cd[ci] > 0 || P.dash) return;
  const sp = build(s.a, s.b, s.f);
  if (P.mp < sp.cost || P.hp <= sp.hpc + 1) {
    flash(P.mp < sp.cost ? "Man\u00e1 insuficiente" : "Vida insuficiente");
    return;
  }
  P.mp -= sp.cost;
  P.hp -= sp.hpc;
  P.cd[ci] = sp.cd;
  sp.st = !(P.stcd > 0);
  const col = EL[sp.a].c;
  if (sp.f == "bolt")
    shoot(P.face, 560, sp.dmg, "m", {
      sf: sp,
      c: col,
      r: 8,
      pierce: sp.c ? 1 : 0,
      spr: SPELL_SPR[sp.a],
    });
  else if (sp.f == "zone") {
    const d = Math.min(300, dist(P, M)),
      a = P.face;
    ZN.push({ x: P.x + Math.cos(a) * d, y: P.y + Math.sin(a) * d, r: sp.r, t: sp.dur, k: 0, sp });
  } else {
    FX.push({ k: "ring", x: P.x, y: P.y, r: sp.r, t: 0.3, m: 0.3, c: col });
    for (const e of E)
      if (
        e.hp > 0 &&
        dist(P, e) < sp.r + e.r &&
        (sp.f == "nova" || Math.abs(nrm(ang(P, e) - P.face)) < 0.65)
      )
        spHit(e, sp, P.x, P.y);
  }
  if (sp.c && sp.c.cap) P.stcd = 6;
  rangedKick();
  snd(500, 0.12, "sine");
}
function zn(dt) {
  for (const z of ZN) {
    z.t -= dt;
    z.k -= dt;
    if (z.k <= 0) {
      z.k = 0.6;
      for (const e of E) if (e.hp > 0 && dist(z, e) < z.r + e.r) spHit(e, z.sp, z.x, z.y);
    }
  }
  ZN = ZN.filter((z) => z.t > 0);
}

