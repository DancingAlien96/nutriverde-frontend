"use client";

import { API_URL } from "./api";

const TOKEN_KEY = "nutriverde_admin_token";

export interface Admin {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  admin: Admin;
}

export interface PaymentListItem {
  id: string;
  amountCents: number;
  currency: string;
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  receiptUrl: string;
  receiptMime: string | null;
  createdAt: string;
  approvedAt: string | null;
  rejectedReason: string | null;
  patient: { id: string; fullName: string; email: string; phone: string | null };
  service: { id: string; name: string; slug: string; durationMin: number };
  appointment: { id: string; status: string; scheduledAt: string | null } | null;
}

export interface PaymentDetail extends PaymentListItem {
  patient: PaymentListItem["patient"] & {
    timezone: string;
    whatsappNotify: boolean;
    notes: string | null;
  };
  service: PaymentListItem["service"] & { priceCents: number; description: string };
  approvedBy: { id: string; email: string; fullName: string } | null;
}

export interface IntakeData {
  id: string;
  serviceSlug: string;
  submittedAt: string;
  data: { goal?: string | null; conditions?: string | null; notes?: string | null };
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_KEY);
}

async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(`${API_URL}${path}`, { ...init, headers });
}

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    if (res.status === 401) clearToken();
    throw new Error(data.error ?? `HTTP ${res.status}`);
  }
  return data;
}

export async function adminLogin(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await parseJson<LoginResponse>(res);
  setToken(data.token);
  return data;
}

export async function adminMe(): Promise<{ admin: Admin & { active: boolean } }> {
  const res = await authFetch("/api/admin/auth/me");
  return parseJson(res);
}

export async function listPayments(
  status?: "PENDING_REVIEW" | "APPROVED" | "REJECTED",
): Promise<{ payments: PaymentListItem[] }> {
  const qs = status ? `?status=${status}` : "";
  const res = await authFetch(`/api/admin/payments${qs}`);
  return parseJson(res);
}

export async function getPayment(
  id: string,
): Promise<{ payment: PaymentDetail; intake: IntakeData | null }> {
  const res = await authFetch(`/api/admin/payments/${id}`);
  return parseJson(res);
}

export async function approvePayment(id: string): Promise<{ ok: true; payment: PaymentDetail }> {
  const res = await authFetch(`/api/admin/payments/${id}/approve`, { method: "POST" });
  return parseJson(res);
}

export async function rejectPayment(
  id: string,
  reason: string,
): Promise<{ ok: true; payment: PaymentDetail }> {
  const res = await authFetch(`/api/admin/payments/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  return parseJson(res);
}

export function receiptUrl(paymentId: string): string {
  // Necesita Authorization header — no se puede usar directamente como src de <img>.
  // El componente lo descarga vía fetch y convierte a object URL.
  return `${API_URL}/api/admin/payments/${paymentId}/receipt`;
}

export async function fetchReceipt(paymentId: string): Promise<{ blobUrl: string; mime: string }> {
  const res = await authFetch(`/api/admin/payments/${paymentId}/receipt`);
  if (!res.ok) throw new Error(`No se pudo cargar el comprobante (HTTP ${res.status})`);
  const blob = await res.blob();
  return { blobUrl: URL.createObjectURL(blob), mime: blob.type };
}

export function formatCents(cents: number, currency: string): string {
  const amount = cents / 100;
  if (currency === "GTQ") return `Q${amount.toFixed(0)}`;
  return `${currency} ${amount.toFixed(2)}`;
}
