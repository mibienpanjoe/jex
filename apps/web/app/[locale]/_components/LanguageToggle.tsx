"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { switchLocalePath, type Locale } from "@/lib/i18n-path";

export function LanguageToggle() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const nextLocale: Locale = locale === "fr" ? "en" : "fr";

  return (
    <Link
      href={switchLocalePath(pathname, nextLocale)}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-3 text-xs font-semibold transition-colors"
      style={{
        borderColor: "#E2E4EC",
        color: "#5A5F75",
        background: "#FFFFFF",
      }}
      aria-label={locale === "fr" ? "Switch to English" : "Passer au français"}
    >
      {nextLocale.toUpperCase()}
    </Link>
  );
}
