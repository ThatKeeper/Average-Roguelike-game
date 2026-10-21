/* ======================================================================
 * src/js/core/pwa.js
 * Registro del service worker (PWA).
 * ====================================================================== */

if (
  typeof navigator != "undefined" &&
  navigator.serviceWorker &&
  typeof location != "undefined" &&
  /^https?:/.test(location.protocol)
)
  navigator.serviceWorker.register("sw.js?v=" + GAME_VERSION).catch(() => {});
