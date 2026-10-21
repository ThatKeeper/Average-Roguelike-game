if ("serviceWorker" in navigator && /^https?:/.test(location.protocol)) {
  window.addEventListener("load", async () => {
    try {
      const registration =
        await navigator.serviceWorker.register("./sw.js");

      await registration.update();
    } catch (error) {
      console.error("Error actualizando la PWA:", error);
    }
  });
}
