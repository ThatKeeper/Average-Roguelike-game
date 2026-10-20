/* ======================================================================
 * src/js/ui/spell-book.js
 * Ventana del grimorio: arrastrar y soltar cartas (ratón y táctil).
 *
 * Define:
 * slotAt, drop, dragify, book
 * ====================================================================== */

// ---- ventana de cartas: arrastrar (ratón y táctil) o tocar carta y luego espacio ----
function slotAt(ev) {
  const el = document.elementFromPoint(ev.clientX, ev.clientY),
    s = el && el.closest && el.closest("[data-slot]");
  return s ? +s.dataset.slot : -1;
}
function drop(k, s, from) {
  if (s >= 0) {
    if (!S.cards.unlocked[k]) flash("Carta bloqueada");
    else equipCard(k, s);
  } else if (from >= 0) unequipCard(from);
  book(1);
}
function dragify(el, k, from) {
  el.style.touchAction = "none";
  el.onpointerdown = (e) => {
    const sx = e.clientX,
      sy = e.clientY;
    let g = null;
    const mv = (ev) => {
        if (!g && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 6) {
          g = el.cloneNode(true);
          g.style.cssText += ";position:fixed;pointer-events:none;opacity:.85;z-index:99";
          ov.appendChild(g);
          el.style.opacity = 0.4;
        }
        if (g) {
          g.style.left = ev.clientX - 60 + "px";
          g.style.top = ev.clientY - 40 + "px";
        }
      },
      up = (ev) => {
        window.removeEventListener("pointermove", mv);
        window.removeEventListener("pointerup", up);
        if (g) {
          g.remove();
          el.style.opacity = 1;
          drop(k, slotAt(ev), from);
        } else {
          G.csel = k;
          book(1);
        }
      };
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
  };
}
function book(f) {
  if (G.st != "play" || !P || P.cls != "g" || (G.ov && !G.bk)) return;
  if (G.bk && !f) {
    hide();
    return;
  }
  G.bk = 1;
  G.pz = 1;
  G.ov = 1;
  ov.style.display = "flex";
  const FL = G.cel || "",
    PS = 6,
    mkb = (t, fn, on, c) => {
      const e = document.createElement("button");
      e.textContent = t;
      e.style.cssText =
        `padding:4px 9px;font-size:12px;border-color:${c || "#c9a24a"};` +
        (on ? "background:#4a3d60;border-color:#fff" : "");
      e.onclick = fn;
      return e;
    },
    row = () => {
      const r = document.createElement("div");
      r.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;justify-content:center;max-width:96%";
      ov.appendChild(r);
      return r;
    };
  ov.innerHTML = `<h2>Cartas de hechizo</h2><p>Arrastra una carta desbloqueada a un espacio, o toca la carta y luego el espacio. Se lanzan con las teclas 1\u20134. Lo desbloqueado es permanente.</p>`;
  let r = row();
  r.appendChild(mkb("Cerrar (B)", hide));
  r = row();
  for (let i = 0; i < 4; i++) {
    const k = S.cards.slots[i],
      d = document.createElement("div");
    d.dataset.slot = i;
    d.style.cssText = `min-width:118px;min-height:58px;border:2px ${k ? "solid" : "dashed"} ${k ? EL[CARDS[k].a].c : "#888"};border-radius:8px;padding:6px;font-size:12px;background:#1a1722;${G.csel && !k ? "box-shadow:0 0 8px #fff8" : ""}`;
    d.innerHTML = `<small>Espacio ${i + 1} \u00b7 tecla ${KL(KY["c" + (i + 1)])}</small><br><b>${k ? CARDS[k].n : "(vac\u00edo)"}</b>`;
    d.onclick = () => {
      if (G.csel && equipCard(G.csel, i)) {
        G.csel = null;
        book(1);
      } else if (!G.csel && k) {
        unequipCard(i);
        book(1);
      }
    };
    if (k) dragify(d, k, i);
    r.appendChild(d);
  }
  ov.insertAdjacentHTML(
    "beforeend",
    `<small>${G.csel ? "Seleccionada: " + CARDS[G.csel].n + " \u2192 toca un espacio" : "Toca un espacio ocupado para vaciarlo"}</small>`,
  );
  r = row();
  [["", "Todas"], ["*", "Desbloqueadas"], ...Object.keys(EL).map((k) => [k, EL[k].n])].forEach(
    ([k, n]) =>
      r.appendChild(
        mkb(
          n,
          () => {
            G.cel = k;
            G.cpg = 0;
            book(1);
          },
          FL == k,
          EL[k] && EL[k].c,
        ),
      ),
  );
  const L = CORDER.filter(
      (k) => !FL || (FL == "*" ? S.cards.unlocked[k] : CARDS[k].a == FL || CARDS[k].b == FL),
    ),
    pg = Math.min(G.cpg || 0, Math.max(0, Math.ceil(L.length / PS) - 1)),
    un = CORDER.filter((k) => S.cards.unlocked[k]).length;
  ov.insertAdjacentHTML("beforeend", `<b>Colecci\u00f3n: ${un}/${CORDER.length} desbloqueadas</b>`);
  r = row();
  L.slice(pg * PS, pg * PS + PS).forEach((k) => {
    const c = CARDS[k],
      e = EL[c.a],
      u = !!S.cards.unlocked[k],
      sp = build(c.a, c.b, c.f),
      sl = S.cards.slots.indexOf(k),
      d = document.createElement("div");
    d.style.cssText = `width:170px;text-align:left;border:2px solid ${u ? e.c : "#555"};border-radius:10px;padding:8px;font-size:12px;background:linear-gradient(160deg,#1a1722,${e.c}33);${u ? "" : "opacity:.72;"}${G.csel == k ? "box-shadow:0 0 10px #fff;" : ""}`;
    d.innerHTML =
      `<b style="color:${e.c}">${c.n}</b><br><small>${EL[c.a].n}${c.b ? " + " + EL[c.b].n : ""} \u00b7 ${FN[sp.f]}</small><p style="margin:4px 0;font-size:11px">${c.b ? CB[k].d : e.d}</p><small>Coste ${Math.ceil(sp.cost)} \u00b7 Enfr. ${sp.cd.toFixed(1)}s \u00b7 Da\u00f1o ${Math.round(sp.dmg)} \u00b7 Radio ${Math.round(sp.r)}</small><br>` +
      (u
        ? `<small style="color:#8c8">${sl >= 0 ? "EQUIPADA (espacio " + (sl + 1) + ")" : "Desbloqueada"}</small>`
        : `<small style="color:#e88">BLOQUEADA \u2014 requisitos:</small>${c.req.map((q) => `<br><small style="color:${reqOK(q) ? "#8c8" : "#e88"}">${reqOK(q) ? "\u2713" : "\u2717"} ${reqTxt(q)}</small>`).join("")}`);
    if (u) dragify(d, k, -1);
    else
      d.onclick = () => {
        G.csel = null;
        flash(
          "Bloqueada: " +
            c.req
              .filter((q) => !reqOK(q))
              .map(reqTxt)
              .join(" \u00b7 "),
        );
      };
    r.appendChild(d);
  });
  if (L.length > PS) {
    r = row();
    const pv = mkb(
      "\u2039 Anterior",
      () => {
        G.cpg = pg - 1;
        book(1);
      },
      0,
    );
    pv.disabled = pg <= 0;
    r.appendChild(pv);
    const nx = mkb(
      "Siguiente \u203a",
      () => {
        G.cpg = pg + 1;
        book(1);
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
