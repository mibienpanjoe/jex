import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { routing } from "@/i18n/routing";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Jex", template: "%s · Jex" },
  description: "Open-source secrets manager for developer teams. Manage project secrets without shared .env files.",
  icons: {
    icon: "/favicon.ico",
    apple: "/brand/jex-pangolin-app-icon.png",
  },
  openGraph: {
    title: "Jex — Secrets Manager",
    description: "Manage project secrets without shared .env files.",
    type: "website",
    images: ["/brand/jex-pangolin-mascot-compact.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang={routing.defaultLocale}
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="font-sans">{children}</body>
    </html>
  );
}
