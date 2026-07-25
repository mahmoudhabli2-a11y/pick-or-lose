/** Guarded service-worker registration for the Tahaddi PWA.
 *  Only registers in production on the real deployed origin — never in
 *  Lovable preview iframes, dev, or with ?sw=off. */
export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  const url = new URL(window.location.href);
  const host = window.location.hostname;
  const isPreview =
    host.startsWith("id-preview--") ||
    host.startsWith("preview--") ||
    host === "lovableproject.com" ||
    host.endsWith(".lovableproject.com") ||
    host === "lovableproject-dev.com" ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "beta.lovable.dev" ||
    host.endsWith(".beta.lovable.dev");
  const inIframe = window.self !== window.top;
  const killSwitch = url.searchParams.get("sw") === "off";
  const isDev = !import.meta.env.PROD;

  if (isDev || isPreview || inIframe || killSwitch) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      for (const r of regs) {
        if (r.active?.scriptURL.endsWith("/sw.js")) r.unregister();
      }
    });
    return;
  }

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
  });
}
