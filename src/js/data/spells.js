/* ======================================================================
 * src/js/data/spells.js
 * Magia elemental: 10 elementos (EL), combinaciones de hechizos (CB) y reglas de estados.
 *
 * Define:
 * ZN, EL, CB, mc, SPF
 * ====================================================================== */

// ===== MAGIA ELEMENTAL: 10 elementos, combinaciones por tabla, grimorio =====
// Reglas de estados: bleed/burn/poison/cor causan daño por segundo (fuente: arma o hechizo, escalado con wd()); stun/root/slow se acortan
// un 30% en élites y 50% en jefes; wet+hielo=congelación, wet+rayo=+60%, wet apaga burn; frac=+20% daño recibido; cor acumula (máx 10, decae 1/3s).
// Al morir el enemigo se elimina de E, así que sus estados no persisten. Añadir un hechizo = añadir una entrada a CB.
let ZN = [];
const EL = {
  fire: {
    n: "Fuego",
    c: "#ff8a30",
    d: "Quemadura; consume ra\u00edces (+40%).",
    h: (e, s) => {
      apply(e, { burn: 3 });
      if (e.st.root > 0) {
        e.st.root = 0;
        hit(e, s.dmg * 0.4, "m", { el: "fire" });
      }
    },
  },
  water: {
    n: "Agua",
    c: "#4af",
    d: "Empapa: la electricidad hace +60%; apaga quemaduras.",
    h: (e) => apply(e, { wet: 5 }),
  },
  plant: {
    n: "Planta",
    c: "#6c4",
    d: "Ra\u00edces (1.5 s) y veneno.",
    h: (e) => apply(e, { root: 1.5, poison: 4 }),
  },
  light: {
    n: "Electricidad",
    c: "#fff27a",
    d: "25% de aturdir; interrumpe.",
    h: (e) => {
      if (Math.random() < 0.25) apply(e, { stun: 0.5 });
    },
  },
  wind: {
    n: "Viento",
    c: "#cfe",
    d: "Empuje fuerte y +30% de radio.",
    h: (e, s, x0, y0) => {
      const a = Math.atan2(e.y - y0, e.x - x0);
      if (e.t != "boss") {
        e.vx += Math.cos(a) * 350;
        e.vy += Math.sin(a) * 350;
      }
    },
  },
  rock: {
    n: "Roca",
    c: "#b98",
    d: "Fractura: +20% de da\u00f1o recibido (6 s).",
    h: (e) => apply(e, { frac: 6 }),
  },
  ice: {
    n: "Hielo",
    c: "#9fe8ff",
    d: "Ralentiza; congela si est\u00e1 empapado.",
    h: (e, s) => {
      if (e.st.wet > 0) {
        e.st.wet = 0;
        apply(e, { freeze: 1.2 });
      } else if (s.tick && e.st.slow > 0) e.st.slow = Math.max(e.st.slow, 2.5); // en zonas, repetir el golpe solo renueva la ralentización (sin aturdir en bucle)
      else apply(e, { slow: 2.5 });
      if (e.st.stun > 0.3) e.frzU = Date.now() + e.st.stun * 1000; // bloque de hielo visible mientras dura el aturdimiento
    },
  },
  dark: {
    n: "Oscuridad",
    c: "#a4f",
    d: "Maldici\u00f3n (\u221225% da\u00f1o enemigo), drena man\u00e1; +30% contra afectados.",
    h: (e) => {
      apply(e, { curse: 6 });
      P.mp = Math.min(P.mmp, P.mp + 2);
    },
  },
  blood: {
    n: "Sangre",
    c: "#d22",
    d: "Cuesta 6% de vida; +35% poder, hemorragia y robo de vida.",
    h: (e, s) => {
      apply(e, { bleed: 1 });
      P.hp = Math.min(P.mhp, P.hp + s.dmg * 0.02);
    },
  },
  corr: {
    n: "Corrupci\u00f3n",
    c: "#c2a",
    d: "Acumula deterioro (m\u00e1x. 10). Riesgo: +25% coste y enfriamiento.",
    h: (e) => apply(e, { cor: 2 }),
  },
};
const CB = {};
// Fábrica de hechizos. o: m (daño), r (radio), cdm (enfriamiento), f (forma: bolt|nova|cone|zone), fx (estados), vs/vb (bonus contra un estado),
// ch (cadena), sh (rompe aturdidos), cons (consume un estado), sp (contagia a cercanos), heal (% del daño), healM (% de vida máx.), mp (maná),
// pull/push/slide (impulsos), cleanse (limpia tus ralentizaciones), cap (aturdimiento limitado a 1 vez/6 s), rk (riesgo),
// bolt: pierce/bounce/spd/lob/hops/link/fz (zona que deja al acabar), pulses (ondas repetidas), ground (la nova se coloca en el punto señalado).
const mc = (n, d, o) =>
  Object.assign(
    {
      n,
      d,
      h: (e, s) => {
        if (o.vs && e.st[o.vs] > 0) hit(e, s.dmg * (o.vb || 0.5), "m", { el: "dark" });
        if (o.fx) {
          const f = Object.assign({}, o.fx);
          if (o.cap && !s.st) delete f.stun;
          if ((s.tick || s.a == "ice" || s.b == "ice") && f.slow && e.st.slow > 0) {
            e.st.slow = Math.max(e.st.slow, f.slow); // golpes repetidos de una zona (o la ralentización extra de una combinación de hielo, que ya ralentizó con el elemento): renovar sin aturdir
            delete f.slow;
          }
          apply(e, f);
        }
        if (o.ch) chain(e, s.dmg * 0.5, o.ch);
        if (o.sh && e.st.stun > 0) {
          e.st.stun = 0;
          e.frzU = 0;
          hit(e, s.dmg * o.sh, "m", { el: "ice" });
        }
        if (o.cons && e.st[o.cons] > 0) {
          const k = e.st[o.cons];
          e.st[o.cons] = 0;
          hit(e, s.dmg * 0.3 * Math.min(k, 10), "m", { el: "dark" });
        }
        if (o.sp) for (const q of E) if (q != e && q.hp > 0 && dist(q, e) < 130) apply(q, o.sp);
        if (o.heal) P.hp = Math.min(P.mhp, P.hp + s.dmg * o.heal);
        if (o.healM) P.hp = Math.min(P.mhp, P.hp + P.mhp * o.healM);
        if (o.mp) P.mp = Math.min(P.mmp, P.mp + o.mp);
        if (o.cleanse) P.slow = 0;
        if (e.t != "boss" && (o.pull || o.push || o.slide)) {
          const c = s.cx === undefined ? e : { x: s.cx, y: s.cy },
            a = Math.atan2(c.y - e.y, c.x - e.x) + (o.push ? Math.PI : 0) + (o.slide ? rnd(-3, 3) : 0),
            f = o.pull || o.push || o.slide;
          e.vx += Math.cos(a) * f;
          e.vy += Math.sin(a) * f;
        }
      },
    },
    o,
  );
const SPF = { bolt: "Proyectil", nova: "Nova", cone: "Cono", zone: "Zona" };
// ---- 10 hechizos comunes (un elemento) ----
Object.assign(CB, {
  fire: mc("Cometa", "Bola de fuego con larga cola que explota en una llamarada: quema y lanza brasas.", { f: "bolt", m: 1.1, spd: 540 }),
  ice: mc("Lanza de escarcha", "Lanza helada: ralentiza y, si ya estaba ralentizado, lo encierra en un bloque de hielo.", { f: "bolt", m: 1.05, spd: 620 }),
  light: mc("Rayo solar", "Haz instantáneo que atraviesa a todos los enemigos en línea; quema y puede aturdir.", { f: "bolt", m: 0.95, beam: 1, fx: { burn: 2 } }),
  water: mc("Ola cristalina", "Chorro que empuja al impactar y deja al enemigo mojado.", { f: "bolt", m: 1, spd: 600, push: 240, pierce: 1 }),
  plant: mc("Semilla brotante", "Semilla que al caer brota en zarzas que hieren, enraízan y ralentizan.", {
    f: "bolt", m: 0.9, spd: 520, fz: { v: "vines", r: 58, dur: 3, m: 0.35, fx: { root: 1, slow: 2 }, el: "plant" },
  }),
  wind: mc("Corte cortante", "Hoja de aire que atraviesa y corta a varios enemigos y los empuja.", { f: "bolt", m: 0.95, spd: 660, pierce: 3 }),
  rock: mc("Peñasco rodante", "Peñasco que rueda y rebota aplastando lo que encuentra; aturde (máx. 1 vez/6 s).", {
    f: "bolt", m: 1.15, spd: 400, pierce: 2, bounce: 1, fx: { stun: 0.5 }, cap: 1,
  }),
  dark: mc("Eco sombrío", "Esfera de sombra: al impactar abre un agujero que atrae y maldice con tentáculos.", {
    f: "bolt", m: 1, spd: 500, fz: { v: "hole", r: 60, dur: 2.2, m: 0.3, fx: { curse: 5 }, pull: 90, el: "dark" },
  }),
  blood: mc("Pulso hemático", "Un corazón late sobre ti y lanza dos ondas rojas: hieren y la sangre vuelve a ti.", { f: "nova", m: 1.05, r: 1.1, pulses: 2 }),
  corr: mc("Charco de ácido", "Charco burbujeante que disuelve al enemigo y su armadura (acumula corrupción).", { f: "zone", m: 1 }),
});
// ---- 45 combinaciones (clave = elementos en orden alfabético) ----
Object.assign(CB, {
  "fire+ice": mc("Choque térmico", "Abanico mitad fuego, mitad hielo: el contraste agrieta (+20% de daño recibido).", { f: "cone", m: 0.85, fx: { frac: 5 } }),
  "fire+light": mc("Sol naciente", "Un sol estalla en rayos por el suelo: daño radiante que ciega (−25% de daño enemigo).", { f: "nova", m: 1.1, r: 1.1, fx: { curse: 4 } }),
  "fire+water": mc("Géiser hirviente", "Chorros de agua hirviendo: dañan, empujan y ciegan.", { f: "zone", m: 0.75, fx: { slow: 2, curse: 3 }, push: 130 }),
  "fire+plant": mc("Incendio forestal", "Árboles que arden uno tras otro: quema y veneno; +60% contra enraizados.", {
    f: "zone", r: 1.2, m: 0.8, vs: "root", vb: 0.6, fx: { burn: 3, poison: 3 },
  }),
  "fire+wind": mc("Tornado de fuego", "Torbellino de llamas ampliado: empuja a los enemigos y aviva las llamas.", { f: "zone", r: 1.6, m: 0.9, fx: { burn: 3 }, push: 170 }),
  "fire+rock": mc("Meteoro", "Un meteoro cae sobre el punto señalado: onda de choque, fractura y aturde (máx. 1 vez/6 s).", {
    f: "bolt", m: 1.7, r: 0.85, cdm: 1.3, lob: 1, fx: { burn: 3, frac: 6, stun: 0.8 }, cap: 1,
  }),
  "dark+fire": mc("Llamas fantasma", "Almas en llamas que salen a tu alrededor: queman, maldicen; +50% contra malditos.", {
    f: "nova", m: 1, vs: "curse", fx: { burn: 4, curse: 6 },
  }),
  "blood+fire": mc("Volcán carmesí", "Un volcán de lava de sangre: quema, desangra y te cura un poco.", { f: "zone", m: 0.85, heal: 0.04, fx: { burn: 3, bleed: 1 } }),
  "corr+fire": mc("Escoria corrosiva", "Oleada de escoria ácida: consume la corrupción en daño (+30% por acumulación) y quema.", {
    f: "cone", m: 1, cons: "cor", fx: { burn: 2 },
  }),
  "ice+light": mc("Prisma ártico", "Un prisma parte la luz en rayos: ralentizan y ciegan.", { f: "nova", m: 1, r: 1.1, fx: { slow: 2, curse: 4 } }),
  "ice+water": mc("Pista de hielo", "El charco se congela: congela a los empapados y los demás patinan sin control.", { f: "zone", m: 0.7, fx: { slow: 3 }, slide: 230 }),
  "ice+plant": mc("Enredadera escarchada", "Semilla helada que brota en zarzas heladas: ralentiza y enraíza.", {
    f: "bolt", m: 0.95, spd: 520, fx: { slow: 3, root: 1 }, fz: { v: "vines", r: 60, dur: 3, m: 0.35, fx: { slow: 3, root: 1 }, el: "plant" },
  }),
  "ice+wind": mc("Ventisca", "Nieve y esquirlas en abanico: ralentizan y ciegan; +80% contra empapados.", {
    f: "cone", r: 1.3, m: 0.9, vs: "wet", vb: 0.8, fx: { slow: 3, curse: 3 },
  }),
  "ice+rock": mc("Estalactitas", "Carámbanos gigantes caen y se clavan: fracturan y aturdan (máx. 1 vez/6 s).", {
    f: "zone", m: 0.9, fx: { frac: 5, slow: 2, stun: 0.6 }, cap: 1,
  }),
  "dark+ice": mc("Silencio gélido", "Tres ondas de frío negro: ralentizan, maldicen, silencian y drenan maná.", {
    f: "nova", m: 0.9, fx: { slow: 3, curse: 6, stun: 0.6 }, cap: 1, mp: 3,
  }),
  "blood+ice": mc("Colmillos carmesí", "Colmillos de hielo rojo brotan en abanico: desangran (2) y ralentizan.", { f: "cone", m: 0.95, fx: { slow: 3, bleed: 2 } }),
  "corr+ice": mc("Deshielo ácido", "El hielo se derrite en un charco ácido: ralentiza y corroe.", { f: "zone", m: 0.85, fx: { slow: 2, cor: 2 } }),
  "light+water": mc("Arcoíris cristalino", "Un arco de siete colores: daña, empapa y limpia tus ralentizaciones.", { f: "zone", m: 0.6, cleanse: 1, heal: 0.03 }),
  "light+plant": mc("Prado luminoso", "Haces de sol hacen brotar un prado: daña a los enemigos y te cura.", { f: "zone", m: 0.6, healM: 0.01 }),
  "light+wind": mc("Aurora veloz", "Cinta de luz veloz que atraviesa a varios enemigos y puede aturdir.", {
    f: "bolt", m: 1, spd: 780, pierce: 4, fx: { stun: 0.4 }, cap: 1,
  }),
  "light+rock": mc("Cristal solar", "Onda de cristales brillantes: fractura y aturde a su paso (máx. 1 vez/6 s).", {
    f: "nova", m: 1, r: 1.2, fx: { frac: 6, stun: 0.5 }, cap: 1,
  }),
  "dark+light": mc("Eclipse", "Luz y sombra alternadas: +80% contra malditos y aturde brevemente (máx. 1 vez/6 s).", {
    f: "zone", m: 0.7, vs: "curse", vb: 0.8, fx: { curse: 3, stun: 0.5 }, cap: 1,
  }),
  "blood+light": mc("Rayos carmesí", "Cinco rayos rojizos en abanico: desangran y te curan parte del daño.", { f: "cone", m: 1, heal: 0.06, fx: { bleed: 1 } }),
  "corr+light": mc("Loto purificador", "Una flor de luz y ácido: corroe las defensas y consume la corrupción.", { f: "nova", m: 0.9, cons: "cor", fx: { cor: 3 } }),
  "plant+water": mc("Brote de pantano", "Charco con raíces: enraíza, ralentiza y te regenera.", { f: "zone", m: 0.6, healM: 0.01, fx: { root: 1.2, slow: 3 } }),
  "water+wind": mc("Tromba", "Ráfaga con lluvia: empuja a los enemigos, los empapa y apaga fuegos.", { f: "cone", r: 1.5, m: 0.85, push: 230 }),
  "rock+water": mc("Aluvión", "Piedras y agua caen sobre el área: empapan, ralentizan, fracturan y aturden (máx. 1 vez/6 s).", {
    f: "zone", m: 0.85, fx: { slow: 3, frac: 4, stun: 0.5 }, cap: 1,
  }),
  "dark+water": mc("Abismo", "Agujero de agua oscura en el punto señalado: agrupa a los enemigos, los maldice y drena maná.", {
    f: "nova", ground: 1, r: 1.25, m: 0.8, pull: 520, fx: { curse: 6, wet: 4 }, mp: 2,
  }),
  "blood+water": mc("Marea roja", "Olas carmesí: empapan, desangran (+50% si ya sangraba) y te curan.", {
    f: "zone", m: 0.85, vs: "bleed", fx: { wet: 5, bleed: 2 }, heal: 0.04,
  }),
  "corr+water": mc("Lluvia ácida", "Nube de lluvia ácida: empapa y corroe la armadura de quien se queda dentro.", { f: "zone", m: 0.8, fx: { wet: 5, cor: 2 } }),
  "plant+wind": mc("Tornado de hojas", "Torbellino de hojas cortantes: atrapa, envenena y atrae a los enemigos.", { f: "zone", r: 1.3, m: 0.8, fx: { poison: 3 }, pull: 140 }),
  "plant+rock": mc("Raíces pétreas", "Estacas de raíz y roca en abanico: enraízan (3 s), fracturan y aturden.", { f: "cone", m: 1, fx: { root: 3, frac: 6, stun: 0.4 }, cap: 1 }),
  "dark+plant": mc("Flor nocturna", "Una flor oscura suelta esporas: enraíza, envenena y maldice.", { f: "nova", m: 0.9, fx: { root: 2, curse: 6, poison: 3 } }),
  "blood+plant": mc("Parásito carmesí", "Una enredadera se aferra al objetivo y drena su vida hacia ti durante 3 s.", {
    f: "bolt", m: 0.9, spd: 520, fx: { poison: 2, bleed: 1 }, link: { t: 3, tk: 0.5, m: 0.22, heal: 0.6 },
  }),
  "corr+plant": mc("Hongos tóxicos", "Hongos que brotan y estallan en esporas ácidas: corrompen y envenenan.", { f: "zone", m: 0.85, fx: { cor: 3, poison: 3 } }),
  "rock+wind": mc("Tormenta de arena", "Arena y piedras a gran velocidad: ralentizan, fracturan y ciegan.", { f: "cone", r: 1.3, m: 0.8, fx: { slow: 3, frac: 5, curse: 3 } }),
  "dark+wind": mc("Grito del vacío", "Ondas de choque que empujan a todos y los silencian: maldice y contagia la maldición.", {
    f: "nova", r: 1.3, m: 0.85, push: 260, fx: { curse: 5 }, sp: { curse: 5 },
  }),
  "blood+wind": mc("Lluvia de cuchillas", "Cuchillas de aire carmesí caen y hacen sangrar; contagian la hemorragia.", { f: "zone", m: 0.8, fx: { bleed: 1 }, sp: { bleed: 1 } }),
  "corr+wind": mc("Nube corrosiva", "Nube tóxica que crece al avanzar y se queda al impactar, corroyendo todo lo que toca.", {
    f: "bolt", m: 0.8, spd: 340, pierce: 3, fx: { cor: 2 }, fz: { v: "cloud", r: 72, dur: 3.2, m: 0.28, fx: { cor: 1 } },
  }),
  "dark+rock": mc("Obelisco umbrío", "Monolitos oscuros brotan del suelo: fracturan y maldicen a quien está cerca.", { f: "zone", m: 0.85, fx: { frac: 6, curse: 8 } }),
  "blood+rock": mc("Fisura carmesí", "El suelo se abre y estalla en chorros de sangre: fractura y desangra (2).", { f: "nova", m: 1, fx: { frac: 6, bleed: 2 } }),
  "corr+rock": mc("Fango corrosivo", "Oleada de lodo ácido: fractura, corroe y ralentiza.", { f: "cone", m: 0.9, fx: { frac: 6, cor: 3, slow: 2 } }),
  "blood+dark": mc("Ritual de sangre", "Estrella ritual: maldice, desangra y te cura. Sacrifica el 15% de tu vida.", {
    f: "zone", m: 1.8, rk: "Sacrifica el 15% de tu vida.", heal: 0.05, fx: { curse: 8, bleed: 2 },
  }),
  "corr+dark": mc("Plaga umbría", "Enjambre de murciélagos: corroen y maldicen; +50% contra corruptos.", { f: "cone", m: 1.1, vs: "cor", fx: { cor: 3, curse: 6 } }),
  "blood+corr": mc("Contagio carmesí", "Una esfera infecta a un enemigo y el contagio salta hasta 3 veces: sangrado y corrupción.", {
    f: "bolt", m: 0.9, spd: 480, fx: { bleed: 2, cor: 2 }, hops: 3,
  }),
});
