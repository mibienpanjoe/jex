import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import nextra from "nextra";
import { defaultLocale, locales } from "./i18n/locales";

const withNextIntl = createNextIntlPlugin();

const withNextra = nextra({
  contentDirBasePath: "/docs",
  unstable_shouldAddLocaleToLinks: true,
});

const nextConfig: NextConfig = {
  i18n: {
    locales: [...locales],
    defaultLocale,
  },
  pageExtensions: ["ts", "tsx", "md", "mdx"],
};

export default withNextIntl(withNextra(nextConfig));
