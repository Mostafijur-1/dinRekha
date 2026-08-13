import type { Metadata, Viewport } from "next";

import { publicEnv } from "@/lib/env";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";

import "./globals.css";

const title = "দিনরেখা — দিন কোথায় গেল, রেখায় দেখুন";
const description =
  "কাজ, অভ্যাস ও মনোযোগের সময় সহজে নোট করুন এবং প্রতিদিনের অগ্রগতি পরিষ্কারভাবে বুঝুন।";

export const metadata: Metadata = {
  metadataBase: publicEnv.appUrl,
  title: {
    default: title,
    template: "%s · দিনরেখা",
  },
  description,
  applicationName: "দিনরেখা",
  authors: [{ name: "দিনরেখা" }],
  creator: "দিনরেখা",
  formatDetection: { telephone: false },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  openGraph: {
    title,
    description,
    type: "website",
    locale: "bn_BD",
    siteName: "দিনরেখা",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f5ef" },
    { media: "(prefers-color-scheme: dark)", color: "#101712" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
