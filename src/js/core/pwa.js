/* Registro y actualización del Service Worker */

if (
  "serviceWorker" in navigator &&
  /^https?:/.test(location.protocol)
) {
  window.addEventListener("load", async () => {
    try {
      const registration =
        await navigator.serviceWorker.register("./sw.js");

      // Comprobar si hay una versión nueva
      await registration.update();
    } catch (error) {
      console.error("Error actualizando la PWA:", error);
    }
  });
}
