import type { MetadataRoute } from "next";

/**
 * Manifiesto PWA del panel de administración. El `scope` limita la app
 * instalada a /admin: el sitio público no ofrece instalación y, dentro de
 * la app, cualquier enlace fuera de /admin se abre en el navegador normal.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/admin/",
    name: "Plenha Nutrition — Panel",
    short_name: "Plenha Admin",
    description: "Agenda, pacientes y pagos de Plenha Nutrition.",
    start_url: "/admin/citas",
    scope: "/admin/",
    display: "standalone",
    orientation: "portrait",
    lang: "es",
    background_color: "#f8f4ea",
    theme_color: "#6f854c",
    icons: [
      { src: "/icons/admin-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/admin-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/admin-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
