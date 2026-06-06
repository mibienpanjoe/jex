import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.projects.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return children;
}
