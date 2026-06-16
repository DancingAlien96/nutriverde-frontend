import { headers } from "next/headers";
import { fetchServices, type Region } from "../lib/api";
import { AgendarClient, AgendarError } from "./AgendarClient";

export const metadata = {
  title: "Book a consultation — Plenha Nutrition",
};

export default async function AgendarPage() {
  let services;
  try {
    services = await fetchServices();
  } catch {
    return <AgendarError />;
  }

  // Región por defecto según el país del visitante (Cloudflare añade
  // CF-IPCountry cuando el dominio pasa por su proxy). En local no llega →
  // por defecto Guatemala. Es solo un default; el paciente puede cambiarlo.
  const country = (await headers()).get("cf-ipcountry");
  const initialRegion: Region =
    country && country.toUpperCase() !== "GT" ? "INTL" : "GT";

  return <AgendarClient services={services} initialRegion={initialRegion} />;
}
