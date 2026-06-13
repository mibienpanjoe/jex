import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import nextra from "nextra";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defaultLocale, locales } from "./i18n/locales";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

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
  output: "standalone",
  outputFileTracingRoot: rootDir,
};

export default withNextIntl(withNextra(nextConfig));
