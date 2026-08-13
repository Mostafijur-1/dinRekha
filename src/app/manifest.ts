import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "দিনরেখা — ব্যক্তিগত Productivity Tracker",
    short_name: "দিনরেখা",
    description: "সময়, Daily Activity ও অগ্রগতি ব্যক্তিগতভাবে track করুন।",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#f7f5ef",
    theme_color: "#1f6b4f",
    lang: "bn",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
