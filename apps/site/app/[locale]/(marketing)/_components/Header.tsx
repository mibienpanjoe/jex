"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { withLocale } from "@/lib/i18n-path";
import { LanguageToggle } from "../../_components/LanguageToggle";

export function Header() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all"
      style={{
        background: scrolled
          ? "rgba(250,250,250,0.85)"
          : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #E2E4EC" : "1px solid transparent",
        transition: "background 200ms ease, border-color 200ms ease, backdrop-filter 200ms ease",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href={withLocale("/", locale)} className="flex min-h-11 items-center gap-2 group">
          <img
            src="/brand/jex-pangolin-mark.svg"
            alt=""
            className="h-7 w-7 rounded-lg"
            width={28}
            height={28}
          />
          <span
            className="text-base font-bold tracking-tight"
            style={{ color: "#111318", letterSpacing: "-0.02em" }}
          >
            Jex
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {[
            { label: t("features"), href: "#features" },
            { label: t("howItWorks"), href: "#how-it-works" },
            { label: t("docs"), href: withLocale("/docs", locale) },
            { label: t("github"), href: "https://github.com/mibienpanjoe/jex", external: true },
          ].map(({ label, href, external }) => (
            <Link
              key={label}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="inline-flex min-h-11 items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
              style={{ color: "#5A5F75" }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = "#111318";
                (e.target as HTMLElement).style.background = "#F4F5F9";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = "#5A5F75";
                (e.target as HTMLElement).style.background = "transparent";
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* CTA group */}
        <div className="hidden lg:flex items-center gap-3">
          <LanguageToggle />
          <Link
            href={withLocale("/docs/self-hosting", locale)}
            className="inline-flex min-h-11 items-center text-sm font-medium px-4 py-1.5 rounded-lg text-white transition-colors"
            style={{ background: "#6366F1" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#4F46E5")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#6366F1")}
          >
            {t("selfHost")}
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="lg:hidden flex h-11 w-11 items-center justify-center rounded-lg"
          style={{ color: "#5A5F75" }}
          aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
          aria-controls="marketing-mobile-menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            {menuOpen ? (
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          id="marketing-mobile-menu"
          className="fixed inset-x-0 top-14 z-50 lg:hidden border-y px-4 sm:px-6 py-4 flex flex-col gap-1 shadow-lg"
          style={{
            background: "#FAFAFA",
            borderColor: "#E2E4EC",
            boxShadow: "0 20px 40px rgba(17,19,24,0.08)",
          }}
        >
          {[
            { label: t("features"), href: "#features" },
            { label: t("howItWorks"), href: "#how-it-works" },
            { label: t("docs"), href: withLocale("/docs", locale) },
            { label: t("github"), href: "https://github.com/mibienpanjoe/jex" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium"
              style={{ color: "#5A5F75" }}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            href={withLocale("/docs/self-hosting", locale)}
            className="mt-2 flex min-h-11 items-center justify-center px-4 text-sm font-medium text-center rounded-lg text-white"
            style={{ background: "#6366F1" }}
            onClick={() => setMenuOpen(false)}
          >
            {t("selfHost")}
          </Link>
          <div className="pt-2">
            <LanguageToggle />
          </div>
        </div>
      )}
    </header>
  );
}
