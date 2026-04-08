import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jex",
  description: "Open-source secrets manager for developer teams",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
