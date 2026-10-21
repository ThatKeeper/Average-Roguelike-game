/* ======================================================================
 * src/js/bosses/boss-kits.js
 * Los 32 jefes nuevos: escalado adaptativo, kits de ataques (AT2), nombres y paletas.
 *
 * Define:
 * adH, adD, later, schd, guard, AT2, xat, rk, NN, PAL, KIT, kitUp
 * ====================================================================== */

// ===== 32 JEFES NUEVOS (22 normales + 10 finales): datos + kits de ataques; rotan por partida y aparecen en cualquier bioma =====
// Escalado adaptativo: la vida enemiga crece con tu daño y su daño con tu vida (con tope). Jefes: inmunidad 99%, sin aturdimiento, tope de daño por golpe/segundo, anti-bloqueo.
const adH = () =>
    P
      ? 1 +
        Math.min(
          1.2,
          0.4 * Math.max(0, P.dm * P.edm * P.w.rm - 1.2) +
            0.35 * Math.max(0, P.mhp / (130 + 14 * G.d) - 1),
        )
      : 1,
  adD = () =>
    P
      ? 1 +
        Math.min(
          0.6,
          0.3 * Math.max(0, P.mhp / (130 + 14 * G.d) - 1) + 0.15 * Math.max(0, P.dm * P.edm - 1.3),
        )
      : 1;
const later = (e, t, f) => (e.sc = e.sc || []).push({ t, f });
function schd(e, dt) {
  if (!e.sc || !e.sc.length) return;
  for (const q of e.sc) q.t -= dt;
  const rd = e.sc.filter((q) => q.t <= 0);
  e.sc = e.sc.filter((q) => q.t > 0);
  rd.forEach((q) => q.f());
}
function guard(e, dt) {
  if (e.lhp === undefined || e.hp < e.lhp) e.wg = 0;
  e.lhp = e.hp;
  e.wg = (e.wg || 0) + dt;
  if (e.wg > 20) {
    e.wg = 0;
    [...(e.mn || []), ...(e.dc || []), ...(e.orb || [])].forEach((q) => {
      q.hp = 0;
      q.dead = 1;
    });
    e.mn = [];
    e.dc = [];
    e.orb = [];
    e.o2 = 0;
    e.rs = 0;
    e.imm = 0;
    e.vul = 3;
    if (dist(e, P) > 420) {
      e.x = cl(P.x + 150, 90, 870);
      e.y = cl(P.y, 90, 510);
    }
    flash("El jefe queda expuesto");
  }
}
const AT2 = {
  rain: [
    "Lluvia de meteoros",
    (e, c, k) => {
      for (let i = 0; i < 5 + c.ph; i++)
        tz(P.x + rnd(-120, 120), P.y + rnd(-120, 120), 52, 1.1 + i * 0.08, e.dmg, k);
    },
  ],
  wave: [
    "Onda expansiva",
    (e, c, k) => {
      tz(e.x, e.y, 170, 0.9, e.dmg * 1.1, k);
      later(e, 0.9, () => brs(e, 12 + c.ph * 4, 200, e.dmg * 0.5, 0, 0, k));
    },
  ],
  cross: [
    "Cruz mortal",
    (e, c, k) => {
      for (let i = -3; i <= 3; i++) {
        tz(P.x + i * 70, P.y, 45, 1.5, e.dmg, k);
        if (i) tz(P.x, P.y + i * 70, 45, 1.5, e.dmg, k);
      }
    },
  ],
  spiral: [
    "Espiral",
    (e, c, k) => {
      for (let j = 0; j < 3; j++)
        later(e, j * 0.35, () => brs(e, 8, 190, e.dmg * 0.5, j * 0.4, 0.5, k));
    },
  ],
  homing: [
    "Plaga rastreadora",
    (e, c, k) => {
      for (let i = -1; i <= 1; i++) bt(e, c.a + i * 0.6, 190, e.dmg * 0.6, 0, k, 1.3);
    },
  ],
  charge: [
    "Embestida telegrafiada",
    (e, c, k) => {
      e.wd = 0.6;
      later(e, 0.6, () => dsh(e, 0.35, 560));
    },
  ],
  summon: [
    "Convocar secuaces",
    (e, c, k) => {
      e.mn = (e.mn || []).filter((q) => q.hp > 0 && !q.dead);
      if (e.mn.length < 4)
        for (let i = 0; i < 2; i++) {
          const q = spawn(pick(["grunt", "runner"]), e.x + rnd(-90, 90), e.y + rnd(40, 110));
          q.minion = 1; // invocado: sin oro ni XP
          q.al = 1;
          q.sp = 0.4;
          e.mn.push(q);
        }
      ring(e, 120, k);
    },
  ],
  fan: [
    "Abanico",
    (e, c, k) => {
      for (let i = -3; i <= 3; i++) bt(e, c.a + i * 0.18, 300, e.dmg * 0.55, 0, k);
    },
  ],
  nova: [
    "Anillos concéntricos",
    (e, c, k) => {
      [90, 170, 250].forEach((r, j) => later(e, j * 0.35, () => tz(e.x, e.y, r, 0.9, e.dmg, k)));
    },
  ],
  mines: [
    "Minas retardadas",
    (e, c, k) => {
      for (let i = 0; i < 5; i++) tz(rnd(100, 860), rnd(100, 500), 48, 2.4, e.dmg, k);
    },
  ],
  sweep: [
    "Barrido",
    (e, c, k) => {
      for (let i = 1; i <= 8; i++) {
        const x0 = e.x + Math.cos(c.a) * i * 65,
          y0 = e.y + Math.sin(c.a) * i * 65;
        later(e, i * 0.08, () => tz(x0, y0, 42, 0.8, e.dmg, k));
      }
    },
  ],
  blink: [
    "Salto sombrío",
    (e, c, k) => {
      tp(e, 210);
      tz(e.x, e.y, 120, 0.8, e.dmg * 1.2, k);
    },
  ],
  cage: [
    "Jaula",
    (e, c, k) => {
      const g = (Math.random() * 10) | 0;
      for (let i = 0; i < 10; i++)
        if (i != g)
          tz(P.x + Math.cos(i * 0.628) * 190, P.y + Math.sin(i * 0.628) * 190, 50, 1.4, e.dmg, k);
    },
  ],
};
function xat(e, dt, c) {
  e.xt = (e.xt ?? 5) - dt;
  if (e.xt > 0 || e.vul > 0 || e.ch > 0 || e.lu > 0 || e.wd > 0) return;
  e.xt = 7 - c.ph * 1.2 + rnd(0, 2);
  const L = ["rain", "cross", "homing", "nova", "mines", "fan", "cage", "sweep"];
  AT2[L[rk(e, L.length, "xk")]][1](e, c, BD[e.bi].c);
}
function rk(e, n, key = "lk2") {
  let k;
  do {
    k = (Math.random() * n) | 0;
  } while (n > 1 && k == e[key]);
  return (e[key] = k);
}
const NN = [
    "Karg, Rompehuesos",
    "Ilmara, la Tejedora",
    "Bruk, Devorador de Rocas",
    "Seraphine Ceniza",
    "Orlo, Guardián del Pozo",
    "Tamsin, Voz Hueca",
    "Grendal el Podrido",
    "Aska, Lanza Tormenta",
    "Pyrrus, Alma de Brasa",
    "Zhul, Sacerdote Oxidado",
    "Morwen, Cazadora Pálida",
    "Dagon, Marea Negra",
    "Eriks, Caballero Hueco",
    "Lyssa, Reina Araña",
    "Voss, Hereje Carmesí",
    "Thorn, Madre de Espinas",
    "Cael, Heraldo Gélido",
    "Nuru, Ojo del Desierto",
    "Brann, Forjador Maldito",
    "Quill, el Archivista",
    "Ymir Menor",
    "Sable, Sombra Errante",
    "Aeon, Rey Ceniciento",
    "Kharon, Barquero del Vacío",
    "Tiamat Quebrada",
    "Omega, Autómata Final",
    "Nyarl, Pesadilla Coronada",
    "Solaris, Sol Caído",
    "Mordrake, Emperador Hueso",
    "Abyssia, Madre Abismal",
    "Ragnarok Encadenado",
    "Eterna, la Última Sombra",
  ],
  PAL = [
    "#e55",
    "#5be",
    "#eb5",
    "#5e8",
    "#b5e",
    "#e85",
    "#8be",
    "#ec7",
    "#7ce",
    "#e7b",
    "#9d5",
    "#d95",
  ],
  KIT = {};
function kitUp(e, dt, c) {
  const i = e.bi,
    K = KIT[i],
    k = BD[i].c,
    F = FIN(i);
  e.t1 -= dt;
  e.wd -= dt;
  if (F && e.ph0 !== c.ph) {
    e.ph0 = c.ph;
    ring(e, 150, k);
    if (c.ph > 0) {
      flash("¡" + e.nm + " cambia de fase!");
      AT2.summon[1](e, c, k);
    }
  }
  {
    const sg = SIG[i];
    if (sg.tr == 0 && e.hp < e.mhp * 0.5) c.sp *= 1.4;
    e.tt = (e.tt ?? 3) - dt;
    if (e.tt <= 0 && !(e.vul > 0)) {
      e.tt = TI[sg.tr] * (1 - 0.12 * c.ph);
      TF[sg.tr](e, c, k);
    }
  }
  if (e.vul > 0) return;
  const m = i % 3;
  if (m == 0) {
    if (c.d > 140) c.mv(c.nx * c.sp, c.ny * c.sp);
  } else if (m == 1)
    c.mv(-c.ny * c.sp * e.dir + c.nx * c.sp * 0.3, c.nx * c.sp * e.dir + c.ny * c.sp * 0.3);
  else if (c.d < 240) c.mv(-c.nx * c.sp, -c.ny * c.sp);
  else if (c.d > 330) c.mv(c.nx * c.sp, c.ny * c.sp);
  if (e.t1 <= 0) {
    const L = [...(F ? K.slice(0, 5 + c.ph) : K), "$", "$"],
      n = (e.k = (e.k || 0) + 1);
    let ak = L[rk(e, L.length)];
    if (ak == "$" && e.ls) ak = L[0];
    e.ls = ak == "$";
    if (ak == "$") sig(e, c, k);
    else AT2[ak][1](e, c, k);
    e.t1 = 2.2 - c.ph * 0.3 - (F ? 0.2 : 0) + rnd(0, 0.5);
    if (F && c.ph == 2 && Math.random() < 0.35) {
      const q = { x: rnd(120, 840), y: rnd(120, 480) };
      for (let X = 100; X < 870; X += 100)
        for (let Y = 100; Y < 520; Y += 100)
          if (Math.hypot(X - q.x, Y - q.y) > 115) tz(X, Y, 60, 1.6, e.dmg, k);
      flash("¡El suelo cede! Busca un refugio");
    }
    if (F && c.ph >= 1 && Math.random() < 0.2) {
      flash("¡Controles invertidos en 1 s!");
      later(e, 1, () => {
        P.invc = 3;
      });
    }
    e.vn = (e.vn ?? 3 + ((Math.random() * 3) | 0)) - 1;
    if (e.vn <= 0) {
      e.vn = 3 + ((Math.random() * 3) | 0);
      e.vul = 1.6;
      e.t1 = 1.6;
      flash(e.nm + " queda expuesto");
    }
  }
}
