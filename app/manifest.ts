import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BR Peças PB | E-commerce de Peças Automotivas",
    short_name: "BR Peças PB",
    description: "Loja oficial BR Peças PB. Peças automotivas novas e seminovas originais com qualidade testada, procedência e garantia.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B0D12",
    theme_color: "#FF6B00",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
