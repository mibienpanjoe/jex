import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { withLocale } from "@/lib/i18n-path";

export function Footer() {
  const locale = useLocale();
  const nav = useTranslations("nav");
  const footer = useTranslations("footer");

  return (
    <footer
      className="border-t py-10"
      style={{ borderColor: "#E2E4EC", background: "#FFFFFF" }}
    >
      <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo + tagline */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold"
            style={{ background: "#6366F1" }}
          >
            J
          </div>
          <span className="text-sm font-semibold" style={{ color: "#111318" }}>
            Jex
          </span>
          <span className="text-xs" style={{ color: "#A0A5B8" }}>
            · {footer("license")} · {footer("builtBy")}{" "}
            <a
              href="https://github.com/mibienpanjoe"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center hover:underline"
              style={{ color: "#5A5F75" }}
            >
              PARE Mibienpan Joseph
            </a>
          </span>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {[
            { label: nav("docs"), href: "/docs" },
            { label: nav("github"), href: "https://github.com/mibienpanjoe/jex", external: true },
            { label: nav("login"), href: withLocale("/login", locale) },
          ].map(({ label, href, external }) => (
            <Link
              key={label}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="inline-flex min-h-11 items-center rounded-lg px-2 text-xs font-medium transition-colors hover:underline"
              style={{ color: "#5A5F75" }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
