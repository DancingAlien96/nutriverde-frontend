export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export interface ApiService {
  id: string;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  durationMin: number;
  billingType: "ONE_TIME" | "MONTHLY";
  priceFormatted: string;
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
