"use client";

import { useEffect } from "react";

/**
 * Registra el service worker del panel. Solo en producción: en desarrollo
 * la caché estorba con el hot reload. Se monta desde el layout de /admin.
 */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/admin-sw.js", { scope: "/admin/" })
      .catch((err) => console.warn("Service worker no registrado:", err));
  }, []);
  return null;
}
