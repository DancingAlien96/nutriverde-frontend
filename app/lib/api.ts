export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface ApiService {
  id: string;
  slug: string;
  name: string;
  description: string;
  // Traducciones overlay (pueden faltar en servicios viejos → fallback a name/description)
  nameEn?: string | null;
  nameEs?: string | null;
  descriptionEn?: string | null;
  descriptionEs?: string | null;
  priceCents: number;
  currency: string;
  durationMin: number;
  billingType: "ONE_TIME" | "MONTHLY";
  priceFormatted: string;
}

/** Devuelve el nombre/descripción del servicio en el idioma pedido. */
export function localizedService(
  s: ApiService,
  locale: "en" | "es",
): { name: string; description: string } {
  if (locale === "es") {
    return {
      name: s.nameEs || s.name,
      description: s.descriptionEs || s.description,
    };
  }
  return {
    name: s.nameEn || s.name,
    description: s.descriptionEn || s.description,
  };
}

export async function fetchServices(): Promise<ApiService[]> {
  const res = await fetch(`${API_URL}/api/services`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to fetch services: ${res.status}`);
  const data = (await res.json()) as { services: ApiService[] };
  return data.services;
}

export interface IntakeResult {
  ok: true;
  intakeId: string;
  appointmentId: string;
  message: string;
}

export interface IntakeErrorResult {
  error: string;
  issues?: Record<string, string[] | undefined>;
  details?: unknown;
}

export type DayStatus = "AVAILABLE" | "FULL" | "BLOCKED";

export interface MonthAvailability {
  month: string;
  workingDaysOfWeek: number[];
  days: Record<string, DayStatus>;
  durationMin: number;
}

export async function fetchServiceAvailability(
  slug: string,
  month: string,
): Promise<MonthAvailability> {
  const res = await fetch(
    `${API_URL}/api/services/${slug}/availability?month=${month}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchServiceCandidateDates(slug: string): Promise<string[]> {
  const res = await fetch(`${API_URL}/api/services/${slug}/candidate-dates`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as { candidateDates: string[] };
  return data.candidateDates;
}

export async function fetchServiceSlots(
  slug: string,
  date: string,
): Promise<{ date: string; durationMin: number; slots: string[] }> {
  const res = await fetch(
    `${API_URL}/api/services/${slug}/slots?date=${date}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function submitIntake(
  formData: FormData,
): Promise<IntakeResult> {
  const res = await fetch(`${API_URL}/api/intake`, {
    method: "POST",
    body: formData,
  });

  const payload = (await res.json()) as IntakeResult | IntakeErrorResult;

  if (!res.ok) {
    const err = payload as IntakeErrorResult;
    const firstIssue = err.issues
      ? Object.values(err.issues).flat().filter(Boolean)[0]
      : null;
    throw new Error(firstIssue ?? err.error ?? "Error desconocido");
  }

  return payload as IntakeResult;
}
