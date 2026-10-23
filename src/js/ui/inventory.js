/* ======================================================================
 * src/js/ui/inventory.js
 * Comparación de objetos, tarjeta de objeto y ventana de inventario por slots
 * (personaje con equipo, 32 casillas, favoritos, papelera, arrastrar y atajos).
 *
 * Define:
 * cmp, card, mkSlot, invSort, drawDoll, inv
 * ====================================================================== */

function cmp(it) {
  if (!it.st || it.cons || it.s == "w") return "";
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
  d.className = it.fav ? "cfav" : "";
  d.style.cssText = `border:2px solid ${c};border-radius:8px;padding:8px;width:165px;text-align:left;background:#1a1722;font-size:12px`;
  d.innerHTML = `${icoHTML(it)}<b style="color:${c}">${it.fav ? "★ " : ""}${it.n}</b>${it.cons ? ` ×${it.q}` : ""}<br><small>${it.tp || SLOT[it.s]} · ${RN[it.r || 0]}</small><p style="margin:4px 0;font-size:11px">${it.d || ""}</p><small>${it.stx || stT(it.st || {})}</small>${
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

// ---------- Slots ----------
const SLOT_ICO = { w: "⚔️", h: "⛑️", b: "🦺", g: "🧤", f: "👢", a: "💍" };
let DRG = null, LASTCK = null;

// Casilla visual: icono, borde de rareza, cantidad (pociones) y estrella de favorito.
function mkSlot(it, o = {}) {
  const d = document.createElement("div");
  d.className = "sl" + (it ? "" : " empty") + (it && it.fav ? " fav" : "") + (o.cls ? " " + o.cls : "");
  if (it) {
    d.style.setProperty("--rc", RC[it.r || 0]);
    d.innerHTML = icoHTML(it, 34) + (it.cons ? `<i class="q">${it.q}</i>` : "") + (it.fav ? `<i class="st">★</i>` : "");
    d.title = itemTip(it) + (it.fav ? " · ★ favorito" : "");
  } else if (o.ph) d.innerHTML = `<span class="ph">${SLOT_ICO[o.ph] || ""}</span>`;
  return d;
}
function invSort(m) {
  const L = bagAll(),
    t = (a) => SLOT_ORDER.indexOf(a.s) + (a.cons ? 9 : 0);
  L.sort(
    (a, b) =>
      (b.fav ? 1 : 0) - (a.fav ? 1 : 0) ||
      (m == "n" ? 0 : m == "t" ? t(a) - t(b) : (b.r || 0) - (a.r || 0)) ||
      (m == "t" ? (b.r || 0) - (a.r || 0) : 0) ||
      a.n.localeCompare(b.n),
  );
  P.bag = L.concat(new Array(BAG_N - L.length).fill(null));
}
const refIt = (r) =>
  !r ? null : r.k == "b" ? P.bag[r.i] : r.k == "t" ? P.trash : r.s == "w" ? DOLLW() : P.eq[r.s] || null;
let DW = null;
const DOLLW = () => DW || (DW = wrapWeapon(P.w));

// Muñeco del inventario: es el mismo personaje del juego (drawHeroBody), solo de referencia.
// No refleja el equipo ni el arma que lleves, solo el aspecto de la clase.
const DOLL_W = 128,
  DOLL_H = 160;
function drawDoll(cv2) {
  const c = cv2.getContext("2d"),
    s = P.w.s,
    col = { m: "#d8b36a", r: "#7fd08a", g: "#8aa8ff" }[s],
    dk = { m: "#6b5530", r: "#3c6a44", g: "#3a4a8a" }[s],
    k = 3.6; // escala respecto al tamaño dentro del juego
  c.clearRect(0, 0, DOLL_W, DOLL_H);
  c.save();
  c.translate(DOLL_W * 0.6, DOLL_H * 0.62);
  c.scale(k, k);
  c.fillStyle = "#0006";
  c.beginPath();
  c.ellipse(0, 11, 12, 4.5, 0, 0, 7); // sombra, igual que en drawP
  c.fill();
  drawHeroBody(c, s, 0, P.r, 0, col, dk); // mirando a la derecha, quieto
  c.restore();
}

function invCloseDrag() {
  if (DRG && DRG.ghost) DRG.ghost.remove();
  document.querySelectorAll(".sl.dov").forEach((e) => e.classList.remove("dov", "dno"));
  DRG = null;
}
function invAfter() {
  DW = null;
  inv(1);
}
// Acción rápida: equipar/desequipar o usar (atajo MAYÚS+clic o doble toque/clic).
function invQuick(r) {
  const it = refIt(r);
  if (!it) return;
  if (r.k == "b") {
    if (it.cons) usePotion(it.cons, 1);
    else equipFromBag(r.i);
  } else if (r.k == "e") unequipSlot(r.s);
  else if (r.k == "t") restoreTrash();
  G.isel = null;
  invAfter();
}
function invDrop(a, b) {
  const it = refIt(a);
  if (!it) return;
  if (b.k == "t") {
    if (a.k != "t" && trashItem(it, a)) G.isel = null;
  } else if (b.k == "b") {
    if (a.k == "b") {
      if (a.i == b.i) return;
      const o = P.bag[b.i];
      if (o && o.cons && it.cons && o.cons == it.cons) {
        const t = Math.min(POT_MAX - o.q, it.q);
        o.q += t;
        it.q -= t;
        if (it.q <= 0) P.bag[a.i] = null;
        if (t > 0) return invAfter();
      }
      P.bag[b.i] = it;
      P.bag[a.i] = o;
    } else if (a.k == "e") {
      const o = P.bag[b.i];
      if (!o) unequipSlot(a.s, b.i);
      else if (o.s == a.s && canEquip(o)) {
        P.bag[b.i] = null;
        equipItem(o, b.i);
      } else flash("Ese hueco está ocupado");
    } else if (a.k == "t") {
      if (!P.bag[b.i]) {
        P.bag[b.i] = P.trash;
        P.trash = null;
      } else flash("Ese hueco está ocupado");
    }
  } else if (b.k == "e") {
    if (it.cons || it.s != b.s) return flash("No va en esa ranura");
    if (!canEquip(it)) return flash("No cumples los requisitos");
    if (a.k == "b") P.bag[a.i] = null;
    else if (a.k == "t") P.trash = null;
    else return;
    equipItem(it, a.k == "b" ? a.i : undefined);
  }
  invAfter();
}
function invClick(r, e) {
  const it = refIt(r);
  if (!it) return (G.isel = null), invAfter();
  if (e.altKey) {
    toggleFav(it);
    if (r.k == "e" && r.s == "w") P.w.fav = it.fav;
    return invAfter();
  }
  if (e.ctrlKey || e.metaKey) {
    if (r.k != "t" && trashItem(it, r)) G.isel = null;
    return invAfter();
  }
  if (e.shiftKey) return invQuick(r);
  const key = r.k + (r.i ?? r.s ?? ""),
    now = Date.now();
  if (LASTCK && LASTCK.k == key && now - LASTCK.t < 380) {
    LASTCK = null;
    return invQuick(r); // doble clic / doble toque rápido
  }
  LASTCK = { k: key, t: now };
  G.isel = r;
  invAfter();
}
function invWire(el, r) {
  el._ref = r;
  el.oncontextmenu = (e) => e.preventDefault();
  el.style.touchAction = "none";
  el.onpointerdown = (e) => {
    if (e.button > 0) return;
    e.preventDefault();
    el.setPointerCapture && el.setPointerCapture(e.pointerId);
    DRG = { r, el, sx: e.clientX, sy: e.clientY, on: 0, ghost: null, id: e.pointerId };
  };
  el.onpointermove = (e) => {
    if (!DRG || DRG.el !== el || e.pointerId !== DRG.id) return;
    const it = refIt(r);
    if (!DRG.on && it && Math.hypot(e.clientX - DRG.sx, e.clientY - DRG.sy) > 7) {
      DRG.on = 1;
      el.classList.add("drag");
      const g = document.createElement("div");
      g.className = "sl ghost";
      g.style.setProperty("--rc", RC[it.r || 0]);
      g.innerHTML = icoHTML(it, 34);
      document.body.appendChild(g);
      DRG.ghost = g;
    }
    if (DRG.on) {
      DRG.ghost.style.left = e.clientX + "px";
      DRG.ghost.style.top = e.clientY + "px";
      document.querySelectorAll(".sl.dov").forEach((q) => q.classList.remove("dov", "dno"));
      const t = document.elementFromPoint(e.clientX, e.clientY),
        s = t && t.closest && t.closest(".sl");
      if (s && s._ref && s !== el) {
        const it2 = refIt(r),
          ok = s._ref.k != "e" || (!it2.cons && it2.s == s._ref.s && canEquip(it2));
        s.classList.add("dov");
        if (!ok) s.classList.add("dno");
      }
    }
  };
  const end = (e, cancel) => {
    if (!DRG || DRG.el !== el || e.pointerId !== DRG.id) return;
    const d = DRG;
    el.classList.remove("drag");
    if (d.on && !cancel) {
      d.ghost.style.display = "none";
      const t = document.elementFromPoint(e.clientX, e.clientY),
        s = t && t.closest && t.closest(".sl");
      invCloseDrag();
      if (s && s._ref && s !== el) invDrop(r, s._ref);
      else invAfter();
    } else {
      invCloseDrag();
      if (!cancel && !d.on) invClick(r, e);
    }
  };
  el.onpointerup = (e) => end(e, 0);
  el.onpointercancel = (e) => end(e, 1);
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
  ov.innerHTML = "";
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
    n = bagAll().length,
    wrap = E_("div", "iv");
  ov.appendChild(wrap);
  const top = E_("div", "iv-top");
  top.appendChild(E_("h2", "", `Inventario · ${P.gold} 🪙`));
  top.appendChild(btn("Cerrar (I)", hide));
  wrap.appendChild(top);
  wrap.appendChild(
    E_(
      "div",
      "iv-stats",
      `Nv ${P.lv} · FUE ${P.a.str} DES ${P.a.dex} INT ${P.a.int} VIT ${P.a.vit} AGI ${P.a.agi} SUE ${P.a.luk} · Vida ${P.mhp} · Maná ${P.mmp} · Armadura ${P.arm.toFixed(0)} · Crít. ${(P.cc * 100).toFixed(0)}% · Daño ×${(P.dm * P.edm).toFixed(2)}`,
    ),
  );
  const main = E_("div", "iv-main");
  wrap.appendChild(main);
  // --- personaje + equipo ---
  const doll = E_("div", "iv-doll"),
    cvd = E_("canvas", "iv-char");
  cvd.width = DOLL_W;
  cvd.height = DOLL_H;
  cvd.style.imageRendering = "auto"; // dibujo vectorial: sin pixelar al escalar
  drawDoll(cvd);
  const place = (s, col, row) => {
    const it = s == "w" ? DOLLW() : P.eq[s],
      e = mkSlot(it, { ph: s, cls: "eqs" });
    e.style.gridColumn = col;
    e.style.gridRow = row;
    if (G.isel && G.isel.k == "e" && G.isel.s == s) e.classList.add("sel");
    invWire(e, { k: "e", s });
    e.dataset.n = SLOT[s];
    doll.appendChild(e);
  };
  cvd.style.gridColumn = 2;
  cvd.style.gridRow = "1 / 4";
  doll.appendChild(cvd);
  [["h", 1, 1], ["b", 1, 2], ["g", 1, 3], ["w", 3, 1], ["a", 3, 2], ["f", 3, 3]].forEach((a) => place(...a));
  main.appendChild(doll);
  // --- mochila ---
  const bx = E_("div", "iv-bag"),
    grid = E_("div", "iv-grid");
  P.bag.forEach((it, i) => {
    const e = mkSlot(it);
    if (G.isel && G.isel.k == "b" && G.isel.i == i) e.classList.add("sel");
    invWire(e, { k: "b", i });
    grid.appendChild(e);
  });
  bx.appendChild(grid);
  const bar = E_("div", "iv-bar");
  bar.appendChild(E_("small", "", `Mochila ${n}/${BAG_N}`));
  [["r", "Rareza"], ["t", "Tipo"], ["n", "Nombre"]].forEach(([k, t]) =>
    bar.appendChild(btn("Ordenar: " + t, () => (invSort(k), invAfter()))),
  );
  const tr = mkSlot(P.trash, { cls: "trash" });
  if (!P.trash) tr.innerHTML = `<span class="ph">🗑️</span>`;
  tr.title = "Papelera: al tirar otro objeto, este se borra por completo. Arrastra aquí para tirar.";
  if (G.isel && G.isel.k == "t") tr.classList.add("sel");
  invWire(tr, { k: "t" });
  bar.appendChild(tr);
  bx.appendChild(bar);
  bx.appendChild(
    E_(
      "small",
      "iv-hint",
      TOUCH
        ? "Toca un objeto para ver sus acciones · doble toque: equipar/usar · mantén y arrastra para moverlo"
        : "Clic: acciones · Ctrl+clic: tirar · Alt+clic: favorito · Mayús+clic: equipar/desequipar · arrastra para mover",
    ),
  );
  main.appendChild(bx);
  // --- detalle y acciones del objeto seleccionado ---
  const info = E_("div", "iv-info"),
    sel = G.isel,
    it = refIt(sel);
  if (!it) info.innerHTML = `<small>Selecciona un objeto para ver sus detalles y acciones.</small>`;
  else {
    const c = RC[it.r || 0],
      eqd = sel.k == "e";
    info.style.borderColor = c;
    info.innerHTML = `<div class="ih">${icoHTML(it, 40)}<div><b style="color:${c}">${it.fav ? "★ " : ""}${it.n}${it.cons ? " ×" + it.q : ""}</b><br><small>${itemKind(it)} · ${RN[it.r || 0]}</small></div></div><p>${it.d || ""}</p><small>${it.stx || stT(it.st || {})}</small>${
      it.req
        ? `<br><small style="color:${meets(it) ? "#8c8" : "#e66"}">Req: ${Object.entries(it.req).map(([k, v]) => k.toUpperCase() + " " + v).join(", ")}${meets(it) ? "" : " (no cumples)"}</small>`
        : ""
    }${sel.k == "b" && cmp(it) ? `<br><small>vs equipado: ${cmp(it)}</small>` : ""}`;
    const ab = E_("div", "ia");
    if (sel.k == "b")
      ab.appendChild(
        it.cons
          ? btn("Usar", () => (usePotion(it.cons, 1), invAfter()))
          : btn("Equipar", () => (equipFromBag(sel.i), (G.isel = null), invAfter()), !canEquip(it)),
      );
    if (eqd) ab.appendChild(btn("Desequipar", () => (unequipSlot(sel.s), (G.isel = null), invAfter()), sel.s == "w"));
    if (sel.k == "t") ab.appendChild(btn("Recuperar", () => (restoreTrash(), (G.isel = null), invAfter())));
    else {
      ab.appendChild(
        btn(it.fav ? "★ Quitar favorito" : "☆ Favorito", () => {
          toggleFav(it);
          if (eqd && sel.s == "w") P.w.fav = it.fav;
          invAfter();
        }, 0, it.fav),
      );
      ab.appendChild(btn("Tirar 🗑️", () => (trashItem(it, sel) && (G.isel = null), invAfter()), it.fav || (eqd && sel.s == "w")));
    }
    info.appendChild(ab);
  }
  main.appendChild(info);
}
