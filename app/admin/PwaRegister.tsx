"use client";

import { useEffect } from "react";

/**
 * Registra el service worker del panel. Solo en producción: en desarrollo
 * la caché estorba con el hot reload (NEXT_PUBLIC_ENABLE_SW=1 lo fuerza para
 * probar la PWA y las notificaciones en local). Se monta desde el layout de
 * /admin.
 */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_ENABLE_SW !== "1") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/admin-sw.js", { scope: "/admin/" })
      .catch((err) => console.warn("Service worker no registrado:", err));
  }, []);
  return null;
}
