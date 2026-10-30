/* ======================================================================
 * src/js/ui/spell-book.js
 * Grimorio del Mago: 4 casillas en 2 parejas (1+2 y 3+4). Se arrastran los 10 elementos comunes a las casillas
 * (ratón y táctil, con imán a la casilla más cercana, o tocando elemento y casilla); al completar una pareja con
 * una combinación desbloqueada se descubre y se funde. Incluye vista previa animada y el catálogo de 45 combinaciones.
 *
 * Define:
 * sbEl, sbIcon, sbSlotNear, sbDrag, sbBurst, sbPreviewLoop, sbInfo, book
 * ====================================================================== */

const sbEl = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  },
  sbIcon = (k, cls = "sb-ic") => `<img class="${cls}" src="${spIconURL(k)}" alt="" draggable="false">`;
let SBRAF = 0;

// Casilla bajo el punto con un imán generoso (elipse algo mayor que la casilla); si caben varias, gana la más cercana. -1 = ninguna
function sbSlotNear(px, py) {
  let best = -1,
    bd = 1e9;
  document.querySelectorAll(".sb-slot").forEach((s) => {
    const r = s.getBoundingClientRect(),
      dx = (px - (r.left + r.width / 2)) / (r.width * 0.68),
      dy = (py - (r.top + r.height / 2)) / Math.max(r.height * 0.95, 36),
      d = dx * dx + dy * dy;
    if (d < 1 && d < bd) ((bd = d), (best = +s.dataset.slot));
  });
  return best;
}
// Arrastre con puntero (ratón o dedo). k: elemento; from: casilla de origen (-1 si viene de la paleta)
function sbDrag(el, k, from) {
  // touch-action:pan-y (css): la ventana se desplaza con el dedo también sobre los elementos. Se arrastra con ratón (6 px), con un gesto
  // horizontal o con una pulsación larga (170 ms) en pantalla táctil.
  el.onpointerdown = (e) => {
    if ((e.button || 0) > 0 || (e.target.closest && e.target.closest(".sb-x"))) return;
    const sx = e.clientX,
      sy = e.clientY,
      pid = e.pointerId,
      touch = e.pointerType != "mouse",
      lift = touch ? 54 : 0;
    let g = null,
      hov = -1,
      hold = 0,
      tm = 0;
    const start = () => {
        if (g) return;
        g = sbEl("div", "sb-ghost", sbIcon(k));
        document.body.appendChild(g);
        el.classList.add("drag");
        document.body.classList.add("sb-dragging");
        DRAGLOCK = 1;
        if (navigator.vibrate) navigator.vibrate(8);
      },
      mark = (n) => {
        if (n == hov) return;
        hov = n;
        document.querySelectorAll(".sb-slot").forEach((s) => s.classList.toggle("hot", +s.dataset.slot == n));
        if (n >= 0) snd(520 + n * 60, 0.03, "sine", 0.015);
      },
      off = () => {
        clearTimeout(tm);
        DRAGLOCK = 0;
        window.removeEventListener("pointermove", mv);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", cn);
        document.body.classList.remove("sb-dragging");
      },
      mv = (ev) => {
        if (ev.pointerId != pid) return;
        const dx = ev.clientX - sx,
          dy = ev.clientY - sy,
          d = Math.hypot(dx, dy);
        if (!g) {
          if (!touch && d > 6) start();
          else if (touch && d > 9) {
            if (hold || Math.abs(dx) > Math.abs(dy) * 1.1) start();
            else return off(); // gesto vertical: lo toma el desplazamiento de la ventana
          }
        }
        if (g) {
          g.style.transform = `translate(${ev.clientX}px,${ev.clientY - lift}px) translate(-50%,-50%) rotate(${Math.max(-14, Math.min(14, dx * 0.06))}deg) scale(1.15)`;
          mark(sbSlotNear(ev.clientX, ev.clientY - lift * 0.6));
          ev.preventDefault();
        }
      },
      end = (ev, ok) => {
        if (ev.pointerId != pid) return;
        off();
        if (g) {
          const tgt = ok ? hov : -1;
          g.remove();
          el.classList.remove("drag");
          if (!ok) return book(1);
          if (tgt >= 0) {
            const r = equipCard(k, tgt);
            G.sbA = { slot: tgt, disc: r.disc, k };
            G.ssel = r.disc || k;
            snd(660, 0.06, "triangle", 0.04);
          } else if (from >= 0) {
            unequipCard(from);
            G.sbA = null;
            snd(260, 0.05, "sine", 0.03);
          }
          book(1);
        } else if (ok) {
          // toque simple: seleccionar elemento (para colocarlo tocando una casilla) o ver su información
          G.csel = G.csel == k && from < 0 ? null : from < 0 ? k : null;
          G.ssel = k;
          book(1);
        }
      },
      up = (ev) => end(ev, true),
      cn = (ev) => end(ev, false);
    if (touch)
      tm = setTimeout(() => {
        hold = 1;
        start(); // pulsación larga: el elemento se "levanta" y queda bajo el dedo
        g.style.transform = `translate(${sx}px,${sy - lift}px) translate(-50%,-50%) scale(1.15)`;
      }, 170);
    window.addEventListener("pointermove", mv, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cn);
  };
}
// Partículas de la fusión sobre una pareja
function sbBurst(host, col) {
  for (let i = 0; i < 16; i++) {
    const s = sbEl("i", "sb-sp"),
      a = (i / 16) * 6.283 + Math.random() * 0.4,
      d = 40 + Math.random() * 46;
    s.style.cssText = `--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px;background:${col};animation-delay:${Math.random() * 0.12}s`;
    host.appendChild(s);
    setTimeout(() => s.remove(), 1100);
  }
}
// Bucle de la vista previa (≈30 fps); se detiene al cerrar el grimorio o al cambiar el lienzo
function sbPreviewLoop(cv2, key) {
  cancelAnimationFrame(SBRAF);
  const t0 = performance.now();
  let last = 0;
  const loop = (now) => {
    if (!G.bk || !cv2.isConnected) return;
    if (now - last > 32) {
      last = now;
      try {
        spPreview(cv2, key, (now - t0) / 1000);
      } catch (e) {
        console.error(e);
      }
    }
    SBRAF = requestAnimationFrame(loop);
  };
  SBRAF = requestAnimationFrame(loop);
}
// Panel de información de un hechizo (común o combinación)
function sbInfo(k) {
  const c = CARDS[k],
    isC = k.includes("+"),
    un = !!S.cards.unlocked[k],
    seen = !isC || !!S.cards.seen[k],
    col = EL[c.a].c;
  if (isC && !seen) {
    const rq = c.req.filter((q) => !reqOK(q));
    return `<div class="sb-inf"><div class="sb-inf-h"><span class="sb-q">?</span><div><b>Combinación sin descubrir</b><small>${EL[c.a].n} + ${EL[c.b].n}</small></div></div>${
      un
        ? `<p class="sb-ok">¡Ya la tienes desbloqueada! Coloca ${EL[c.a].n} y ${EL[c.b].n} en una misma pareja (1+2 o 3+4) para descubrirla.</p>`
        : `<p class="sb-no">Bloqueada. Requisitos:</p><ul>${c.req.map((q) => `<li class="${reqOK(q) ? "ok" : "no"}">${reqOK(q) ? "✓" : "✗"} ${reqTxt(q)}</li>`).join("")}</ul>`
    }</div>`;
  }
  const sp = build(k);
  return `<div class="sb-inf"><div class="sb-inf-h">${sbIcon(k, "sb-ic sm")}<div><b style="color:${col}">${c.n}</b><small>${EL[c.a].n}${c.b ? " + " + EL[c.b].n : ""} · ${SPF[c.f]}</small></div></div><p>${CB[k].d}</p><div class="sb-stats"><span>💧 ${Math.ceil(sp.cost)}</span><span>⏱ ${sp.cd.toFixed(1)}s</span><span>⚔ ${Math.round(sp.dmg)}</span>${sp.r ? `<span>◎ ${Math.round(sp.r)}</span>` : ""}</div>${sp.risk != "Sin riesgos." ? `<small class="sb-risk">⚠ ${sp.risk}</small>` : ""}${
    un ? "" : `<p class="sb-no">Bloqueada:</p><ul>${c.req.map((q) => `<li class="${reqOK(q) ? "ok" : "no"}">${reqOK(q) ? "✓" : "✗"} ${reqTxt(q)}</li>`).join("")}</ul>`
  }</div>`;
}
function book(f) {
  if ((G.st != "play" && !G.sbx) || !mageOn() || (G.ov && !G.bk)) return;
  if (G.bk && !f) {
    cancelAnimationFrame(SBRAF);
    hide();
    return;
  }
  G.bk = 1;
  G.pz = 1;
  G.ov = 1;
  ov.style.display = "flex";
  // Combinaciones desbloqueadas cuyas dos casillas ya estaban juntas (partidas guardadas): se descubren al abrir
  let reveal = G.sbA && G.sbA.disc;
  for (let p = 0; p < 2; p++) {
    const st = pairState(p);
    if (st.unlocked && !st.seen) {
      S.cards.seen[st.k] = 1;
      reveal = reveal || st.k;
      save();
    }
  }
  if (reveal) G.ssel = reveal;
  const tab = G.sbt || 0,
    un = EORDER.filter((k) => S.cards.unlocked[k]).length,
    cun = CORDER.filter((k) => k.includes("+") && S.cards.unlocked[k]).length,
    cse = CORDER.filter((k) => S.cards.seen[k]).length;
  if (!G.ssel || !CARDS[G.ssel]) G.ssel = [0, 1].map(pairState).find((s) => s.fused) ? [0, 1].map(pairState).find((s) => s.fused).k : S.cards.slots.find(Boolean) || "fire";
  const w = sbEl("div", "uw sb");
  w.innerHTML = `<div class="uw-top"><h2>📖 Grimorio</h2><button class="uw-btn" id="sbX">Cerrar (${KL(KY.book)})</button></div>
    <p class="uw-sub">Arrastra elementos a las casillas. Al completar una pareja con una combinación desbloqueada, se descubre y se funde en un solo hechizo. Teclas ${KL(KY.c1)}–${KL(KY.c4)}.</p>`;
  const main = sbEl("div", "sb-main"),
    left = sbEl("div", "sb-left"),
    right = sbEl("div", "sb-right"),
    slots = sbEl("div", "sb-slots");
  // ---- casillas en parejas ----
  for (let p = 0; p < 2; p++) {
    const st = pairState(p),
      pr = sbEl("div", "sb-pair" + (st.fused ? " fused" : "") + (st.k && !st.unlocked ? " locked" : ""));
    pr.dataset.p = p;
    for (const i of [2 * p, 2 * p + 1]) {
      const k = S.cards.slots[i],
        s = sbEl("div", "sb-slot" + (k ? " full" : "") + (G.csel && !k ? " want" : "") + (G.sbA && G.sbA.slot == i ? " pop" : ""));
      s.dataset.slot = i;
      if (k) s.style.setProperty("--c", EL[k].c);
      s.innerHTML = `<span class="sb-key">${KL(KY["c" + (i + 1)])}</span>${k ? sbIcon(k) + `<b>${CARDS[k].n}</b><button class="sb-x" title="Quitar">✕</button>` : `<em>Vacío</em>`}`;
      s.onclick = (e) => {
        if (e.target.closest(".sb-x")) {
          unequipCard(i);
          G.sbA = null;
          return book(1);
        }
        if (G.csel) {
          const r = equipCard(G.csel, i);
          G.sbA = { slot: i, disc: r.disc, k: G.csel };
          G.ssel = r.disc || G.csel;
          G.csel = null;
          return book(1);
        }
        if (k) {
          G.ssel = k;
          book(1);
        }
      };
      if (k) sbDrag(s, k, i);
      pr.appendChild(s);
      if (i == 2 * p) {
        const lk = sbEl("button", "sb-link", st.k ? (st.unlocked ? (st.fused ? "🔗" : "✂") : "🔒") : "·");
        lk.disabled = !st.unlocked;
        lk.title = st.unlocked ? (st.fused ? "Separar en dos hechizos comunes" : "Fusionar en la combinación") : "";
        lk.onclick = () => {
          toggleSplit(p);
          G.ssel = st.fused ? S.cards.slots[2 * p] : st.k;
          book(1);
        };
        pr.appendChild(lk);
      }
    }
    const res = sbEl("div", "sb-res");
    if (!st.a || !st.b) res.innerHTML = `<small>${st.a || st.b ? "Falta un elemento para formar la combinación" : "Pareja " + (p + 1) + ": coloca dos elementos"}</small>`;
    else if (!st.k) res.innerHTML = `<small>Mismo elemento: sin combinación</small>`;
    else if (!st.unlocked) res.innerHTML = `<small class="sb-no">🔒 Combinación bloqueada · ${CARDS[st.k].req.filter((q) => !reqOK(q)).map(reqTxt)[0]}</small>`;
    else
      res.innerHTML = `${st.fused ? sbIcon(st.k, "sb-ic mini") : ""}<span><b style="color:${EL[st.a].c}">${CB[st.k].n}</b><small>${st.fused ? "Fundido · una sola magia" : "Disponible · separado en 2 magias"}</small></span>`;
    res.onclick = () => {
      if (st.k && st.unlocked) {
        G.ssel = st.k;
        book(1);
      }
    };
    pr.appendChild(res);
    slots.appendChild(pr);
  }
  left.appendChild(slots);
  const prev = sbEl("div", "sb-prev"),
    cv2 = sbEl("canvas");
  cv2.width = 336;
  cv2.height = 240;
  prev.appendChild(cv2);
  prev.insertAdjacentHTML("beforeend", sbInfo(G.ssel));
  left.appendChild(prev);
  // ---- pestañas y paleta / catálogo ----
  const tabs = sbEl("div", "uw-tabs");
  [["Elementos " + un + "/10", 0], ["Combinaciones " + cse + "/" + (CORDER.length - EORDER.length), 1]].forEach(([t, v]) => {
    const b = sbEl("button", tab == v ? "on" : "", t);
    b.onclick = () => {
      G.sbt = v;
      book(1);
    };
    tabs.appendChild(b);
  });
  right.appendChild(tabs);
  const pal = sbEl("div", "sb-pal" + (tab ? " cx" : ""));
  if (!tab) {
    EORDER.forEach((k) => {
      const u = !!S.cards.unlocked[k],
        sl = S.cards.slots.indexOf(k),
        d = sbEl("div", "sb-card" + (u ? "" : " lock") + (G.csel == k ? " sel" : "") + (G.ssel == k ? " pv" : ""));
      d.style.setProperty("--c", EL[k].c);
      d.innerHTML = `${sbIcon(k)}<b>${CARDS[k].n}</b><small>${SPF[CARDS[k].f]}</small>${sl >= 0 ? `<i class="sb-eq">${sl + 1}</i>` : ""}${u ? "" : `<span class="sb-lk">🔒</span>`}`;
      if (u) sbDrag(d, k, -1);
      else
        d.onclick = () => {
          G.ssel = k;
          flash("Bloqueada: " + CARDS[k].req.filter((q) => !reqOK(q)).map(reqTxt).join(" · "));
          book(1);
        };
      pal.appendChild(d);
    });
  } else
    CORDER.filter((k) => k.includes("+")).forEach((k) => {
      const c = CARDS[k],
        seen = !!S.cards.seen[k],
        u = !!S.cards.unlocked[k],
        d = sbEl("div", "sb-card cx" + (seen ? "" : " unk") + (u ? "" : " lock") + (G.ssel == k ? " pv" : ""));
      d.style.setProperty("--c", EL[c.a].c);
      d.innerHTML = `${sbIcon(k)}<b>${seen ? c.n : "???"}</b><small>${EL[c.a].n} + ${EL[c.b].n}</small>${u && !seen ? `<span class="sb-new">¡Nueva!</span>` : ""}${u ? "" : `<span class="sb-lk">🔒</span>`}`;
      d.onclick = () => {
        G.ssel = k;
        book(1);
      };
      pal.appendChild(d);
    });
  right.appendChild(pal);
  right.insertAdjacentHTML("beforeend", `<p class="uw-hint">${G.csel ? "Elemento seleccionado: " + CARDS[G.csel].n + " → toca una casilla." : tab ? "Toca una combinación para ver sus detalles. Se descubren al fundir sus dos elementos." : "Arrastra un elemento a una casilla, o tócalo y luego toca la casilla. Las combinaciones no se arrastran: nacen de las parejas."}</p>`);
  main.appendChild(left);
  main.appendChild(right);
  w.appendChild(main);
  ov.innerHTML = "";
  ov.appendChild(w);
  w.querySelector("#sbX").onclick = () => {
    cancelAnimationFrame(SBRAF);
    hide();
  };
  sbPreviewLoop(cv2, G.ssel);
  // animaciones de colocación / descubrimiento
  if (reveal) {
    const st = [0, 1].map(pairState).find((s) => s.k == reveal),
      host = st && w.querySelector(`.sb-pair[data-p="${st.p}"]`);
    if (host) {
      host.classList.add("reveal");
      sbBurst(host, EL[st.a].c);
      sbBurst(host, EL[st.b].c);
      host.insertAdjacentHTML("beforeend", `<div class="sb-ban">¡Combinación descubierta!<b>${CB[reveal].n}</b></div>`);
      snd(523, 0.12, "triangle", 0.05);
      setTimeout(() => snd(784, 0.2, "triangle", 0.05), 110);
      setTimeout(() => snd(1046, 0.25, "sine", 0.04), 240);
    }
  }
  G.sbA = null;
  if (typeof tcSync == "function") tcSync();
}
