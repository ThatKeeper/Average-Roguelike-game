/* ======================================================================
 * src/js/game/class-actions.js
 * Habilidades de clase: Q, E, clic derecho y R (únicas de cada clase) y la habilidad de rama (tecla C:
 * parry / reiniciar enfriamientos / recargar maná). También las trampas, zonas de clase y acciones retardadas.
 *
 * Los tomos de hechizo (antigua tecla R) se han eliminado por completo.
 *
 * Define:
 * TR, FZ, LT, skLater, burst, aimPt, SKL, UTL, skOf, skUtil, ab, util, skWarn, spl, ltTick
 * ====================================================================== */

let TR = [], // trampas del jugador {x,y,t,arm,r,c,f(t)}
  FZ = [], // zonas de clase {k,x,y,r,t,m,tk,iv,f(z),fl(sigue al jugador),c}
  LT = []; // acciones retardadas {t,fn}

// Ejecuta fn dentro de t segundos (los cambios de sala y las partidas nuevas las descartan).
const skLater = (t, fn) => LT.push({ t, fn });
function ltTick(dt) {
  for (const q of LT) {
    q.t -= dt;
    if (q.t <= 0 && !q.d) {
      q.d = 1;
      try {
        q.fn();
      } catch (e) {
        console.error(e);
      }
    }
  }
  LT = LT.filter((q) => !q.d);
}
// Chispas rápidas (el límite de FX protege el rendimiento).
function burst(x0, y0, c, n = 6, sp = 120) {
  for (let i = 0; i < n; i++)
    FX.push({ k: "p", x: x0, y: y0, vx: rnd(-sp, sp), vy: rnd(-sp, sp), t: 0.4, m: 0.4, c });
}
// Punto señalado por el ratón, limitado a `mx` píxeles del jugador y dentro de la sala.
function aimPt(mx) {
  const d = Math.min(mx, dist(P, M)),
    a = P.face;
  return { x: cl(P.x + Math.cos(a) * d, RB.x0 + 10, RB.x1 - 10), y: cl(P.y + Math.sin(a) * d, RB.y0 + 10, RB.y1 - 10) };
}
// Impactos en línea desde la posición actual hacia donde miras (onda sísmica, glaciar...).
function lineImpacts(n, d0, step, delay, fn) {
  const o = { x: P.x, y: P.y },
    a = P.face;
  for (let i = 0; i < n; i++)
    skLater(i * delay, () =>
      fn(cl(o.x + Math.cos(a) * (d0 + i * step), RB.x0, RB.x1), cl(o.y + Math.sin(a) * (d0 + i * step), RB.y0, RB.y1), i),
    );
}
const foes = (r, from = P) => E.filter((e) => e.hp > 0 && e.sp <= 0 && dist(from, e) < r + e.r);
const inCone = (e, r, half) => dist(P, e) < r + e.r && Math.abs(nrm(ang(P, e) - P.face)) < half;

// Mensaje de aviso sin repetirlo cada fotograma.
function skWarn(t) {
  if (P.wt > 0) return;
  P.wt = 0.9;
  flash(t);
}

/*
 * SKL[clave de clase] = [Q, E, clic derecho (o null), R]
 *   n nombre · d descripción · ic icono del HUD · cd enfriamiento (s) · mp maná · f() lanza la habilidad
 *   (devolver false = no se ha lanzado: no gasta maná ni enfriamiento) · g: la guardia (mantener)
 */
const SKL = {
  war: [
    { n: "Remolino", ic: "whirl", cd: 6, d: "Giras con el arma: daño en área a tu alrededor.", f: () => area(P.x, P.y, 115 * (1 + tv("whR")), wd(1.8), "p", { c: "#f93" }) },
    {
      n: "Salto con impacto", ic: "leap", cd: 8, d: "Saltas hacia delante, invulnerable, y aturdes al caer.",
      f: () => {
        const a = P.face;
        P.dash = { t: 0.25, vx: Math.cos(a) * 620 * (1 + tv("leapD")), vy: Math.sin(a) * 620 * (1 + tv("leapD")), inv: 1, end: () => area(P.x, P.y, 90 * (1 + tv("leapR")), wd(2.2), "p", { stun: 1 + tv("leapS"), c: "#fc6" }) };
      },
    },
    { n: "Guardia", ic: "guard", g: 1, d: "Mantén clic derecho (o C): reduce el daño. Los primeros 0,22 s son parry perfecto." },
    {
      n: "Veredicto", ic: "verdict", cd: 14, d: "Un tajo enorme con el swing real de tu arma: ejecuta (×2) a los enemigos por debajo del 35 % de vida. Cada baja reduce 3 s Q y E.",
      f: () => {
        // el golpe usa el swing actual del arma (sprite, trayectoria y hitbox), ampliado y más lento
        const w = P.w.s == "m" ? P.w : mk(0);
        startSwing(w, P.face, true, 0.55, {
          k: 1.45,
          arc: 1.15,
          ver: {
            hit: (e) => {
              const low = e.hp < e.mhp * (0.35 + tv("verEx")) && e.t != "boss";
              hit(e, wd(3.2) * (low ? 2 : 1), "p", { a: ang(P, e), kb: 150 });
              if (e.hp <= 0) {
                P.cd[0] = Math.max(0, P.cd[0] - 3 - tv("verCut"));
                P.cd[1] = Math.max(0, P.cd[1] - 3 - tv("verCut"));
              }
            },
          },
        });
        if (SW) SW.fx.c = "#ffd34a";
        shake = Math.max(shake, 4);
        flash("¡Veredicto!");
      },
    },
  ],
  hun: [
    { n: "Andanada", ic: "volley", cd: 6, d: "Cinco flechas en abanico.", f: () => { for (let n = 5 + tv("volN"), i = 0; i < n; i++) shoot(P.face + (i - (n - 1) / 2) * 0.13, P.w.sp || 640, wd(0.7), "p", { c: "#fff", spr: projFor(false) }); } },
    { n: "Flecha explosiva", ic: "bomb", cd: 7, d: "Una flecha que estalla en área al impactar.", f: () => shoot(P.face, 560, wd(1.5 * (1 + tv("exDm"))), "p", { ex: 95 * (1 + tv("exR")), c: "#fa4", r: 7, spr: projFor(true) }) },
    {
      n: "Flecha venenosa", ic: "venom", cd: 5, d: "Flecha perforante que envenena (clic derecho).",
      f: () => shoot(P.face, 600, wd(1.2), "p", { pierce: 3, fx: { poison: 5 + tv("venD") }, c: "#6e4", r: 6, spr: projFor(false), gl: "#6e4" }),
    },
    {
      n: "Lluvia de flechas", ic: "rain", cd: 16, d: "Una tormenta de flechas cae durante 3 s sobre la zona señalada.",
      f: () => {
        const p = aimPt(340);
        FZ.push({
          k: "rain", x: p.x, y: p.y, r: 120 * (1 + tv("rainR")), t: 3.2 + tv("rainD"), m: 3.2 + tv("rainD"), tk: 0, iv: 0.2, c: "#cfe8b0",
          f: (z) => {
            for (const e of foes(z.r, z)) hit(e, wd(0.5), "p", { a: ang(z, e), kb: 20 });
            for (let i = 0; i < 3; i++) {
              const a = rnd(0, 6.28),
                d = Math.sqrt(Math.random()) * z.r;
              FX.push({ k: "p", x: z.x + Math.cos(a) * d, y: z.y + Math.sin(a) * d - 50, vx: 0, vy: 520, t: 0.1, m: 0.1, c: "#fff" });
            }
          },
        });
        flash("¡Lluvia de flechas!");
      },
    },
  ],
  mag: [
    { n: "Bola de fuego", ic: "fireball", cd: 4, mp: 22, d: "Proyectil que explota y quema.", f: () => shoot(P.face, 450, wd(2), "m", { ex: 100 * (1 + tv("fbR")), fx: { burn: 3 }, c: "#f60", r: 9, spr: "magia_ignea" }) },
    { n: "Nova de hielo", ic: "frostnova", cd: 8, mp: 25, d: "Onda helada a tu alrededor: ralentiza y aturde un instante.", f: () => area(P.x, P.y, 150, wd(0.8), "m", { fx: { slow: 3 }, c: "#9fe8ff", stun: 0.5 + tv("novS") }) },
    { n: "Rayo en cadena", ic: "chain", cd: 2.5, mp: 18, d: "Rayo rápido que salta entre 4 enemigos (clic derecho).", f: () => shoot(P.face, 1000, wd(1.1), "m", { ch: 4 + tv("chN"), c: "#fff27a", spr: "magia_tormenta" }) },
    {
      n: "Sobrecarga arcana", ic: "overload", cd: 22, d: "Durante 6 s: +35 % de daño y los hechizos cuestan un 60 % menos de maná.",
      f: () => {
        P.bt = 6 + tv("ovD");
        P.ovc = 6 + tv("ovD");
        FX.push({ k: "ring", x: P.x, y: P.y, r: 70, t: 0.4, m: 0.4, c: "#c8a0ff" });
        flash("¡Sobrecarga arcana!");
      },
    },
  ],
  tank: [
    {
      n: "Onda sísmica", ic: "quake", cd: 7, d: "Cinco golpes de tierra en línea hacia delante: daño y aturdimiento breve.",
      f: () =>
        lineImpacts(5 + tv("qakeN"), 70, 58, 0.07, (px, py) => {
          area(px, py, 56 * (1 + tv("qakeR")), wd(1.3), "p", { stun: 0.5 + tv("qakeS"), c: "#d9a066" });
          burst(px, py, "#b98", 5);
        }),
    },
    {
      n: "Bastión", ic: "bulwark", cd: 16, d: "4 s de −55 % de daño recibido y un escudo de sobrevida que solo dura 3 s.",
      f: () => {
        P.dr = 4 + tv("bulD");
        P.sh = Math.max(P.sh || 0, (25 + P.a.vit * 5) * (1 + tv("bulSh")));
        P.sht = 3 + tv("bulD"); // la sobrevida se pierde a los 3 s, la hayas gastado o no
        FX.push({ k: "ring", x: P.x, y: P.y, r: 60, t: 0.35, m: 0.35, c: "#cfd8ea" });
        flash("¡Bastión!");
      },
    },
    { n: "Guardia", ic: "guard", g: 1, d: "Mantén clic derecho (o C): reduce el daño. Los primeros 0,22 s son parry perfecto." },
    {
      n: "Golpe del coloso", ic: "colossus", cd: 20, d: "Tras 0,6 s de preparación (con −90 % de daño), un impacto devastador en área que aturde 1,6 s.",
      f: () => {
        P.dr = Math.max(P.dr || 0, 0.9);
        FX.push({ k: "ring", x: P.x, y: P.y, r: 200 * (1 + tv("colR")), t: 0.6 - tv("colP"), m: 0.6 - tv("colP"), c: "#ffd34a" });
        skLater(0.6 - tv("colP"), () => {
          area(P.x, P.y, 200 * (1 + tv("colR")), wd(4.2), "p", { stun: 1.6 + tv("colS"), c: "#ffcf70" });
          FX.push({ k: "ring", x: P.x, y: P.y, r: 120, t: 0.3, m: 0.3, c: "#fff" });
          burst(P.x, P.y, "#ffcf70", 8, 220);
          shake = Math.max(shake, 12);
        });
        flash("¡Golpe del coloso!");
      },
    },
  ],
  assa: [
    {
      n: "Paso sombrío", ic: "shadowstep", cd: 7, d: "Atraviesas una línea de enemigos invulnerable: daño y hemorragia.",
      f: () => {
        const a = P.face,
          x0 = P.x,
          y0 = P.y,
          x1 = cl(x0 + Math.cos(a) * 210 * (1 + tv("stepL")), RB.x0 + P.r, RB.x1 - P.r),
          y1 = cl(y0 + Math.sin(a) * 210 * (1 + tv("stepL")), RB.y0 + P.r, RB.y1 - P.r),
          sx = x1 - x0,
          sy = y1 - y0,
          L2 = sx * sx + sy * sy || 1;
        for (const e of E)
          if (e.hp > 0 && e.sp <= 0) {
            const t = cl(((e.x - x0) * sx + (e.y - y0) * sy) / L2, 0, 1);
            if (Math.hypot(e.x - (x0 + sx * t), e.y - (y0 + sy * t)) < e.r + 30) hit(e, wd(1.1), "p", { a, kb: 60, fx: { bleed: 2 } });
          }
        for (let i = 0; i < 6; i++) FX.push({ k: "p", x: x0 + (sx * i) / 6, y: y0 + (sy * i) / 6, vx: rnd(-30, 30), vy: rnd(-30, 30), t: 0.35, m: 0.35, c: "#8a6cff" });
        P.dash = { t: 0.12, vx: sx / 0.12, vy: sy / 0.12, inv: 1 };
        P.inv = 0.3 + tv("stepI");
      },
    },
    {
      n: "Lluvia de dagas", ic: "daggers", cd: 9, d: "Siete cuchillos en abanico: perforan un enemigo y provocan hemorragia.",
      f: () => {
        for (let n = 7 + tv("dagN"), i = 0; i < n; i++) shoot(P.face + (i - (n - 1) / 2) * 0.16, 780, wd(0.62), "p", { spr: "daga_lanzada", pierce: 1, fx: { bleed: 1 }, c: "#cbf", r: 5, l: 0.65 });
      },
    },
    { n: "Guardia", ic: "guard", g: 1, d: "Mantén clic derecho (o C): reduce el daño. Los primeros 0,22 s son parry perfecto." },
    {
      n: "Danza mortal", ic: "dance", cd: 18, d: "1,6 s de torbellino de hojas a tu alrededor, invulnerable: daño y hemorragia continuos.",
      f: () => {
        FZ.push({
          k: "dance", x: P.x, y: P.y, r: 92 * (1 + tv("danR")), t: 1.6 + tv("danD"), m: 1.6 + tv("danD"), tk: 0, iv: 0.12, fl: 1, c: "#e0405a",
          f: (z) => {
            P.inv = Math.max(P.inv, 0.16);
            for (const e of foes(z.r, P)) hit(e, wd(0.5), "p", { a: ang(P, e), kb: 40, fx: { bleed: 1 } });
          },
        });
        flash("¡Danza mortal!");
      },
    },
  ],
  xbow: [
    {
      n: "Virote perforante", ic: "pierce", cd: 5, d: "Un virote enorme que atraviesa a todos los enemigos de la línea.",
      f: () => shoot(P.face, 1500, wd(3.2 * (1 + tv("boltDm"))), "p", { pierce: 9, spr: "virote_cargado", r: 7, c: "#fff", l: 0.9, gl: "#ffb060" }),
    },
    {
      n: "Trampa de púas", ic: "spiketrap", cd: 9, d: "Coloca una trampa (máx. 3): al pisarla inmoviliza 2,2 s y daña en área.",
      f: () => {
        const p = aimPt(260),
          sp = TR.filter((t) => t.k == "spike");
        if (sp.length >= 3 + tv("trapN")) TR.splice(TR.indexOf(sp[0]), 1);
        TR.push({
          k: "spike", x: p.x, y: p.y, t: 25, arm: 0.5, r: 34, c: "#cde",
          f: (t) => {
            area(t.x, t.y, 95 * (1 + tv("trapR")), wd(1.9), "p", { fx: { root: 2.2 + tv("trapS") }, stun: 0.3, c: "#cde" });
            burst(t.x, t.y, "#cde", 6);
          },
        });
      },
    },
    null,
    {
      n: "Fuego de asedio", ic: "siege", cd: 18, d: "Recarga al instante y dispara 6 virotes perforantes seguidos.",
      f: () => {
        if (P.w.mag) P.am = P.w.mag;
        P.rl = 0;
        flash("¡Fuego de asedio!");
        for (let i = 0; i < 6 + tv("sieN"); i++)
          skLater(i * 0.1, () => {
            shoot(P.face + rnd(-0.06, 0.06), 1150, wd(1.1), "p", { pierce: 2 + tv("sieP"), spr: "virote", l: 0.9 });
            rangedKick();
            snd(140, 0.07, "square");
          });
      },
    },
  ],
  rune: [
    {
      n: "Runas buscadoras", ic: "homing", cd: 6, d: "Cuatro runas que persiguen al enemigo más cercano.",
      f: () => {
        for (let n = 4 + tv("runeN"), i = 0; i < n; i++) shoot(P.face + (i - (n - 1) / 2) * 0.3, 540, wd(0.8 * (1 + tv("runeDm"))), "p", { spr: "magia_runica", r: 6, l: 2.2, hm: 7, c: "#7ff", gl: "#7ff" });
      },
    },
    {
      n: "Sello rúnico", ic: "seal", cd: 12, d: "Un sello en el suelo durante 5 s: daña y ralentiza a quien lo pise.",
      f: () => {
        const p = aimPt(300);
        FZ.push({
          k: "seal", x: p.x, y: p.y, r: 105 * (1 + tv("sealR")), t: 5 + tv("sealD"), m: 5 + tv("sealD"), tk: 0, iv: 0.5, c: "#8ff4ff",
          f: (z) => {
            for (const e of foes(z.r, z)) {
              hit(e, wd(0.42), "p", { a: ang(z, e) });
              if (!(e.st.slow > 0) && e.hp > 0) apply(e, { slow: 0.8 + tv("sealSl") });
            }
          },
        });
      },
    },
    null,
    {
      n: "Sobrecarga rúnica", ic: "runeover", cd: 20, d: "6 s: disparas mucho más rápido, en tres direcciones y sin recargar.",
      f: () => {
        P.ovr = 6 + tv("ovrD");
        P.rl = 0;
        FX.push({ k: "ring", x: P.x, y: P.y, r: 70, t: 0.4, m: 0.4, c: "#8ff4ff" });
        flash("¡Sobrecarga rúnica!");
      },
    },
  ],
  fimg: [
    {
      n: "Llamarada", ic: "flare", cd: 5, mp: 24, d: "Cono de fuego: daño fuerte y quemadura.",
      f: () => {
        FX.push({ k: "arc", x: P.x, y: P.y, a: P.face, r: 175 * (1 + tv("flR")), w: 1.5, t: 0.28, m: 0.28 });
        for (const e of E) if (e.hp > 0 && e.sp <= 0 && inCone(e, 175 * (1 + tv("flR")), 0.75)) hit(e, wd(1.8), "m", { el: "fire", a: ang(P, e), kb: 140, fx: { burn: 3 + tv("flD") } });
        burst(P.x + Math.cos(P.face) * 60, P.y + Math.sin(P.face) * 60, "#ff9a3a", 8, 160);
      },
    },
    {
      n: "Glaciar", ic: "glacier", cd: 9, mp: 26, d: "Una hilera de picos de hielo hacia delante que congela a lo que toca.",
      f: () =>
        lineImpacts(6 + tv("glN"), 60, 52, 0.06, (px, py) => {
          area(px, py, 52 * (1 + tv("glR")), wd(0.85), "m", { fx: { freeze: 1 + tv("glF") }, c: "#9fe8ff" });
          burst(px, py, "#cff4ff", 4);
        }),
    },
    null,
    {
      n: "Choque térmico", ic: "shock", cd: 16, mp: 38, d: "Detona el contraste: lo quemado y lo helado sufre un daño enorme. Si es ambas cosas, se hace añicos.",
      f: () => {
        const R = 1 + tv("shkR"),
          K = 1 + tv("shkDm"),
          T = foes(300 * R);
        if (!T.length) {
          skWarn("No hay enemigos a tu alcance");
          return false;
        }
        FX.push({ k: "ring", x: P.x, y: P.y, r: 300 * R, t: 0.35, m: 0.35, c: "#ffd7a0" });
        FX.push({ k: "ring", x: P.x, y: P.y, r: 200 * R, t: 0.3, m: 0.3, c: "#9fe8ff" });
        for (const e of T) {
          const hot = e.st.burn > 0,
            cold = e.st.slow > 0 || e.st.stun > 0,
            a = ang(P, e);
          if (hot && cold) {
            e.st.burn = e.st.slow = e.st.stun = 0;
            hit(e, wd(5.5 * K), "m", { a, kb: 160, fx: { frac: 4 } });
            burst(e.x, e.y, "#fff", 6, 200);
          } else if (hot) {
            e.st.burn = 0;
            hit(e, wd(2.2 * K), "m", { a, kb: 100 });
            if (e.hp > 0) apply(e, { slow: 2.5 });
          } else if (cold) {
            e.st.slow = e.st.stun = 0;
            hit(e, wd(2.2 * K), "m", { a, kb: 100 });
            if (e.hp > 0) apply(e, { burn: 3 });
          } else {
            hit(e, wd(0.8 * K), "m", { a });
            if (e.hp > 0) {
              apply(e, { burn: 3 });
              apply(e, { slow: 2.5 });
            }
          }
        }
        shake = Math.max(shake, 6);
        flash("¡Choque térmico!");
      },
    },
  ],
  alch: [
    {
      n: "Frasco corrosivo", ic: "flask", cd: 5, mp: 14, d: "Lanzas un frasco al punto señalado: explota, envenena y corroe.",
      f: () => {
        const d = cl(dist(P, M), 90, 400);
        shoot(P.face, 520, wd(1), "m", { ex: 95 * (1 + tv("flaskR")), fx: { poison: 5 + tv("flaskD"), cor: 2 }, spr: "frasco", r: 7, l: d / 520, c: "#7e4", eol: 1, gl: "#7e4" });
      },
    },
    {
      n: "Nube tóxica", ic: "cloud", cd: 11, mp: 28, d: "Una nube durante 6 s que daña y envenena a los que la cruzan.",
      f: () => {
        const p = aimPt(320);
        FZ.push({
          k: "cloud", x: p.x, y: p.y, r: 115 * (1 + tv("cloudR")), t: 6 + tv("cloudD"), m: 6 + tv("cloudD"), tk: 0, iv: 0.5, c: "#7ec850",
          f: (z) => {
            for (const e of foes(z.r, z)) hit(e, wd(0.3 * (1 + tv("cloudDm"))), "m", { fx: { poison: 3 } });
          },
        });
      },
    },
    null,
    {
      n: "Pandemia", ic: "plague", cd: 18, mp: 34, d: "Todos los enemigos envenenados estallan, contagian a los que tienen cerca y te curan un poco.",
      f: () => {
        const inf = E.filter((e) => e.hp > 0 && e.sp <= 0 && e.st.poison > 0 && dist(P, e) < 520).slice(0, 8 + tv("plN"));
        if (!inf.length) {
          skWarn("No hay enemigos envenenados");
          return false;
        }
        for (const e of inf) {
          area(e.x, e.y, 90 * (1 + tv("plR")), wd(0.9), "m", { fx: { poison: 6, cor: 2 }, c: "#7e4" });
          burst(e.x, e.y, "#7e4", 5);
        }
        P.hp = Math.min(P.mhp, P.hp + P.mhp * Math.min(0.15 + tv("plC"), (0.025 + tv("plH")) * inf.length));
        flash("¡Pandemia!");
      },
    },
  ],
};

/*
 * Habilidad de rama (tecla C), siempre disponible: STR = guardia/parry (mantener; también clic derecho),
 * DEX = reiniciar enfriamientos, INT = recargar maná.
 */
const UTL = {
  str: { n: "Guardia / parry", ic: "guard", g: 1, d: "Mantén C o clic derecho (arma cuerpo a cuerpo): reduce el daño; parry perfecto en los primeros 0,22 s." },
  dex: {
    n: "Recarga ágil", ic: "reset", cd: 18, d: "Reinicia el enfriamiento de todas tus habilidades y de la esquiva.",
    f: () => {
      for (let i = 0; i < P.cd.length; i++) if (i != 8) P.cd[i] = 0;
      P.dcd = 0;
      FX.push({ k: "ring", x: P.x, y: P.y, r: 50, t: 0.3, m: 0.3, c: "#e8c460" });
      flash("Recarga ágil");
    },
  },
  int: {
    n: "Canalizar maná", ic: "mana", cd: 12, d: "Recuperas el 40 % de tu maná máximo.",
    f: () => {
      P.mp = Math.min(P.mmp, P.mp + P.mmp * 0.4);
      FX.push({ k: "ring", x: P.x, y: P.y, r: 50, t: 0.3, m: 0.3, c: "#5a96ff" });
      flash("Canalizas maná");
    },
  },
};

const skOf = (ck, i) => (SKL[ck] || [])[i] || null,
  skUtil = (br) => UTL[br] || UTL.str;

// Lanza la habilidad i (0 Q, 1 E, 2 clic derecho, 3 R) de la clase actual.
function ab(i) {
  const A = skOf(P.ck, i);
  if (!A || !A.f || P.cd[i] > 0 || P.dash || P.nov) return;
  if (P.br == "int" && !mageOn()) return skWarn("Necesitas un arma mágica para usar la magia");
  const mcost = A.mp ? spMp(A.mp) * (1 - tv("mpc")) : 0; // el coste de maná escala con el daño (ver mpK)
  if (mcost && P.mp < mcost) return;
  if (A.f() === false) return;
  P.mp -= mcost;
  P.cd[i] = Math.max(1, A.cd - tv("cd" + i)) * (1 - 0.01 * U("cdr")); // mejoras de clase: −s de enfriamiento
  if (P.w.s != "m") rangedKick();
  snd(300, 0.15, "triangle");
}
// Habilidad de rama (C): reiniciar enfriamientos (DEX) o recargar maná (INT). La guardia (STR) se gestiona en upP.
function util() {
  const A = skUtil(P.br);
  if (!A.f || P.cd[8] > 0 || P.dash || P.nov) return;
  A.f();
  P.cd[8] = A.cd * (1 - 0.01 * U("cdr"));
  snd(520, 0.15, "triangle");
}

function spl(dt) {
  zn(dt);
  P.stcd -= dt;
  if (P.wt > 0) P.wt -= dt;
  ltTick(dt);
  for (const t of TR) {
    t.t -= dt;
    if (t.arm > 0) {
      t.arm -= dt;
      continue;
    }
    for (const e of E)
      if (e.hp > 0 && e.sp <= 0 && dist(t, e) < e.r + (t.r || 30)) {
        t.t = 0;
        t.f(t);
        break;
      }
  }
  TR = TR.filter((t) => t.t > 0);
  for (const z of FZ) {
    z.t -= dt;
    z.tk -= dt;
    if (z.fl) {
      z.x = P.x;
      z.y = P.y;
    }
    if (z.tk <= 0 && z.t > 0) {
      z.tk = z.iv;
      z.f(z);
    }
  }
  FZ = FZ.filter((z) => z.t > 0);
}
