import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import nextra from "nextra";

const withNextIntl = createNextIntlPlugin();

const withNextra = nextra({
  contentDirBasePath: "/docs",
  unstable_shouldAddLocaleToLinks: true,
});

const nextConfig: NextConfig = {
  i18n: {
    locales: ["en", "fr"],
    defaultLocale: "fr",
  },
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  output: "standalone",
};

export default withNextIntl(withNextra(nextConfig));
