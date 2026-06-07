import "nextra-theme-docs/style.css";
import { Search } from "nextra/components";
import { LastUpdated, Layout, LocaleSwitch, Navbar } from "nextra-theme-docs";
import { getPageMap } from "nextra/page-map";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

type Locale = (typeof routing.locales)[number];

const docsCopy = {
  en: {
    editLink: "Edit this page",
    feedback: "Question? Give us feedback",
    footer: "Built by",
    lastUpdated: "Last updated on",
    searchEmpty: "No results found.",
    searchError: "Failed to load search index.",
    searchLoading: "Loading...",
    searchPlaceholder: "Search documentation...",
    themeDark: "Dark",
    themeLight: "Light",
    themeSystem: "System",
    tocBackToTop: "Scroll to top",
    tocTitle: "On this page",
  },
  fr: {
    editLink: "Modifier cette page",
    feedback: "Une question ? Envoyer un retour",
    footer: "Construit par",
    lastUpdated: "Dernière mise à jour le",
    searchEmpty: "Aucun résultat trouvé.",
    searchError: "Impossible de charger l'index de recherche.",
    searchLoading: "Chargement...",
    searchPlaceholder: "Rechercher dans la documentation...",
    themeDark: "Sombre",
    themeLight: "Clair",
    themeSystem: "Système",
    tocBackToTop: "Retour en haut",
    tocTitle: "Sur cette page",
  },
} satisfies Record<Locale, Record<string, string>>;

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function DocsLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const copy = docsCopy[locale as Locale];
  const pageMap = await getPageMap(`/${locale}/docs`);

  return (
    <div data-theme="light">
      <Layout
        navbar={
          <Navbar
            logoLink={`/${locale}`}
            logo={
              <span
                className="flex items-center gap-2"
                style={{ fontWeight: 700, letterSpacing: "-0.02em" }}
              >
                <span
                  style={{
                    background: "#6366F1",
                    color: "#fff",
                    borderRadius: 6,
                    width: 24,
                    height: 24,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  J
                </span>
                Jex
              </span>
            }
          >
            <LocaleSwitch />
          </Navbar>
        }
        pageMap={pageMap}
        docsRepositoryBase="https://github.com/mibienpanjoe/jex/tree/main/apps/web/content"
        editLink={copy.editLink}
        feedback={{
          content: copy.feedback,
          labels: "feedback",
        }}
        i18n={[
          { locale: "fr", name: "Français" },
          { locale: "en", name: "English" },
        ]}
        lastUpdated={<LastUpdated locale={locale}>{copy.lastUpdated}</LastUpdated>}
        search={
          <Search
            placeholder={copy.searchPlaceholder}
            emptyResult={copy.searchEmpty}
            errorText={copy.searchError}
            loading={copy.searchLoading}
          />
        }
        themeSwitch={{
          dark: copy.themeDark,
          light: copy.themeLight,
          system: copy.themeSystem,
        }}
        toc={{
          backToTop: copy.tocBackToTop,
          title: copy.tocTitle,
        }}
        footer={
          <p style={{ fontSize: 13, color: "#A0A5B8" }}>
            MIT {new Date().getFullYear()} © Jex — {copy.footer} PARE Mibienpan Joseph
          </p>
        }
      >
        {children}
      </Layout>
    </div>
  );
}
