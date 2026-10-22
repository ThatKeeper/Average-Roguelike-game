/* ======================================================================
 * src/js/ui/inventory.js
 * Comparación de objetos, tarjeta de objeto y ventana de inventario.
 *
 * Define:
 * cmp, card, inv
 * ====================================================================== */

function cmp(it) {
  const o = P.eq[it.s]?.st || {};
  return [...new Set([...Object.keys(it.st), ...Object.keys(o)])]
    .map((k) => {
      const d = Math.round(((it.st[k] || 0) - (o[k] || 0)) * 100) / 100;
      return d
        ? `<span style="color:${d > 0 ? "#8c8" : "#e66"}">${d > 0 ? "+" : ""}${fv(k, d)} ${N[k]}</span>`
        : "";
    })
    .join(" ");
}
function card(it, btns, cp) {
  const c = RC[it.r || 0],
    d = document.createElement("div");
  d.style.cssText = `border:2px solid ${c};border-radius:8px;padding:8px;width:165px;text-align:left;background:#1a1722;font-size:12px`;
  d.innerHTML = `${icoHTML(it)}<b style="color:${c}">${it.n}</b><br><small>${it.tp || SLOT[it.s]} · ${RN[it.r || 0]}</small><p style="margin:4px 0;font-size:11px">${it.d || ""}</p><small>${it.stx || stT(it.st || {})}</small>${
    it.req
      ? `<br><small style="color:${meets(it) ? "#8c8" : "#e66"}">Req: ${Object.entries(it.req)
          .map(([k, v]) => k.toUpperCase() + " " + v)
          .join(", ")}${meets(it) ? "" : " (no cumples)"}</small>`
      : ""
  }${cp ? `<br><small>vs equipado: ${cp}</small>` : ""}<br>`;
  btns.forEach((b) => {
    const e = document.createElement("button");
    e.textContent = b[0];
    e.disabled = !!b[2];
    e.style.cssText = "padding:3px 8px;margin:4px 3px 0 0;font-size:11px";
    e.onclick = b[1];
    d.appendChild(e);
  });
  return d;
}
function inv(f) {
  if (G.st != "play" || (G.ov && !G.pz)) return;
  if (G.iv && !f) {
    hide();
    return;
  }
  G.pz = 1;
  G.iv = 1;
  G.ov = 1;
  ov.style.display = "flex";
  const FL = G.ifl || "",
    SO = G.iso || "x",
    PS = 6,
    mkb = (t, fn, on) => {
      const e = document.createElement("button");
      e.textContent = t;
      e.style.cssText =
        "padding:4px 9px;font-size:12px;" + (on ? "background:#4a3d60;border-color:#fff" : "");
      e.onclick = fn;
      return e;
    },
    row = () => {
      const r = document.createElement("div");
      r.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;justify-content:center;max-width:96%";
      ov.appendChild(r);
      return r;
    };
  ov.innerHTML = `<h2>Inventario \u00b7 Oro ${P.gold}</h2><p>Nv ${P.lv} \u00b7 FUE ${P.a.str} DES ${P.a.dex} INT ${P.a.int} VIT ${P.a.vit} AGI ${P.a.agi} SUE ${P.a.luk} \u00b7 Vida ${P.mhp} \u00b7 Man\u00e1 ${P.mmp} \u00b7 Armadura ${P.arm.toFixed(0)} \u00b7 Cr\u00edtico ${(P.cc * 100).toFixed(0)}% \u00b7 Da\u00f1o \u00d7${(P.dm * P.edm).toFixed(2)}</p>`;
  let r = row();
  r.appendChild(mkb("Cerrar (I)", hide));
  ov.insertAdjacentHTML("beforeend", "<b>Equipado</b>");
  r = row();
  const w = P.w;
  r.appendChild(
    card(
      {
        i: WI[w.n] || "\u2694\ufe0f",
        n: w.n,
        s: "w",
        r: RN.indexOf(w.rn),
        d: `Da\u00f1o \u00d7${w.dmg}, cr\u00edtico ${Math.round(w.crit * 100)}%, escala con ${w.sc.toUpperCase()}`,
        st: {},
      },
      [],
    ),
  );
  for (const s in P.eq)
    r.appendChild(
      card(P.eq[s], [
        [
          "Desequipar",
          () => {
            P.bag.push(P.eq[s]);
            delete P.eq[s];
            ST();
            inv(1);
          },
        ],
      ]),
    );
  const L = P.bag
      .filter((it) => !FL || it.s == FL)
      .sort(
        SO == "r"
          ? (a, b) => (b.r || 0) - (a.r || 0) || a.n.localeCompare(b.n)
          : SO == "n"
            ? (a, b) => a.n.localeCompare(b.n)
            : SO == "s"
              ? (a, b) => a.s.localeCompare(b.s) || (b.r || 0) - (a.r || 0)
              : () => 0,
      ),
    pg = Math.min(G.ipg || 0, Math.max(0, Math.ceil(L.length / PS) - 1));
  ov.insertAdjacentHTML("beforeend", `<b>Mochila (${L.length}/${P.bag.length})</b>`);
  r = row();
  [
    ["", "Todo"],
    ...Object.keys(SLOT)
      .filter((k) => k != "w")
      .map((k) => [k, SLOT[k]]),
  ].forEach(([k, n]) =>
    r.appendChild(
      mkb(
        n,
        () => {
          G.ifl = k;
          G.ipg = 0;
          inv(1);
        },
        FL == k,
      ),
    ),
  );
  r = row();
  [
    ["x", "Recientes"],
    ["r", "Rareza"],
    ["n", "Nombre"],
    ["s", "Ranura"],
  ].forEach(([k, n]) =>
    r.appendChild(
      mkb(
        "Orden: " + n,
        () => {
          G.iso = k;
          G.ipg = 0;
          inv(1);
        },
        SO == k,
      ),
    ),
  );
  r = row();
  L.slice(pg * PS, pg * PS + PS).forEach((it) =>
    r.appendChild(
      card(
        it,
        [
          [
            "Equipar",
            () => {
              const i = P.bag.indexOf(it),
                o = P.eq[it.s];
              if (i < 0) return;
              P.bag.splice(i, 1);
              if (o) P.bag.push(o);
              P.eq[it.s] = it;
              ST();
              inv(1);
            },
            !meets(it),
          ],
          [
            "Descartar",
            () => {
              const i = P.bag.indexOf(it);
              if (i >= 0) P.bag.splice(i, 1);
              inv(1);
            },
          ],
        ],
        cmp(it),
      ),
    ),
  );
  if (L.length > PS) {
    r = row();
    const pv = mkb(
      "\u2039 Anterior",
      () => {
        G.ipg = pg - 1;
        inv(1);
      },
      0,
    );
    pv.disabled = pg <= 0;
    r.appendChild(pv);
    const nx = mkb(
      "Siguiente \u203a",
      () => {
        G.ipg = pg + 1;
        inv(1);
      },
      0,
    );
    nx.disabled = (pg + 1) * PS >= L.length;
    r.appendChild(nx);
    ov.insertAdjacentHTML(
      "beforeend",
      `<small>P\u00e1gina ${pg + 1}/${Math.ceil(L.length / PS)}</small>`,
    );
  }
}

