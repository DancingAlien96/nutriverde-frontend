import { getPushPublicKey, subscribePush, unsubscribePush, isPushSubscribed } from "../lib/admin";

/**
 * Notificaciones push del panel, del lado del navegador. Requiere el service
 * worker de la PWA (app/admin/PwaRegister.tsx) y que el servidor tenga llave
 * VAPID. En iPhone solo funciona con la app instalada en la pantalla de
 * inicio; por eso `iosNeedsInstall` para explicarlo en vez de fallar.
 */

export type PushState =
  | "unsupported" // el navegador no tiene Push API o no hay service worker
  | "unavailable" // el servidor no tiene llaves VAPID
  | "ios-install" // iPhone/iPad en Safari sin instalar: hay que instalar primero
  | "blocked" // la persona negó el permiso en el navegador
  | "off"
  | "on";

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iPadOs = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return /iPhone|iPad|iPod/i.test(ua) || iPadOs;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

async function registration(): Promise<ServiceWorkerRegistration | null> {
  if (!pushSupported()) return null;
  // El SW se registra desde PwaRegister; aquí solo esperamos a que esté listo
  // (con un tope, por si en este entorno no se registra).
  const ready = navigator.serviceWorker.ready;
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
  return (await Promise.race([ready, timeout])) ?? null;
}

/** Estado actual, consultando permiso, suscripción del navegador y servidor. */
export async function getPushState(): Promise<PushState> {
  if (!pushSupported()) {
    return isIos() && !isStandalone() ? "ios-install" : "unsupported";
  }
  const { publicKey } = await getPushPublicKey().catch(() => ({ publicKey: null }));
  if (!publicKey) return "unavailable";
  if (Notification.permission === "denied") return "blocked";
  const reg = await registration();
  if (!reg) return "unsupported";
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return "off";
  const { subscribed } = await isPushSubscribed(sub.endpoint).catch(() => ({ subscribed: false }));
  return subscribed ? "on" : "off";
}

/** Pide permiso, crea la suscripción y la guarda en el servidor. */
export async function enablePush(): Promise<PushState> {
  const { publicKey } = await getPushPublicKey();
  if (!publicKey) return "unavailable";
  const reg = await registration();
  if (!reg) return "unsupported";
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission === "denied" ? "blocked" : "off";
  const existing = await reg.pushManager.getSubscription();
  const sub =
    existing ??
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    }));
  const json = sub.toJSON();
  await subscribePush({
    endpoint: sub.endpoint,
    keys: { p256dh: json.keys?.p256dh ?? "", auth: json.keys?.auth ?? "" },
    userAgent: navigator.userAgent.slice(0, 255),
  });
  return "on";
}

/** Quita la suscripción del servidor y del navegador. */
export async function disablePush(): Promise<PushState> {
  const reg = await registration();
  const sub = reg ? await reg.pushManager.getSubscription() : null;
  if (sub) {
    await unsubscribePush(sub.endpoint).catch(() => undefined);
    await sub.unsubscribe().catch(() => undefined);
  }
  return "off";
}

/**
 * Baja local sin tocar el servidor: para cuando la sesion ya no es valida
 * (token vencido). La copia del servidor se borra sola al primer envio
 * fallido (410) o cuando otra cuenta activa en este dispositivo.
 */
export async function forgetPushLocally(): Promise<void> {
  try {
    const reg = await registration();
    const sub = reg ? await reg.pushManager.getSubscription() : null;
    if (sub) await sub.unsubscribe();
  } catch {
    // Sin soporte o sin suscripcion: nada que hacer.
  }
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(b64);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
