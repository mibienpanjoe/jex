import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.meta" });

  return {
    title: t("registerTitle"),
    description: t("description"),
  };
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
