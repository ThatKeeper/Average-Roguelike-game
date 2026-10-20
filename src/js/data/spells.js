/* ======================================================================
 * src/js/data/spells.js
 * Magia elemental: 10 elementos (EL), combinaciones de hechizos (CB) y reglas de estados.
 *
 * Define:
 * ZN, EL, CB, mc
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
    h: (e) => {
      if (e.st.wet > 0) {
        e.st.wet = 0;
        apply(e, { freeze: 1.2 });
      } else apply(e, { slow: 2.5 });
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
const CB = {
  "fire+light": {
    n: "Sobrecarga de plasma",
    f: "nova",
    m: 1.5,
    r: 1.2,
    cdm: 1.4,
    cap: 1,
    d: "Explosi\u00f3n el\u00e9ctrica: aturde (m\u00e1x. una vez cada 6 s) y quema brevemente.",
    h: (e, s) => {
      if (s.st) apply(e, { stun: 0.8 });
      apply(e, { burn: 1.5 });
    },
  },
  "light+water": {
    n: "Conductividad",
    m: 1.2,
    d: "El agua potencia la descarga, que salta a 4 objetivos.",
    h: (e, s) => chain(e, s.dmg * 0.5, 4),
  },
  "ice+water": {
    n: "Prisi\u00f3n glacial",
    f: "zone",
    m: 0.8,
    d: "Zona que congela (2 s) a los enemigos empapados.",
    h: (e) => apply(e, { freeze: 2 }),
  },
  "corr+plant": {
    n: "Putrefacci\u00f3n",
    m: 1.1,
    d: "Ra\u00edces (2.5 s) y 4 acumulaciones de corrupci\u00f3n.",
    h: (e) => apply(e, { root: 2.5, cor: 4 }),
  },
  "fire+wind": {
    n: "Tormenta \u00edgnea",
    f: "zone",
    r: 1.6,
    m: 0.9,
    d: "Zona persistente de llamas ampliada.",
    h: (e) => apply(e, { burn: 3 }),
  },
  "light+rock": {
    n: "Fractura conductora",
    m: 1.1,
    d: "Fractura la defensa; si ya estaba fracturado, la descarga salta a 3.",
    h: (e, s) => {
      const f = e.st.frac > 0;
      apply(e, { frac: 6 });
      if (f) chain(e, s.dmg * 0.6, 3);
    },
  },
  "blood+dark": {
    n: "Pacto carmes\u00ed",
    m: 1.8,
    rk: "Sacrifica el 15% de tu vida.",
    d: "Maldice y desangra, robando vida.",
    h: (e, s) => {
      apply(e, { curse: 8, bleed: 2 });
      P.hp = Math.min(P.mhp, P.hp + s.dmg * 0.05);
    },
  },
  "ice+plant": {
    n: "Jard\u00edn de espinas",
    f: "zone",
    m: 0.9,
    d: "Zona de espinas heladas: ralentiza y enraiza.",
    h: (e) => apply(e, { slow: 3, root: 1 }),
  },
  "corr+fire": {
    n: "Incineraci\u00f3n impura",
    f: "nova",
    m: 1,
    d: "Consume la corrupci\u00f3n del objetivo: +50% de da\u00f1o por acumulaci\u00f3n.",
    h: (e, s) => {
      const n = e.st.cor || 0;
      if (n) {
        e.st.cor = 0;
        hit(e, s.dmg * 0.5 * n, "m", { el: "fire" });
      }
    },
  },
  "plant+water": {
    n: "Crecimiento acelerado",
    f: "zone",
    m: 0.7,
    d: "Zona de ra\u00edces que ralentiza y te regenera.",
    h: (e) => {
      apply(e, { root: 1.2, slow: 3 });
      P.hp = Math.min(P.mhp, P.hp + P.mhp * 0.01);
    },
  },
  "fire+water": {
    n: "Vapor",
    m: 0.65,
    d: "Se anulan parcialmente: menos da\u00f1o, pero ralentiza.",
    h: (e) => apply(e, { slow: 2 }),
  },
  "fire+ice": {
    n: "Choque t\u00e9rmico",
    m: 0.7,
    d: "Fractura al enemigo a costa de da\u00f1o.",
    h: (e) => apply(e, { frac: 5 }),
  },
};
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
          apply(e, f);
        }
        if (o.ch) chain(e, s.dmg * 0.5, o.ch);
        if (o.sh && e.st.stun > 0) {
          e.st.stun = 0;
          hit(e, s.dmg * o.sh, "m", { el: "ice" });
        }
        if (o.cons && e.st[o.cons] > 0) {
          const k = e.st[o.cons];
          e.st[o.cons] = 0;
          hit(e, s.dmg * 0.3 * Math.min(k, 10), "m", { el: "dark" });
        }
        if (o.sp) for (const q of E) if (q != e && q.hp > 0 && dist(q, e) < 130) apply(q, o.sp);
        if (o.heal) P.hp = Math.min(P.mhp, P.hp + s.dmg * o.heal);
        if (o.mp) P.mp = Math.min(P.mmp, P.mp + o.mp);
      },
    },
    o,
  );
Object.assign(CB, {
  "blood+fire": mc("Sangre ardiente", "Quema y desangra; recuperas vida.", {
    fx: { burn: 3, bleed: 1 },
    heal: 0.04,
    m: 1.1,
  }),
  "blood+ice": mc("Hemorrag\u00eda g\u00e9lida", "Ralentiza y desangra (2 acumulaciones).", {
    fx: { slow: 3, bleed: 2 },
    m: 0.9,
  }),
  "blood+light": mc("Sangre el\u00e9ctrica", "Descarga en cadena (3) que desangra.", {
    fx: { bleed: 1 },
    ch: 3,
    sp: { bleed: 1 },
  }),
  "blood+plant": mc("Savia carmes\u00ed", "Veneno y ra\u00edz; te cura un 5% del da\u00f1o.", {
    fx: { poison: 4, bleed: 1, root: 1 },
    heal: 0.05,
    m: 0.9,
  }),
  "blood+rock": mc("Sangre petrificada", "Fractura y desangra.", {
    fx: { frac: 6, bleed: 2 },
    m: 1.1,
  }),
  "blood+water": mc("Sangr\u00eda", "Empapa y desangra: +50% si ya sangraba.", {
    vs: "bleed",
    fx: { wet: 5, bleed: 2 },
  }),
  "blood+wind": mc("Remolino carmes\u00ed", "Contagia la hemorragia a enemigos cercanos.", {
    f: "nova",
    r: 1.3,
    fx: { bleed: 1 },
    sp: { bleed: 1 },
  }),
  "blood+corr": mc("Sangre corrupta", "Consume las hemorragias en da\u00f1o y corrompe.", {
    cons: "bleedN",
    fx: { cor: 2 },
    m: 0.9,
  }),
  "corr+dark": mc("Ruina", "Corrupci\u00f3n y maldici\u00f3n; +50% si ya est\u00e1 corrupto.", {
    vs: "cor",
    fx: { cor: 3, curse: 6 },
    m: 1.1,
  }),
  "corr+ice": mc("Congelaci\u00f3n necr\u00f3tica", "Ralentiza y corrompe.", {
    fx: { slow: 3, cor: 2 },
  }),
  "corr+light": mc(
    "Cortocircuito corrupto",
    "Consume la corrupci\u00f3n en da\u00f1o y aturde (m\u00e1x. 1 vez/6 s).",
    { cons: "cor", fx: { stun: 0.6 }, cap: 1 },
  ),
  "corr+rock": mc("Petrificaci\u00f3n corrupta", "Fractura y corrompe.", {
    fx: { frac: 6, cor: 3 },
    m: 1.1,
  }),
  "corr+water": mc("Charca t\u00f3xica", "Zona que empapa, envenena y corrompe.", {
    f: "zone",
    fx: { wet: 5, cor: 1, poison: 3 },
    m: 0.9,
  }),
  "corr+wind": mc("Plaga voladora", "La corrupci\u00f3n salta a enemigos cercanos.", {
    r: 1.3,
    fx: { cor: 2 },
    sp: { cor: 1 },
  }),
  "dark+fire": mc("Llama negra", "Quema y maldice; +50% si ya estaba maldito.", {
    vs: "curse",
    fx: { burn: 4, curse: 6 },
    m: 1.1,
  }),
  "dark+ice": mc("Escarcha del vac\u00edo", "Ralentiza, maldice y drena man\u00e1.", {
    fx: { slow: 3, curse: 6 },
    mp: 3,
  }),
  "dark+light": mc("Eclipse", "+80% contra malditos; aturde brevemente (m\u00e1x. 1 vez/6 s).", {
    vs: "curse",
    vb: 0.8,
    fx: { curse: 3, stun: 0.5 },
    cap: 1,
  }),
  "dark+plant": mc("Ra\u00edces del abismo", "Ra\u00edces (2 s), veneno y maldici\u00f3n.", {
    fx: { root: 2, curse: 6, poison: 3 },
  }),
  "dark+rock": mc("L\u00e1pida maldita", "Fractura y maldice.", {
    fx: { frac: 6, curse: 8 },
    m: 1.1,
  }),
  "dark+water": mc("Marea negra", "Zona que empapa y maldice, drenando man\u00e1.", {
    f: "zone",
    fx: { wet: 5, curse: 4 },
    mp: 2,
    m: 0.9,
  }),
  "dark+wind": mc("Vendaval umbr\u00edo", "Extiende la maldici\u00f3n a los enemigos cercanos.", {
    f: "nova",
    r: 1.3,
    fx: { curse: 5 },
    sp: { curse: 5 },
  }),
  "fire+plant": mc("Incendio forestal", "Zona ardiente; +60% contra enra\u00edzados.", {
    f: "zone",
    vs: "root",
    vb: 0.6,
    fx: { burn: 3, poison: 3 },
  }),
  "fire+rock": mc("Magma", "Quema y fractura; +60% contra fracturados.", {
    vs: "frac",
    vb: 0.6,
    fx: { burn: 3, frac: 6 },
  }),
  "ice+light": mc("Escarcha conductiva", "Cadena (2); rompe congelados con +120% de da\u00f1o.", {
    ch: 2,
    sh: 1.2,
    fx: { slow: 2 },
  }),
  "ice+rock": mc("Rompehielos", "Fractura; destroza a los congelados (+150%).", {
    sh: 1.5,
    fx: { frac: 6, slow: 3 },
  }),
  "ice+wind": mc("Ventisca", "Zona amplia de ralentizaci\u00f3n; +80% si est\u00e1n empapados.", {
    f: "zone",
    r: 1.4,
    vs: "wet",
    vb: 0.8,
    fx: { slow: 3 },
    m: 0.8,
  }),
  "light+plant": mc("Descarga vegetal", "Cadena (3) con veneno y ra\u00edz.", {
    ch: 3,
    fx: { poison: 3, root: 1 },
  }),
  "light+wind": mc("Tormenta el\u00e9ctrica", "Cadena (3) en \u00e1rea ampliada.", {
    ch: 3,
    r: 1.3,
    fx: { stun: 0.4 },
    cap: 1,
  }),
  "plant+rock": mc("Ra\u00edces p\u00e9treas", "Ra\u00edces (3 s) y fractura.", {
    fx: { root: 3, frac: 6 },
  }),
  "plant+wind": mc("Polen venenoso", "Zona que envenena y contagia el veneno.", {
    f: "zone",
    r: 1.3,
    fx: { poison: 4 },
    sp: { poison: 3 },
    m: 0.8,
  }),
  "rock+water": mc("Lodo", "Zona que empapa, ralentiza y fractura.", {
    f: "zone",
    fx: { wet: 5, slow: 3, frac: 4 },
    m: 0.8,
  }),
  "rock+wind": mc("Tormenta de arena", "Zona que ralentiza y fractura.", {
    f: "zone",
    r: 1.3,
    fx: { slow: 3, frac: 5 },
    m: 0.8,
  }),
  "water+wind": mc("Tromba", "Gran nova que empapa a todos.", {
    f: "nova",
    r: 1.5,
    fx: { wet: 5 },
    sp: { wet: 4 },
    m: 0.8,
  }),
});
