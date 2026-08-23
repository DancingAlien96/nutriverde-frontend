import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      // Imágenes de servicios servidas por el backend
      {
        protocol: "http",
        hostname: "localhost",
        port: "4001",
      },
      {
        protocol: "https",
        hostname: "backendnutriverde.pruebascunori.shop",
      },
      {
        protocol: "https",
        hostname: "api.plenhanutrition.com",
      },
    ],
  },
};

export default nextConfig;
