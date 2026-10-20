/* ======================================================================
 * src/js/core/storage.js
 * Progreso permanente (S) guardado en localStorage.
 *
 * Define:
 * S, save
 * ====================================================================== */

let S = { best: 0, souls: 0, pw: 0 };
try {
  S = Object.assign(S, JSON.parse(localStorage.getItem("idv1")));
} catch (e) {}
const save = () => {
  try {
    localStorage.setItem("idv1", JSON.stringify(S));
  } catch (e) {}
};
