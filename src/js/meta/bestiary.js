/* ======================================================================
 * src/js/meta/bestiary.js
 * Ventana del bestiario.
 *
 * Define:
 * bestMenu
 * ====================================================================== */

function bestMenu() {
  const F = G.bf || 0,
    L = [
      ...Object.keys(ET)
        .filter((k) => !["decoy", "orb", "boss", "dummy"].includes(k))
        .map((k) => ({ k, b: 0 })),
      ...BD.map((b, i) => ({ k: "b" + i, i, b: 1 })),
    ]
      .filter((e) => !F || (F == 1 ? !e.b : e.b))
      .filter(
        (e) => !G.bq || (S.bk[e.k] && (e.b ? BD[e.i].n : SN[e.k]).toLowerCase().includes(G.bq)),
      ),
    d = nBk();
  show(
    `<h2>Bestiario ${Math.round((d / TOT()) * 100)}%</h2><p>${d}/${TOT()} descubiertos. Derrota a un enemigo para revelar su ficha.</p>`,
    [
      {
        t: "Filtro: " + ["Todos", "Enemigos", "Jefes"][F],
        nc: 1,
        f: () => {
          G.bf = (F + 1) % 3;
          bestMenu();
        },
      },
      {
        t: "Buscar: " + (G.bq || "(todo)"),
        nc: 1,
        f: () => {
          G.bq = (prompt("Buscar entre los descubiertos (vacío = todo)", "") || "")
            .trim()
            .toLowerCase();
          bestMenu();
        },
      },
    ]
      .concat(
        L.map((e) => {
          const n = S.bk[e.k],
            z = { nc: 1, dis: 1, f: () => {} };
          if (!n)
            return {
              ...z,
              i: "❔",
              n: "???",
              tp: e.b ? "Jefe" : "Enemigo",
              r: 0,
              d: "Aún no descubierto.",
            };
          if (e.b) {
            const b = BD[e.i];
            return {
              ...z,
              i: `<span style="color:${b.c}">◆</span>`,
              n: b.n,
              tp: FIN(e.i) ? "Jefe final" : "Jefe",
              r: FIN(e.i) ? 3 : 1,
              d: BDS[e.i],
              stx: `Derrotado ${n}× · Profundidad ${bossDepth(e.i)}`,
            };
          }
          const T = ET[e.k],
            a = AT[T.ai];
          return {
            ...z,
            i: ET_I[e.k],
            n: SN[e.k],
            tp: a[0],
            r: e.k == "elite" ? 2 : 0,
            d: a[1] + " Consejo: " + a[2],
            stx:
              `Vida base ${T.hp} · Daño base ${T.dm} · Vel ${T.sp}` +
              (T.res
                ? " · Res. " +
                  Object.entries(T.res)
                    .filter((v) => v[1])
                    .map(([k, v]) => (k == "p" ? "físico " : "mágico ") + v * 100 + "%")
                    .join(", ")
                : "") +
              ` · Derrotado ${n}×`,
          };
        }),
      )
      .concat([{ t: "Volver", nc: 1, f: menu }]),
  );
}

