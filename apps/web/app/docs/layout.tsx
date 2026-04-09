import "nextra-theme-docs/style.css";
import { Layout, Navbar } from "nextra-theme-docs";
import { getPageMap } from "nextra/page-map";

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pageMap = await getPageMap("/docs");

  return (
    <div data-theme="light">
      <Layout
        navbar={
          <Navbar
            logoLink="/"
            logo={
              <span
                className="flex items-center gap-2"
                style={{ fontWeight: 700, letterSpacing: "-0.02em" }}
              >
                <span
                  style={{
                    background: "#6366F1",
                    color: "#fff",
                    borderRadius: 6,
                    width: 24,
                    height: 24,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  J
                </span>
                Jex
              </span>
            }
          />
        }
        pageMap={pageMap}
        docsRepositoryBase="https://github.com/jex-app/jex/tree/main/apps/web/content"
        footer={
          <p style={{ fontSize: 13, color: "#A0A5B8" }}>
            MIT {new Date().getFullYear()} © Jex — Built by PARE Mibienpan Joseph
          </p>
        }
      >
        {children}
      </Layout>
    </div>
  );
}
