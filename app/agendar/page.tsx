import { fetchServices } from "../lib/api";
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

  return <AgendarClient services={services} />;
}
