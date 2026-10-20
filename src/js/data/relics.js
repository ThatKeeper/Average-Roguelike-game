/* ======================================================================
 * src/js/data/relics.js
 * Catálogo de reliquias (RL).
 *
 * Define:
 * RL
 * ====================================================================== */

const RL = [
  ["Anillo de furia", "+12% daño", (p) => (p.dm *= 1.12)],
  ["Amuleto de vida", "+30 vida máx.", (p) => (p.bhp += 30)],
  ["Botas de viento", "+8% velocidad", (p) => (p.bsp += 0.08)],
  ["Ojo certero", "+8% crítico", (p) => (p.ccb += 0.08)],
  ["Hoja sedienta", "roba 1.5% del daño", (p) => (p.ls += 0.015)],
  [
    "Cristal arcano",
    "+25 maná, +2 regen.",
    (p) => {
      p.bmp += 25;
      p.bmr += 2;
    },
  ],
  ["Garra letal", "+0.4 mult. crítico", (p) => (p.cm += 0.4)],
  ["Coraza rúnica", "+10 armadura", (p) => (p.barm += 10)],
  ["Moneda de la suerte", "+5 Suerte", (p) => (p.a.luk += 5)],
  ["Brasas eternas", "tus golpes queman", (p) => (p.bn = 1)],
  ["Escarcha viva", "tus golpes ralentizan", (p) => (p.fz = 1)],
  [
    "Escudo torre",
    "+12 armadura, guardia reforzada",
    (p) => {
      p.barm += 12;
      p.gr = 1;
    },
  ],
  ["Vial de maná", "+3 regen. de maná", (p) => (p.bmr += 3)],
  ["Venas abiertas", "+4 acumulaciones máx. de hemorragia", (p) => (p.bl = (p.bl || 0) + 4)],
  ["Hoja envenenada", "tus golpes envenenan", (p) => (p.pzn = 1)],
  ["Resonancia carmesí", "los críticos detonan 50% de la hemorragia", (p) => (p.det = 1)],
];
