import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import nextra from "nextra";

const withNextIntl = createNextIntlPlugin();

const withNextra = nextra({
  contentDirBasePath: "/docs",
});

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
};

export default withNextIntl(withNextra(nextConfig));
