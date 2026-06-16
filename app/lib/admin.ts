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
  appointment: {
    id: string;
    status: string;
    scheduledAt: string | null;
    scheduleToken: string | null;
    meetingUrl: string | null;
    meetingProvider: "GOOGLE_MEET" | "ZOOM" | null;
  } | null;
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

// ============================================================
// Disponibilidad
// ============================================================

export interface AvailabilitySlot {
  id: string;
  dayOfWeek: number; // 0..6 (0 = domingo)
  startMinute: number;
  endMinute: number;
  active: boolean;
}

export interface AvailabilityBlock {
  id: string;
  startsAt: string;
  endsAt: string;
  reason: string | null;
}

export interface SchedulingSettings {
  allowSameDayBooking: boolean;
  minLeadMinutes: number;
}

export async function listAvailability(): Promise<{
  slots: AvailabilitySlot[];
  blocks: AvailabilityBlock[];
  settings: SchedulingSettings;
}> {
  const res = await authFetch("/api/admin/availability");
  return parseJson(res);
}

export async function updateSchedulingSettings(
  patch: Partial<SchedulingSettings>,
): Promise<{ settings: SchedulingSettings }> {
  const res = await authFetch("/api/admin/availability/settings", {
    method: "PUT",
    body: JSON.stringify(patch),
  });
  return parseJson(res);
}

export async function createSlot(input: {
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
}): Promise<{ slot: AvailabilitySlot }> {
  const res = await authFetch("/api/admin/availability/slots", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return parseJson(res);
}

export async function updateSlot(
  id: string,
  patch: Partial<{
    dayOfWeek: number;
    startMinute: number;
    endMinute: number;
    active: boolean;
  }>,
): Promise<{ slot: AvailabilitySlot }> {
  const res = await authFetch(`/api/admin/availability/slots/${id}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });
  return parseJson(res);
}

export async function deleteSlot(id: string): Promise<void> {
  const res = await authFetch(`/api/admin/availability/slots/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    if (res.status === 401) clearToken();
    throw new Error(`HTTP ${res.status}`);
  }
}

export async function createBlock(input: {
  startsAt: string;
  endsAt: string;
  reason?: string;
}): Promise<{ block: AvailabilityBlock }> {
  const res = await authFetch("/api/admin/availability/blocks", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return parseJson(res);
}

export async function deleteBlock(id: string): Promise<void> {
  const res = await authFetch(`/api/admin/availability/blocks/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    if (res.status === 401) clearToken();
    throw new Error(`HTTP ${res.status}`);
  }
}

// ============================================================
// Pacientes (admin)
// ============================================================

export type DocumentType = "DPI" | "CURP" | "PASSPORT" | "OTHER";

export const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  DPI: "DPI",
  CURP: "CURP",
  PASSPORT: "Passport",
  OTHER: "Other",
};

export interface PatientListItem {
  id: string;
  fullName: string;
  email: string;
  documentId: string | null;
  documentType: DocumentType;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    appointments: number;
    payments: number;
    nutritionPlans: number;
  };
}

export interface PatientDiagnosis {
  id: string;
  objective: string | null;
  goalFatPercent: number | null;
  goalFatLossLbs: number | null;
  goalLeanMassKg: number | null;
  notes: string | null;
  createdAt: string;
}

export interface PatientTraining {
  id: string;
  duration: string | null;
  frequency: string | null;
  schedule: string | null;
  notes: string | null;
  createdAt: string;
}

export interface AnthropometricMeasurement {
  id: string;
  appointmentId: string | null;
  measuredAt: string;
  visitNumber: number | null;
  weightKg: number | null;
  fatPercent: number | null;
  waterPercent: number | null;
  leanMassKg: number | null;
  metabolicAge: number | null;
  visceralFat: number | null;
  caliperFatPercent: number | null;
  chestCm: number | null;
  waistCm: number | null;
  abdomenCm: number | null;
  hipCm: number | null;
  armCm: number | null;
  thighCm: number | null;
  calfCm: number | null;
  notes: string | null;
  createdAt: string;
}

export interface MealPlanRecord {
  id: string;
  title: string | null;
  breakfast: string | null;
  morningSnack: string | null;
  lunch: string | null;
  afternoonSnack: string | null;
  dinner: string | null;
  notes: string | null;
  createdAt: string;
}

export interface PatientDetail {
  id: string;
  fullName: string;
  email: string;
  documentId: string | null;
  documentType: DocumentType;
  phone: string | null;
  whatsappNotify: boolean;
  timezone: string;
  referralSource: string | null;
  notes: string | null;
  // Datos clínicos estáticos
  birthDate: string | null;
  heightCm: number | null;
  allergies: string | null;
  medicalConditions: string | null;
  medications: string | null;
  alcoholNotes: string | null;
  cravingsNotes: string | null;
  waterCoffeeNotes: string | null;
  dislikedFoods: string | null;
  weekendSpots: string | null;
  // Historial clínico
  diagnoses: PatientDiagnosis[];
  trainings: PatientTraining[];
  measurements: AnthropometricMeasurement[];
  mealPlans: MealPlanRecord[];
  createdAt: string;
  updatedAt: string;
  intakeForms: Array<{
    id: string;
    serviceSlug: string;
    submittedAt: string;
    data: {
      goal?: string | null;
      conditions?: string | null;
      notes?: string | null;
    };
  }>;
  appointments: Array<{
    id: string;
    status: string;
    scheduledAt: string | null;
    durationMin: number;
    meetingUrl: string | null;
    meetingProvider: "GOOGLE_MEET" | "ZOOM" | null;
    createdAt: string;
    service: { id: string; name: string; slug: string };
    payment: {
      id: string;
      status: string;
      amountCents: number;
      currency: string;
      approvedAt: string | null;
      rejectedReason: string | null;
    } | null;
    nutritionPlan: {
      id: string;
      title: string;
      fileUrl: string;
      sentAt: string | null;
    } | null;
  }>;
  payments: Array<{
    id: string;
    status: string;
    amountCents: number;
    currency: string;
    receiptUrl: string;
    receiptMime: string | null;
    createdAt: string;
    approvedAt: string | null;
    rejectedReason: string | null;
    appointmentId: string | null;
    service: { name: string };
  }>;
  nutritionPlans: Array<{
    id: string;
    title: string;
    fileUrl: string;
    sentAt: string | null;
    createdAt: string;
  }>;
}

export interface PatientStats {
  totalAppointments: number;
  completedAppointments: number;
  scheduledAppointments: number;
  totalPaidCents: number;
}

export async function listPatients(
  query?: string,
): Promise<{ patients: PatientListItem[] }> {
  const qs = query ? `?q=${encodeURIComponent(query)}` : "";
  const res = await authFetch(`/api/admin/patients${qs}`);
  return parseJson(res);
}

export async function getPatient(
  id: string,
): Promise<{ patient: PatientDetail; stats: PatientStats }> {
  const res = await authFetch(`/api/admin/patients/${id}`);
  return parseJson(res);
}

/** Descarga el PDF del expediente. Requiere auth Bearer. */
export async function downloadExpedientePdf(
  patientId: string,
  fallbackName = "expediente",
): Promise<void> {
  const res = await authFetch(`/api/admin/patients/${patientId}/expediente.pdf`);
  if (!res.ok) {
    if (res.status === 401) clearToken();
    throw new Error(`HTTP ${res.status}`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const cd = res.headers.get("content-disposition") ?? "";
  const match = /filename="?([^"]+)"?/.exec(cd);
  a.download = match?.[1] ?? `${fallbackName}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export type PatientUpdatePatch = Partial<{
  fullName: string;
  email: string;
  documentId: string;
  phone: string;
  whatsappNotify: boolean;
  notes: string | null;
  referralSource: string | null;
  birthDate: string | null;
  heightCm: number | null;
  allergies: string | null;
  medicalConditions: string | null;
  medications: string | null;
  alcoholNotes: string | null;
  cravingsNotes: string | null;
  waterCoffeeNotes: string | null;
  dislikedFoods: string | null;
  weekendSpots: string | null;
}>;

export async function updatePatient(
  id: string,
  patch: PatientUpdatePatch,
): Promise<{ patient: PatientDetail }> {
  const res = await authFetch(`/api/admin/patients/${id}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });
  return parseJson(res);
}

export async function addDiagnosis(
  patientId: string,
  input: Omit<PatientDiagnosis, "id" | "createdAt">,
): Promise<{ diagnosis: PatientDiagnosis }> {
  const res = await authFetch(`/api/admin/patients/${patientId}/diagnoses`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return parseJson(res);
}

export async function deleteDiagnosis(
  patientId: string,
  id: string,
): Promise<void> {
  await authFetch(`/api/admin/patients/${patientId}/diagnoses/${id}`, {
    method: "DELETE",
  });
}

export async function addTraining(
  patientId: string,
  input: Omit<PatientTraining, "id" | "createdAt">,
): Promise<{ training: PatientTraining }> {
  const res = await authFetch(`/api/admin/patients/${patientId}/trainings`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return parseJson(res);
}

export async function deleteTraining(
  patientId: string,
  id: string,
): Promise<void> {
  await authFetch(`/api/admin/patients/${patientId}/trainings/${id}`, {
    method: "DELETE",
  });
}

export async function addMeasurement(
  patientId: string,
  input: Omit<AnthropometricMeasurement, "id" | "createdAt"> & {
    measuredAt?: string;
  },
): Promise<{ measurement: AnthropometricMeasurement }> {
  const res = await authFetch(`/api/admin/patients/${patientId}/measurements`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return parseJson(res);
}

export async function deleteMeasurement(
  patientId: string,
  id: string,
): Promise<void> {
  await authFetch(`/api/admin/patients/${patientId}/measurements/${id}`, {
    method: "DELETE",
  });
}

export async function addMealPlan(
  patientId: string,
  input: Omit<MealPlanRecord, "id" | "createdAt">,
): Promise<{ mealPlan: MealPlanRecord }> {
  const res = await authFetch(`/api/admin/patients/${patientId}/meal-plans`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return parseJson(res);
}

export async function deleteMealPlan(
  patientId: string,
  id: string,
): Promise<void> {
  await authFetch(`/api/admin/patients/${patientId}/meal-plans/${id}`, {
    method: "DELETE",
  });
}

/** Envía el meal plan al correo registrado del paciente. */
export async function sendMealPlan(
  patientId: string,
  id: string,
): Promise<{ ok: true; sentTo: string }> {
  const res = await authFetch(
    `/api/admin/patients/${patientId}/meal-plans/${id}/send`,
    { method: "POST" },
  );
  return parseJson(res);
}

// ============================================================
// Servicios (admin)
// ============================================================

export interface ServiceAdmin {
  id: string;
  slug: string;
  name: string;
  description: string;
  imageUrl: string | null;
  priceCents: number;
  priceUsdCents: number | null;
  currency: string;
  durationMin: number;
  billingType: "ONE_TIME" | "MONTHLY";
  active: boolean;
  sortOrder: number;
}

export async function listAdminServices(): Promise<{ services: ServiceAdmin[] }> {
  const res = await authFetch("/api/admin/services");
  return parseJson(res);
}

export async function updateAdminService(
  id: string,
  patch: Partial<Omit<ServiceAdmin, "id" | "slug">>,
): Promise<{ service: ServiceAdmin }> {
  const res = await authFetch(`/api/admin/services/${id}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });
  return parseJson(res);
}

export async function createAdminService(input: {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  priceUsdCents?: number | null;
  durationMin: number;
  billingType: "ONE_TIME" | "MONTHLY";
  currency?: string;
  active?: boolean;
  sortOrder?: number;
}): Promise<{ service: ServiceAdmin }> {
  const res = await authFetch("/api/admin/services", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return parseJson(res);
}

/** Sube/reemplaza la imagen pública de un servicio. */
export async function uploadServiceImage(
  id: string,
  file: File,
): Promise<{ service: ServiceAdmin }> {
  const data = new FormData();
  data.append("image", file);
  const res = await authFetch(`/api/admin/services/${id}/image`, {
    method: "POST",
    body: data,
  });
  return parseJson(res);
}

export async function deleteAdminService(id: string): Promise<void> {
  const res = await authFetch(`/api/admin/services/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (res.status === 401) clearToken();
    throw new Error(data.error ?? `HTTP ${res.status}`);
  }
}

export async function setMeetingUrl(
  id: string,
  meetingUrl: string,
  meetingProvider?: "GOOGLE_MEET" | "ZOOM",
): Promise<{
  ok: true;
  appointment: {
    id: string;
    meetingUrl: string | null;
    meetingProvider: "GOOGLE_MEET" | "ZOOM" | null;
  };
}> {
  const res = await authFetch(`/api/admin/payments/${id}/meeting`, {
    method: "POST",
    body: JSON.stringify({ meetingUrl, meetingProvider }),
  });
  return parseJson(res);
}

/** Confirma la cita: el link de la videollamada es obligatorio. Marca la
 *  cita como SCHEDULED y dispara el correo al paciente con fecha + enlace. */
export async function confirmAppointment(
  paymentId: string,
  input: {
    meetingUrl: string;
    meetingProvider?: "GOOGLE_MEET" | "ZOOM";
    scheduledAt?: string;
  },
): Promise<{ ok: true; appointment: PaymentDetail["appointment"] }> {
  const res = await authFetch(
    `/api/admin/payments/${paymentId}/confirm-appointment`,
    { method: "POST", body: JSON.stringify(input) },
  );
  return parseJson(res);
}

// ============================================================
// Citas (admin) — calendario
// ============================================================

export type AppointmentStatus =
  | "AWAITING_PAYMENT"
  | "PAYMENT_APPROVED"
  | "PENDING_CONFIRMATION"
  | "SCHEDULED"
  | "COMPLETED"
  | "CANCELED"
  | "NO_SHOW";

export interface AppointmentItem {
  id: string;
  scheduledAt: string; // el endpoint solo devuelve citas con horario
  durationMin: number;
  timezone: string;
  status: AppointmentStatus;
  meetingUrl: string | null;
  meetingProvider: "GOOGLE_MEET" | "ZOOM" | null;
  notes: string | null;
  patient: { id: string; fullName: string; email: string; phone: string | null };
  service: { id: string; name: string };
  payment: {
    id: string;
    status: string;
    amountCents: number;
    currency: string;
  } | null;
}

export async function listAppointments(range?: {
  from?: string;
  to?: string;
}): Promise<{ appointments: AppointmentItem[] }> {
  const qs = new URLSearchParams();
  if (range?.from) qs.set("from", range.from);
  if (range?.to) qs.set("to", range.to);
  const q = qs.toString();
  const res = await authFetch(`/api/admin/appointments${q ? `?${q}` : ""}`);
  return parseJson(res);
}

// ============================================================
// Recordatorios / tareas (admin)
// ============================================================

export interface Reminder {
  id: string;
  text: string;
  done: boolean;
  dueAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function listReminders(): Promise<{ reminders: Reminder[] }> {
  const res = await authFetch("/api/admin/reminders");
  return parseJson(res);
}

export async function createReminder(
  text: string,
  dueAt?: string | null,
): Promise<{ reminder: Reminder }> {
  const res = await authFetch("/api/admin/reminders", {
    method: "POST",
    body: JSON.stringify({ text, dueAt: dueAt ?? null }),
  });
  return parseJson(res);
}

export async function updateReminder(
  id: string,
  patch: Partial<{ text: string; done: boolean; dueAt: string | null }>,
): Promise<{ reminder: Reminder }> {
  const res = await authFetch(`/api/admin/reminders/${id}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });
  return parseJson(res);
}

export async function deleteReminder(id: string): Promise<void> {
  const res = await authFetch(`/api/admin/reminders/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    if (res.status === 401) clearToken();
    throw new Error(`HTTP ${res.status}`);
  }
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
