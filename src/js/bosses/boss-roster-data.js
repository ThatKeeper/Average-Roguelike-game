/* ======================================================================
 * src/js/bosses/boss-roster-data.js
 * Ficha de los 32 jefes hechos a mano (índices 12-43): nombre, color, tamaño y vida relativa.
 * Su comportamiento, sus ataques y su dibujo están en boss-roster-*.js; el bioma de cada uno, en boss-core.js (BIO_N / BIO_F).
 *
 * Define:
 * (añade las entradas 12-43 a BD)
 * ====================================================================== */

;[
  // ---- normales ----
  ["Karg, Rompehuesos", "#c9b99a", 36, 1.15], // 12 · Catacumbas
  ["Ilmara, la Tejedora", "#d7a6ff", 24, 0.85], // 13 · Bosque subterráneo
  ["Bruk, Devorador de Rocas", "#a8864f", 40, 1.3], // 14 · Minas abandonadas
  ["Seraphine Ceniza", "#b9b2c4", 26, 0.85], // 15 · Catacumbas
  ["Orlo, Guardián del Pozo", "#5d8aa8", 34, 1.2], // 16 · Minas abandonadas
  ["Tamsin, Voz Hueca", "#9fe0ff", 24, 0.8], // 17 · Criptas malditas
  ["Grendal el Podrido", "#8fbf4a", 38, 1.3], // 18 · Bosque subterráneo
  ["Aska, Lanza Tormenta", "#ffe14a", 26, 0.9], // 19 · Cavernas de lava
  ["Pyrrus, Alma de Brasa", "#ff7a2a", 26, 0.85], // 20 · Cavernas de lava
  ["Zhul, Sacerdote Oxidado", "#c46a2e", 30, 1.0], // 21 · Criptas malditas
  ["Morwen, Cazadora Pálida", "#dfe8f5", 24, 0.85], // 22 · Abismos helados
  ["Dagon, Marea Negra", "#2a5ea0", 38, 1.25], // 23 · Dimensión corrupta
  ["Eriks, Caballero Hueco", "#8fa0b8", 30, 1.1], // 24 · Catacumbas
  ["Lyssa, Reina Araña", "#9a3fbf", 30, 1.0], // 25 · Bosque subterráneo
  ["Voss, Hereje Carmesí", "#d01c3c", 26, 0.9], // 26 · Criptas malditas
  ["Thorn, Madre de Espinas", "#4fbf5a", 34, 1.2], // 27 · Bosque subterráneo
  ["Cael, Heraldo Gélido", "#bfeaff", 28, 1.0], // 28 · Abismos helados
  ["Nuru, Ojo del Desierto", "#e8c15a", 30, 1.0], // 29 · Dimensión corrupta
  ["Brann, Forjador Maldito", "#e0642a", 34, 1.2], // 30 · Cavernas de lava
  ["Quill, el Archivista", "#7c8cff", 24, 0.85], // 31 · Ruinas arcanas
  ["Ymir Menor", "#7fc8e8", 42, 1.4], // 32 · Abismos helados
  ["Sable, Sombra Errante", "#4a3c6a", 24, 0.9], // 33 · Dimensión corrupta
  // ---- finales ----
  ["Aeon, Rey Ceniciento", "#bdb0a0", 34, 2.1], // 34 · Criptas malditas
  ["Kharon, Barquero del Vacío", "#5cc7b8", 32, 2.1], // 35 · Dimensión corrupta
  ["Tiamat Quebrada", "#4fae78", 40, 2.3], // 36 · Bosque subterráneo
  ["Omega, Autómata Final", "#9aa6b8", 36, 2.2], // 37 · Cavernas de lava
  ["Nyarl, Pesadilla Coronada", "#c04fd8", 34, 2.1], // 38 · Dimensión corrupta
  ["Solaris, Sol Caído", "#ffb02e", 36, 2.2], // 39 · Cavernas de lava
  ["Mordrake, Emperador Hueso", "#e6dcc0", 38, 2.3], // 40 · Criptas malditas
  ["Abyssia, Madre Abismal", "#3f8f9f", 40, 2.3], // 41 · Bosque subterráneo
  ["Ragnarok Encadenado", "#d4502a", 42, 2.4], // 42 · Cavernas de lava
  ["Eterna, la Última Sombra", "#6a5aa8", 36, 2.3], // 43 · Dimensión corrupta
].forEach(([n, c, r, hp], j) => (BD[12 + j] = { n, c, r, hp, sh: 0 }));
