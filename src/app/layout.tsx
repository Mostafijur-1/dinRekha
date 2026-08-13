import type { Metadata, Viewport } from "next";

import { publicEnv } from "@/lib/env";

import "./globals.css";

const title = "ছন্দ — নিজের সময়, নিজের ছন্দে";
const description =
  "কাজ, অভ্যাস ও মনোযোগের সময় সহজে নোট করুন এবং প্রতিদিনের অগ্রগতি পরিষ্কারভাবে বুঝুন।";

export const metadata: Metadata = {
  metadataBase: publicEnv.appUrl,
  title: {
    default: title,
    template: "%s · ছন্দ",
  },
  description,
  applicationName: "ছন্দ",
  authors: [{ name: "ছন্দ" }],
  creator: "ছন্দ",
  formatDetection: { telephone: false },
  openGraph: {
    title,
    description,
    type: "website",
    locale: "bn_BD",
    siteName: "ছন্দ",
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
      <body>{children}</body>
    </html>
  );
}
