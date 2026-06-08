import { API_URL, type MonthAvailability } from "./api";

export interface ScheduleInfo {
  appointment: {
    id: string;
    status:
      | "AWAITING_PAYMENT"
      | "PAYMENT_APPROVED"
      | "PENDING_CONFIRMATION"
      | "SCHEDULED"
      | "COMPLETED"
      | "CANCELED"
      | "NO_SHOW";
    scheduledAt: string | null;
    durationMin: number;
    timezone: string;
  };
  patient: { id: string; fullName: string; email: string; timezone: string };
  service: { id: string; name: string; slug: string; durationMin: number };
  candidateDates: string[];
}

export interface SlotsResponse {
  date: string;
  durationMin: number;
  slots: string[];
}

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data;
}

export async function fetchScheduleInfo(token: string): Promise<ScheduleInfo> {
  const res = await fetch(`${API_URL}/api/schedule/${token}`, { cache: "no-store" });
  return parseJson(res);
}

export async function fetchTokenAvailability(
  token: string,
  month: string,
): Promise<MonthAvailability> {
  const res = await fetch(`${API_URL}/api/schedule/${token}/availability?month=${month}`, {
    cache: "no-store",
  });
  return parseJson(res);
}

export async function fetchSlots(token: string, date: string): Promise<SlotsResponse> {
  const res = await fetch(`${API_URL}/api/schedule/${token}/slots?date=${date}`, {
    cache: "no-store",
  });
  return parseJson(res);
}

export async function confirmSlot(
  token: string,
  startAt: string,
): Promise<{
  ok: true;
  appointment: { id: string; status: string; scheduledAt: string };
}> {
  const res = await fetch(`${API_URL}/api/schedule/${token}/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ startAt }),
  });
  return parseJson(res);
}
