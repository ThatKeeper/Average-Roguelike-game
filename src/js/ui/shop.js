/* ======================================================================
 * src/js/ui/shop.js
 * Mercader: comprar (el equipo se equipa al instante), vender y "vender todos los comunes".
 * Nivel oculto del mercader según las compras totales: 10 compras → nivel 2 (4 objetos), 20 → nivel 3 (5 objetos).
 *
 * Define:
 * merchLv, shopStock, shop
 * ====================================================================== */

const merchLv = () => 1 + (st("sh") >= 10 ? 1 : 0) + (st("sh") >= 20 ? 1 : 0);

// Objetos a la venta: arma, equipo y reliquia (nivel 1) + 1 pieza más por nivel (equipo, luego tomo).
function shopStock() {
  const ra = lootRa(),
    k = 1 + 0.1 * G.d,
    rel = [...RL.keys()].sort(() => Math.random() - 0.5),
    L = [
      [lootWeapon(ra), [80, 110, 170, 260]],
      [lootGear(), [60, 100, 160, 250]],
      [lootRelic(RL[rel[0]], Math.min(rcap(), 1 + (Math.random() < 0.5 ? 1 : 0))), [130, 130, 190, 260]],
      [lootGear(), [60, 100, 160, 250]],
      [lootTome(ra), [90, 120, 180, 270]],
    ].slice(0, 2 + merchLv());
  return L.map(([o, pr]) => Object.assign(o, { c: Math.round(pr[o.r || 0] * k) }));
}

function shop(r) {
  const stock = r.stock || (r.stock = shopStock()),
    pots = [
      ["hp", 30],
      ["mp", 30],
    ];
  let tab = G.shtab || "b",
    sel = -1,
    confirm = 0;
  const E_ = (t, c, h) => {
      const e = document.createElement(t);
      if (c) e.className = c;
      if (h !== undefined) e.innerHTML = h;
      return e;
    },
    btn = (t, fn, dis, on) => {
      const e = E_("button", on ? "on" : "", t);
      e.disabled = !!dis;
      e.onclick = fn;
      return e;
    },
    commons = () =>
      P.bag.map((it, i) => (it && !it.cons && !it.fav && !(it.r > 0) ? i : -1)).filter((i) => i >= 0),
    render = () => {
      G.shtab = tab;
      G.ov = 1;
      G.pz = 1;
      ov.style.display = "flex";
      ov.innerHTML = "";
      const w = E_("div", "sh");
      ov.appendChild(w);
      w.appendChild(E_("h2", "", `Mercader · ${P.gold} 🪙`));
      const tb = E_("div", "sh-tabs");
      tb.appendChild(btn("Comprar", () => ((tab = "b"), render()), 0, tab == "b"));
      tb.appendChild(btn("Vender", () => ((tab = "s"), (sel = -1), (confirm = 0), render()), 0, tab == "s"));
      tb.appendChild(btn("Salir", hide));
      w.appendChild(tb);
      if (tab == "b") {
        const l = E_("div", "sh-list");
        pots.forEach(([k, c0]) => {
          const p = POT[k],
            c = Math.round(c0 * (1 + 0.1 * G.d)),
            it = newPotion(k);
          l.appendChild(
            card(Object.assign({}, it, { stx: `En mochila: ${potCount(k)}` }), [
              [
                `${c} 🪙`,
                () => {
                  if (P.gold < c) return flash("Oro insuficiente");
                  if (bagFree() < 0 && !P.bag.some((b) => b && b.cons == k && b.q < POT_MAX)) return flash("Mochila llena");
                  P.gold -= c;
                  bagAdd(newPotion(k));
                  cnt("sh");
                  chk();
                  render();
                },
                P.gold < c,
              ],
            ]),
          );
        });
        stock.forEach((x) => {
          if (x.sold) {
            l.appendChild(card({ i: "✔️", n: "(vendido)", tp: "—", r: 0, d: "" }, []));
            return;
          }
          l.appendChild(
            card(
              { i: x.i, n: x.n, tp: x.tp, r: x.r || 0, d: x.d, stx: x.stx || (x.st ? stT(x.st) : ""), st: x.st, req: x.req, s: x.s },
              [
                [
                  `${x.c} 🪙`,
                  () => {
                    if (P.gold < x.c) return flash("Oro insuficiente");
                    P.gold -= x.c;
                    x.sold = 1;
                    cnt("sh");
                    chk();
                    x.f();
                    if (x.r >= 2) {
                      lootSnd(x.r);
                      lootFX(P.x, P.y, x.r);
                    }
                    render();
                  },
                  P.gold < x.c,
                ],
              ],
              x.cp,
            ),
          );
        });
        w.appendChild(l);
        w.appendChild(E_("small", "", "El equipo comprado se equipa directamente; lo que sustituye pasa a tu mochila."));
        return;
      }
      // ---- vender ----
      const sw = E_("div", "sh-sell"),
        grid = E_("div", "iv-grid"),
        side = E_("div", "iv-info");
      P.bag.forEach((it, i) => {
        const e = mkSlot(it);
        if (i == sel) e.classList.add("sel");
        if (it) e.onclick = () => ((sel = i), (confirm = 0), render());
        grid.appendChild(e);
      });
      sw.appendChild(grid);
      const it = P.bag[sel];
      if (it) {
        const v = sellValue(it) * (it.cons ? it.q : 1);
        side.style.borderColor = RC[it.r || 0];
        side.innerHTML = `<div class="ih">${icoHTML(it, 40)}<div><b style="color:${RC[it.r || 0]}">${it.fav ? "★ " : ""}${it.n}${it.cons ? " ×" + it.q : ""}</b><br><small>${itemKind(it)} · ${RN[it.r || 0]}</small></div></div><p>${it.d || ""}</p><small>${it.stx || stT(it.st || {})}</small>`;
        const ab = E_("div", "ia");
        ab.appendChild(
          btn(
            it.fav ? "Es favorito" : `Vender (+${v} 🪙)`,
            () => {
              P.gold += v;
              P.bag[sel] = null;
              sel = -1;
              snd(900, 0.08, "triangle", 0.04);
              render();
            },
            it.fav,
          ),
        );
        ab.appendChild(
          btn(it.fav ? "★ Quitar favorito" : "☆ Favorito", () => (toggleFav(it), render()), 0, it.fav),
        );
        side.appendChild(ab);
      } else side.innerHTML = "<small>Toca un objeto de tu mochila para venderlo. Los favoritos (★) y el equipo puesto no se venden.</small>";
      sw.appendChild(side);
      w.appendChild(sw);
      const cm = commons(),
        tot = cm.reduce((a, i) => a + sellValue(P.bag[i]), 0),
        bar = E_("div", "iv-bar");
      bar.appendChild(
        btn(
          cm.length ? `Vender todos los comunes (+${tot} 🪙)` : "No tienes comunes para vender",
          () => ((confirm = 1), render()),
          !cm.length,
        ),
      );
      w.appendChild(bar);
      if (confirm && cm.length) {
        const pv = E_("div", "sh-prev");
        pv.innerHTML = `<b>Vista previa de la venta</b><ul>${cm
          .map((i) => `<li>${P.bag[i].n} — ${sellValue(P.bag[i])} 🪙</li>`)
          .join("")}</ul><b>${cm.length} objeto(s) → +${tot} 🪙</b> <small>(los favoritos y los consumibles se conservan)</small>`;
        const ab = E_("div", "ia");
        ab.appendChild(
          btn(`Confirmar: +${tot} 🪙`, () => {
            const c2 = commons();
            P.gold += c2.reduce((a, i) => a + sellValue(P.bag[i]), 0);
            c2.forEach((i) => (P.bag[i] = null));
            confirm = 0;
            sel = -1;
            snd(1000, 0.12, "triangle", 0.05);
            render();
          }),
        );
        ab.appendChild(btn("Cancelar", () => ((confirm = 0), render())));
        pv.appendChild(ab);
        w.appendChild(pv);
      }
    };
  render();
}
