import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="border-t py-10"
      style={{ borderColor: "#E2E4EC", background: "#FFFFFF" }}
    >
      <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo + tagline */}
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold"
            style={{ background: "#6366F1" }}
          >
            J
          </div>
          <span className="text-sm font-semibold" style={{ color: "#111318" }}>
            Jex
          </span>
          <span className="text-xs" style={{ color: "#A0A5B8" }}>
            · MIT License · Built by{" "}
            <a
              href="https://github.com/mibienpanjoe"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: "#5A5F75" }}
            >
              PARE Mibienpan Joseph
            </a>
          </span>
        </div>

        {/* Links */}
        <nav className="flex items-center gap-5">
          {[
            { label: "Docs", href: "/docs" },
            { label: "GitHub", href: "https://github.com/mibienpanjoe/jex", external: true },
            { label: "Login", href: "/login" },
          ].map(({ label, href, external }) => (
            <Link
              key={label}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="text-xs font-medium transition-colors hover:underline"
              style={{ color: "#5A5F75" }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
