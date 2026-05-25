import { importPage } from "nextra/pages";
import { useMDXComponents as getMDXComponents } from "../../../mdx-components";

// Docs render on demand instead of SSG. Nextra v4's <Layout> from
// nextra-theme-docs crashes during prerender when mounted at a sub-route
// (/docs/*) instead of the root layout — its theme context isn't established.
// Moving <Layout> to app/layout.tsx would force it onto every marketing and
// dashboard page too, which is wrong. Dynamic rendering is fine for a
// low-traffic docs site.
export const dynamic = "force-dynamic";

const Wrapper = getMDXComponents().wrapper!;

export async function generateMetadata(props: {
  params: Promise<{ mdxPath?: string[] }>;
}) {
  const params = await props.params;
  const { metadata } = await importPage(params.mdxPath);
  return metadata;
}

export default async function Page(props: {
  params: Promise<{ mdxPath?: string[] }>;
}) {
  const params = await props.params;
  const { default: MDXContent, toc, metadata } = await importPage(
    params.mdxPath,
  );
  return (
    <Wrapper toc={toc} metadata={metadata}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  );
}
