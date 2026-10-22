/* ======================================================================
 * src/js/ui/controls-menu.js
 * Menú para reasignar teclas.
 *
 * Define:
 * ctrls
 * ====================================================================== */

function ctrls() {
  const L = {
    up: "Arriba",
    down: "Abajo",
    left: "Izquierda",
    right: "Derecha",
    q: "Habilidad Q",
    e: "Habilidad E",
    r: "Acción R",
    dodge: "Esquivar",
    inv: "Inventario",
    map: "Mapa",
    use: "Interactuar",
    c1: "Carta 1 (Mago)",
    c2: "Carta 2 (Mago)",
    c3: "Carta 3 (Mago)",
    c4: "Carta 4 (Mago)",
    book: "Cartas de hechizo (Mago)",
    tal: "Talentos",
  };
  show(
    "<h2>Controles</h2><p>Pulsa una acción y luego la nueva tecla (Esc cancela)</p>",
    Object.keys(L)
      .map((k) => ({
        t: `${L[k]}: ${G.rb == k ? "..." : KY[k]}`,
        nc: 1,
        f: () => {
          G.rb = k;
          ctrls();
        },
      }))
      .concat([
        {
          t: "Restablecer",
          nc: 1,
          f: () => {
            Object.assign(KY, KD);
            S.keys = KY;
            save();
            ctrls();
          },
        },
        { t: "Volver", nc: 1, f: menu },
      ]),
  );
}

