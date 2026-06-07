import { importPage } from "nextra/pages";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { useMDXComponents as getMDXComponents } from "../../../../mdx-components";

type Locale = (typeof routing.locales)[number];

export const dynamic = "force-dynamic";

const Wrapper = getMDXComponents().wrapper!;

export async function generateMetadata(props: {
  params: Promise<{ locale: string; mdxPath?: string[] }>;
}) {
  const { locale, mdxPath } = await props.params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const { metadata } = await importPage(mdxPath, locale);
  return metadata;
}

export default async function Page(props: {
  params: Promise<{ locale: string; mdxPath?: string[] }>;
}) {
  const params = await props.params;

  if (!routing.locales.includes(params.locale as Locale)) {
    notFound();
  }

  const { default: MDXContent, toc, metadata } = await importPage(
    params.mdxPath,
    params.locale,
  );

  return (
    <Wrapper toc={toc} metadata={metadata}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  );
}
