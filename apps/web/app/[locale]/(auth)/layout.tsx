import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LanguageToggle } from "../_components/LanguageToggle";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{ background: "#0D0F14", minHeight: "100vh" }}
      className="relative flex items-center justify-center"
    >
      <div className="absolute right-6 top-6">
        <LanguageToggle />
      </div>
      {children}
    </div>
  );
}
