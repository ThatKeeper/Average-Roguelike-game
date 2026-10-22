/* ======================================================================
 * src/js/data/enemy-types.js
 * Catálogo de tipos de enemigo (ET).
 *
 * Define:
 * ET
 * ====================================================================== */

const ET = {
  grunt: { hp: 40, sp: 70, dm: 8, r: 13, c: "#b55", ai: "melee" },
  runner: { hp: 25, sp: 125, dm: 7, r: 10, c: "#e94", ai: "flank" },
  archer: { hp: 28, sp: 60, dm: 7, r: 11, c: "#9c6", ai: "range" },
  mage: { hp: 30, sp: 55, dm: 12, r: 11, c: "#a6f", ai: "cast", res: { p: 0, m: 0.4 } },
  tank: { hp: 130, sp: 42, dm: 16, r: 20, c: "#789", ai: "melee", res: { p: 0.4 } },
  bomber: { hp: 22, sp: 105, dm: 30, r: 11, c: "#fb3", ai: "bomb" },
  summoner: { hp: 45, sp: 50, dm: 0, r: 12, c: "#6cf", ai: "sum" },
  guardian: { hp: 60, sp: 60, dm: 9, r: 14, c: "#4a8", ai: "shield" },
  stalker: { hp: 38, sp: 80, dm: 14, r: 12, c: "#d4a", ai: "leap" },
  elite: { hp: 220, sp: 70, dm: 15, r: 18, c: "#f44", ai: "elite" },
  boss: { hp: 1000, sp: 55, dm: 14, r: 34, c: "#ff2d6a", ai: "boss", res: { p: 0.15, m: 0.15 } },
};

