import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { withLocale } from "@/lib/i18n-path";

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.projects.meta" });

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0D0F14",
        color: "#F0F2F8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <section style={{ maxWidth: 460, textAlign: "center" }}>
        <h1 style={{ margin: "0 0 12px", fontSize: 34, letterSpacing: "-0.03em" }}>Jex</h1>
        <p style={{ margin: "0 0 28px", color: "#A0A5B8", lineHeight: 1.7 }}>{t("description")}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <Link
            href={withLocale("/dashboard", locale)}
            style={{
              minHeight: 44,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 18px",
              borderRadius: 8,
              background: "#6366F1",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Open dashboard
          </Link>
          <Link
            href={withLocale("/login", locale)}
            style={{
              minHeight: 44,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 18px",
              borderRadius: 8,
              border: "1px solid #2A2F42",
              color: "#F0F2F8",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
