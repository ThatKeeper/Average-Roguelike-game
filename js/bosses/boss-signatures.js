/* ======================================================================
 * src/js/bosses/boss-signatures.js
 * Diseño propio de cada jefe nuevo: firma única (geometría × parámetros), rasgos pasivos, combos y satélites.
 *
 * Define:
 * SNM, TRN, TI, TF, SG, mkSig, SIG, sig
 * ====================================================================== */

// ===== DISENO PROPIO: cada jefe nuevo = firma unica (geometria x parametros) + rasgo unico + combo propio + satelites =====
const SNM = [
  "Puño sísmico",
  "Telar de hilos",
  "Alud de roca",
  "Ceniza danzante",
  "Pozo sin fondo",
  "Canto hueco",
  "Brote pútrido",
  "Lanza del trueno",
  "Corona de brasas",
  "Óxido sagrado",
  "Caza pálida",
  "Marea negra",
  "Juramento roto",
  "Red de araña",
  "Sermón carmesí",
  "Zarzal viviente",
  "Ventisca ritual",
  "Espejismo ardiente",
  "Yunque maldito",
  "Índice prohibido",
  "Eco helado",
  "Paso en sombras",
  "Réquiem de ceniza",
  "Travesía del vacío",
  "Aliento quebrado",
  "Protocolo final",
  "Corona de pesadillas",
  "Eclipse caído",
  "Trono de huesos",
  "Vientre abismal",
  "Cadenas del fin",
  "Última noche",
];
const TRN = [
    "Furia veloz (más rápido bajo 50% de vida)",
    "Aura abrasadora",
    "Estela ardiente",
    "Pulso de proyectiles",
    "Cría esbirros",
    "Parpadeo",
    "Buscador teledirigido",
    "Meteoros",
  ],
  TI = [99, 3, 0.7, 6, 14, 9, 7, 3.5];
const TF = [
  () => {},
  (e, c, k) => tz(e.x, e.y, 75, 0.8, e.dmg * 0.7, k),
  (e, c, k) => {
    if (c.d > 40) tz(e.x, e.y, 30, 1, e.dmg * 0.6, k);
  },
  (e, c, k) => brs(e, 10, 170, e.dmg * 0.4, 0, 0, k),
  (e, c, k) => {
    e.mn = (e.mn || []).filter((q) => q.hp > 0 && !q.dead);
    if (e.mn.length < 3) {
      const q = spawn("runner", e.x + rnd(-80, 80), e.y + 60);
      q.minion = 1; // invocado: sin oro ni XP
      q.al = 1;
      e.mn.push(q);
    }
  },
  (e, c, k) => {
    tp(e, 200);
    tz(e.x, e.y, 100, 0.7, e.dmg, k);
  },
  (e, c, k) => bt(e, c.a, 200, e.dmg * 0.6, 0, k, 1.5),
  (e, c, k) => tz(P.x + rnd(-60, 60), P.y + rnd(-60, 60), 44, 1, e.dmg, k),
];
const SG = [
  (e, c, k, p) => {
    for (let j = 0; j < p.reps; j++)
      later(e, j * 0.4, () => brs(e, p.n, p.spd, e.dmg * 0.5, j * 0.5, j % 2 ? 0.5 : -0.5, k));
  },
  (e, c, k, p) => {
    const ar = Math.max(3, p.n >> 1);
    for (let s = 0; s < 5; s++)
      later(e, s * 0.25, () => {
        for (let a = 0; a < ar; a++) {
          const an = c.a + s * 0.35 + (a * 6.283) / ar;
          for (let r = 1; r <= 6; r++)
            tz(e.x + Math.cos(an) * r * 70, e.y + Math.sin(an) * r * 70, 34, 0.7, e.dmg, k);
        }
      });
  },
  (e, c, k, p) => {
    const g = (Math.random() * 10) | 0,
      d = p.reps % 2 ? 1 : -1;
    for (let j = 0; j < 12; j++)
      if (Math.abs(j - g) > 1)
        later(e, j * 0.12, () => {
          const X = d > 0 ? 90 + j * 70 : 860 - j * 70;
          for (let Y = 100; Y <= 520; Y += 105) tz(X, Y, 38, 0.9, e.dmg, k);
        });
  },
  (e, c, k, p) => {
    for (let q = 0; q < 2; q++)
      later(e, q * 1.1, () => {
        const a = ang(e, P);
        e.wd = 0.5;
        for (let s = 1; s <= 8; s++)
          tz(e.x + Math.cos(a) * s * 80, e.y + Math.sin(a) * s * 80, 36, 0.9 + s * 0.05, e.dmg, k);
        later(e, 0.6, () => dsh(e, 0.35, 600));
      });
  },
  (e, c, k, p) => {
    for (let ph = 0; ph < 2; ph++)
      for (let X = 90; X <= 870; X += 110)
        for (let Y = 100; Y <= 520; Y += 105)
          if (((((X - 90) / 110) | 0) + (((Y - 100) / 105) | 0)) % 2 == ph)
            tz(X, Y, 42, 1.1 + ph * 1, e.dmg, k);
  },
  (e, c, k, p) => {
    [220, 150, 80].forEach((R_, j) =>
      later(e, j * 0.5, () => {
        for (let a = 0; a < 8 + (p.n % 3) * 2; a++) {
          const an = (a * 6.283) / (8 + (p.n % 3) * 2);
          tz(P.x + Math.cos(an) * R_, P.y + Math.sin(an) * R_, 40, 0.8, e.dmg, k);
        }
      }),
    );
  },
  (e, c, k, p) => {
    for (let j = 0; j < p.reps; j++)
      later(e, j * 0.45, () => {
        const a = ang(e, P);
        for (let i = 0; i < p.n; i++)
          bt(e, a + (i - (p.n - 1) / 2) * 0.09, p.spd + j * 40, e.dmg * 0.5, 0, k);
      });
  },
  (e, c, k, p) => {
    for (let j = 0; j < p.reps; j++)
      later(e, j * 0.5, () => {
        const o = Math.random() * 6.28,
          m = 12 + p.n;
        for (let i = 0; i < m; i++)
          if ((i + j) % 5 > 1) bt(e, o + (i * 6.283) / m, p.spd, e.dmg * 0.45, 0, k);
      });
  },
];
function mkSig(i) {
  const j = i - 12,
    r = rngS(i * 131 + 7);
  return {
    nm: SNM[j],
    kd: j % 8,
    tr: (j * 5 + (j >> 3)) % 8,
    n: 6 + ((r() * 8) | 0),
    reps: 2 + ((r() * 3) | 0),
    spd: 150 + ((r() * 120) | 0),
    cb: (j * 3 + 1) % 5,
  };
}
const SIG = {};
function sig(e, c, k) {
  const p = SIG[e.bi],
    q = c.ph == 2 && FIN(e.bi) ? { ...p, reps: p.reps + 1, n: p.n + 2 } : p;
  flash("«" + p.nm + "»");
  SG[p.kd](e, c, k, q);
  const K = KIT[e.bi];
  later(e, 1.1, () => AT2[K[p.cb]][1](e, c, k));
}
for (let i = 12; i < 44; i++) {
  SIG[i] = mkSig(i);
  const F = i >= 34,
    r = rngS(i * 7919 + 13),
    ks = Object.keys(AT2)
      .map((v) => [r(), v])
      .sort((a, b) => a[0] - b[0])
      .map((a) => a[1])
      .slice(0, F ? 7 : 5);
  KIT[i] = ks;
  BD.push({
    n: NN[i - 12],
    c: PAL[i % 12],
    r: F ? 32 + (i % 3) * 2 : 22 + ((i * 5) % 12),
    hp: F ? 2 + (i % 3) * 0.15 : 0.8 + ((i * 7) % 6) * 0.1,
    sh: i % 6,
  });
  BO.push({ up: kitUp });
  BDS.push(
    (F ? "Jefe final de 3 fases. " : "") +
      "Firma «" +
      SIG[i].nm +
      "» · Rasgo: " +
      TRN[SIG[i].tr] +
      " · Ataques: " +
      ks.map((k) => AT2[k][0]).join(", ") +
      (F ? ". Fase 3: el suelo cede y los controles se invierten." : "."),
  );
}

