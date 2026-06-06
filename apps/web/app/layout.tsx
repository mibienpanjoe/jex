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
  title: { default: "Jex", template: "%s · Jex" },
  description: "Open-source secrets manager for developer teams. Share secrets, not .env files.",
  openGraph: {
    title: "Jex — Secrets Manager",
    description: "Open-source secrets manager for developer teams.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={routing.defaultLocale} className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="font-sans">{children}</body>
    </html>
  );
}
