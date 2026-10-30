/* ======================================================================
 * src/js/data/spell-art.js
 * Arte de los 55 hechizos: motivo visual (v) y paleta (d oscuro, m medio, b brillante, c núcleo) de cada uno.
 * Los renderizadores de cada motivo están en render/spell-fx-*.js. Dos hechizos pueden compartir motivo
 * (tornado, semilla, ventisca...) pero cada uno tiene su paleta y sus variantes (llamas/hojas, escarcha/arena...).
 *
 * Define:
 * SPA, SPA_ICON
 * ====================================================================== */

// Clave del hechizo (elementos ordenados alfabéticamente, unidos con "+") -> { v: motivo, p: [d, m, b, c], sh: forma de chispa }
const SPA = {
  "fire": { v: "comet", p: ["#7a1d0c", "#ff6a13", "#ffb23a", "#fff6cf"], sh: 0 },
  "fire+ice": { v: "dual", p: ["#7a1d0c", "#ff6a13", "#ffb23a", "#fff6cf"], sh: 0 },
  "fire+light": { v: "sun", p: ["#c2701a", "#ffd24a", "#fff6b0", "#ffffff"], sh: 0 },
  "fire+water": { v: "geyser", p: ["#16367a", "#3a8dff", "#bfe8ff", "#ffffff"], sh: 2 },
  "fire+plant": { v: "wildfire", p: ["#8a2410", "#ff7a2a", "#ffd24a", "#fff4c2"], sh: 0 },
  "fire+wind": { v: "tornado", p: ["#7a1d0c", "#ff7a1a", "#ffc24a", "#fff4c2"], sh: 3 },
  "fire+rock": { v: "meteor", p: ["#4a3320", "#ff6a13", "#ffb23a", "#fff0c0"], sh: 0 },
  "dark+fire": { v: "wisps", p: ["#2a0f45", "#8a4bd6", "#ff6a2a", "#f3d9ff"], sh: 0 },
  "blood+fire": { v: "volcano", p: ["#5a0714", "#e0302a", "#ff9a3a", "#ffe0b0"], sh: 0 },
  "corr+fire": { v: "melt", p: ["#3a2a10", "#ff8a1a", "#c8e070", "#fff0b0"], sh: 2 },
  "ice": { v: "freeze", p: ["#1f4e8c", "#5cc8ff", "#bef0ff", "#ffffff"], sh: 0 },
  "ice+light": { v: "prism", p: ["#3a5fb0", "#bfe8ff", "#fff6b0", "#ffffff"], sh: 1 },
  "ice+water": { v: "rink", p: ["#16367a", "#3a8dff", "#a8e4ff", "#eaf8ff"], sh: 0 },
  "ice+plant": { v: "seed", p: ["#1f5a40", "#6fd9a0", "#bef0ff", "#eaffe8"], sh: 0 },
  "ice+wind": { v: "sand", p: ["#2c5f7a", "#cdf4ff", "#8fd8ff", "#ffffff"], sh: 0 },
  "ice+rock": { v: "stalac", p: ["#3a4658", "#9fb4c8", "#bef0ff", "#ffffff"], sh: 0 },
  "dark+ice": { v: "shock", p: ["#1a1040", "#6a5acd", "#bfa8ff", "#f0e8ff"], sh: 3 },
  "blood+ice": { v: "spikes", p: ["#5a0714", "#c0304a", "#ff9bb0", "#ffe0e8"], sh: 0 },
  "corr+ice": { v: "acid", p: ["#1f3a2a", "#8fd84a", "#bef0ff", "#f0ffd0"], sh: 2 },
  "light": { v: "beam", p: ["#c2701a", "#ffe45c", "#fff6b0", "#ffffff"], sh: 0 },
  "light+water": { v: "rainbow", p: ["#2a5fb0", "#8fd8ff", "#fff6b0", "#ffffff"], sh: 2 },
  "light+plant": { v: "meadow", p: ["#2f6a2a", "#a8e860", "#fff6b0", "#f4ffe0"], sh: 1 },
  "light+wind": { v: "ribbon", p: ["#3a7f8a", "#d8fff4", "#fff6b0", "#ffffff"], sh: 0 },
  "light+rock": { v: "crystals", p: ["#6a5a3a", "#e8d08a", "#fff6b0", "#ffffff"], sh: 0 },
  "dark+light": { v: "eclipse", p: ["#2a1450", "#c9a8ff", "#ffe45c", "#ffffff"], sh: 1 },
  "blood+light": { v: "rays", p: ["#7a1424", "#ff6a6a", "#ffe45c", "#fff0e0"], sh: 0 },
  "corr+light": { v: "bloom", p: ["#3a5a10", "#c8f05a", "#fff6b0", "#ffffff"], sh: 1 },
  "water": { v: "wave", p: ["#1b3f8f", "#4aa3ff", "#aafff5", "#ffffff"], sh: 2 },
  "plant+water": { v: "swamp", p: ["#1f5a3a", "#4cc58a", "#aafff5", "#e8ffe0"], sh: 2 },
  "water+wind": { v: "gale", p: ["#2c6b8f", "#a9e8ff", "#ffffff", "#ffffff"], sh: 2 },
  "rock+water": { v: "alluvium", p: ["#4a3320", "#8a6a4a", "#aafff5", "#d8e8f0"], sh: 0 },
  "dark+water": { v: "pull", p: ["#140a38", "#4a3fb0", "#6a8cff", "#c8d8ff"], sh: 3 },
  "blood+water": { v: "waves", p: ["#5a0714", "#c0304a", "#ff8aa0", "#ffe0e8"], sh: 2 },
  "corr+water": { v: "rain", p: ["#243300", "#8fd84a", "#aafff5", "#f0ffd0"], sh: 2 },
  "plant": { v: "seed", p: ["#1f5a22", "#4cc552", "#b8f58a", "#eaffc0"], sh: 0 },
  "plant+wind": { v: "tornado", p: ["#2f6b4a", "#6fd9a0", "#d8ffd0", "#ffffff"], sh: 3 },
  "plant+rock": { v: "spikes", p: ["#3b2a18", "#8a6a3a", "#9ad04a", "#d8f0a0"], sh: 0 },
  "dark+plant": { v: "bloom", p: ["#1a0a30", "#8a4bd6", "#c89cff", "#f0e0ff"], sh: 1 },
  "blood+plant": { v: "leech", p: ["#4a0a14", "#b8283c", "#7ed957", "#ffd0d0"], sh: 0 },
  "corr+plant": { v: "shrooms", p: ["#2a3a10", "#9acd32", "#d8f070", "#f0ffd0"], sh: 2 },
  "wind": { v: "slash", p: ["#2c6b8f", "#a9f0dd", "#e8fff8", "#ffffff"], sh: 1 },
  "rock+wind": { v: "sand", p: ["#6a4a2a", "#d8b878", "#f0e0a8", "#fff4d0"], sh: 0 },
  "dark+wind": { v: "shock", p: ["#150f38", "#6a7fd6", "#a9f0dd", "#e8e0ff"], sh: 3 },
  "blood+wind": { v: "blades", p: ["#5a0714", "#d3304a", "#ffb0b8", "#fff0f0"], sh: 0 },
  "corr+wind": { v: "cloud", p: ["#243300", "#8fd84a", "#d8ff8a", "#f0ffd0"], sh: 2 },
  "rock": { v: "boulder", p: ["#4a3320", "#a98a64", "#d8c098", "#fff0d0"], sh: 0 },
  "dark+rock": { v: "obelisk", p: ["#1a1030", "#6a5a8a", "#a888e8", "#e8d8ff"], sh: 3 },
  "blood+rock": { v: "quake", p: ["#3a1a14", "#c0304a", "#ff8a8a", "#ffd8d0"], sh: 0 },
  "corr+rock": { v: "melt", p: ["#2a3a10", "#8a9a3a", "#c8e070", "#f0ffd0"], sh: 2 },
  "dark": { v: "shade", p: ["#1a0a30", "#8a4bd6", "#c89cff", "#f0e0ff"], sh: 3 },
  "blood+dark": { v: "ritual", p: ["#2a0614", "#a8123a", "#ff5a7a", "#ffd0d8"], sh: 0 },
  "corr+dark": { v: "swarm", p: ["#1a0f2a", "#7a4fb0", "#9acd32", "#e0ffa0"], sh: 0 },
  "blood": { v: "heart", p: ["#3a0510", "#d3182f", "#ff7a8a", "#ffd8dc"], sh: 0 },
  "blood+corr": { v: "plague", p: ["#3a1020", "#a8283c", "#9acd32", "#e0ffa0"], sh: 0 },
  "corr": { v: "acid", p: ["#243300", "#8fd84a", "#d8ff8a", "#f0ffd0"], sh: 2 },
};
// Clave de hechizo -> id del icono de 96 px (src/assets/spells/<id>.png): "fire+ice" -> "fire_ice"
const SPA_ICON = (k) => k.replace("+", "_");
