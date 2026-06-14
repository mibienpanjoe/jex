import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];

type DocsNavItem = {
  href: string;
  label: string;
  children?: DocsNavItem[];
};

const docsCopy = {
  en: {
    title: "Jex Docs",
    intro: "Documentation for running Jex locally, managing secrets, and using the CLI.",
    home: "Home",
    switchLocale: "FR",
    nav: [
      { href: "/docs", label: "Introduction" },
      {
        href: "/docs/getting-started/installation",
        label: "Getting Started",
        children: [
          { href: "/docs/getting-started/installation", label: "Installation" },
          { href: "/docs/getting-started/quick-start", label: "Quick start" },
        ],
      },
      {
        href: "/docs/cli/login",
        label: "CLI Reference",
        children: [
          { href: "/docs/cli/login", label: "Login" },
          { href: "/docs/cli/init", label: "Init" },
          { href: "/docs/cli/secrets", label: "Secrets" },
          { href: "/docs/cli/run", label: "Run" },
          { href: "/docs/cli/envs", label: "Environments" },
          { href: "/docs/cli/logout", label: "Logout" },
        ],
      },
      { href: "/docs/environments", label: "Environments" },
      { href: "/docs/access-control", label: "Access Control" },
      { href: "/docs/ci-cd", label: "CI/CD Integration" },
      { href: "/docs/self-hosting", label: "Self-hosting" },
      { href: "/docs/faq", label: "FAQ" },
    ],
  },
  fr: {
    title: "Documentation Jex",
    intro: "Documentation pour lancer Jex localement, gérer les secrets et utiliser la CLI.",
    home: "Accueil",
    switchLocale: "EN",
    nav: [
      { href: "/docs", label: "Introduction" },
      {
        href: "/docs/getting-started/installation",
        label: "Premiers pas",
        children: [
          { href: "/docs/getting-started/installation", label: "Installation" },
          { href: "/docs/getting-started/quick-start", label: "Démarrage rapide" },
        ],
      },
      {
        href: "/docs/cli/login",
        label: "Référence CLI",
        children: [
          { href: "/docs/cli/login", label: "Connexion" },
          { href: "/docs/cli/init", label: "Init" },
          { href: "/docs/cli/secrets", label: "Secrets" },
          { href: "/docs/cli/run", label: "Run" },
          { href: "/docs/cli/envs", label: "Environnements" },
          { href: "/docs/cli/logout", label: "Déconnexion" },
        ],
      },
      { href: "/docs/environments", label: "Environnements" },
      { href: "/docs/access-control", label: "Contrôle d'accès" },
      { href: "/docs/ci-cd", label: "Intégration CI/CD" },
      { href: "/docs/self-hosting", label: "Auto-hébergement" },
      { href: "/docs/faq", label: "FAQ" },
    ],
  },
} satisfies Record<Locale, {
  title: string;
  intro: string;
  home: string;
  switchLocale: string;
  nav: DocsNavItem[];
}>;

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function DocsLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const activeLocale = locale as Locale;
  const copy = docsCopy[activeLocale];
  const otherLocale = activeLocale === "fr" ? "en" : "fr";

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", color: "#111322", fontFamily: "Inter, system-ui, sans-serif" }}>
      <header style={{ borderBottom: "1px solid #E6E8F0", background: "rgba(255,255,255,0.96)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1180, margin: "0 auto", padding: "0 24px" }}>
          <Link href={`/${activeLocale}`} style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "#111322", fontWeight: 700, textDecoration: "none" }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: "#6D28D9", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
              J
            </span>
            Jex
          </Link>
          <nav style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 14 }}>
            <Link href={`/${activeLocale}`} style={topLinkStyle}>{copy.home}</Link>
            <Link href={`/${otherLocale}/docs`} style={localeLinkStyle}>{copy.switchLocale}</Link>
          </nav>
        </div>
      </header>

      <div className="jex-docs-layout">
        <aside className="jex-docs-sidebar">
          <p style={{ margin: "0 0 8px", fontSize: 12, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>{copy.title}</p>
          <p style={{ margin: "0 0 20px", color: "#596077", fontSize: 13, lineHeight: 1.6 }}>{copy.intro}</p>
          <DocsNav locale={activeLocale} items={copy.nav} />
        </aside>

        <main style={{ minWidth: 0, maxWidth: 820 }}>
          <article className="jex-docs-content">{children}</article>
        </main>
      </div>
    </div>
  );
}

function DocsNav({ locale, items }: { locale: Locale; items: DocsNavItem[] }) {
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((item) => (
        <li key={item.href}>
          <Link href={`/${locale}${item.href}`} style={navLinkStyle}>{item.label}</Link>
          {item.children ? (
            <ul style={{ listStyle: "none", padding: "4px 0 4px 14px", margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              {item.children.map((child) => (
                <li key={child.href}>
                  <Link href={`/${locale}${child.href}`} style={subNavLinkStyle}>{child.label}</Link>
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

const topLinkStyle = {
  color: "#4B5168",
  textDecoration: "none",
  fontWeight: 600,
} satisfies React.CSSProperties;

const localeLinkStyle = {
  color: "#6D28D9",
  border: "1px solid #D8D7FF",
  borderRadius: 999,
  padding: "6px 10px",
  textDecoration: "none",
  fontWeight: 700,
} satisfies React.CSSProperties;

const navLinkStyle = {
  display: "block",
  color: "#20243A",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 650,
  padding: "6px 0",
} satisfies React.CSSProperties;

const subNavLinkStyle = {
  display: "block",
  color: "#636B83",
  textDecoration: "none",
  fontSize: 13,
  padding: "4px 0",
} satisfies React.CSSProperties;
