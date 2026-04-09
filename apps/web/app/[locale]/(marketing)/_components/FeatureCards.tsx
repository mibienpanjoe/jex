const features = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0110 0v4"/>
      </svg>
    ),
    title: "AES-256-GCM Encryption",
    description: "Every secret is encrypted before it reaches the database. The server never holds plaintext values — your keys, your control.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87m-4-12a4 4 0 010 7.75"/>
      </svg>
    ),
    title: "Role-Based Access Control",
    description: "Owners, members, and read-only roles. Scope CI/CD tokens to a single environment. The last owner can never be removed.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="4 17 10 11 4 5"/>
        <line x1="12" y1="19" x2="20" y2="19"/>
      </svg>
    ),
    title: "Environment Segmentation",
    description: "dev, staging, prod — each environment is isolated. A member scoped to dev cannot read prod secrets, by design.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <path d="M9 12h6M9 16h4"/>
      </svg>
    ),
    title: "Append-Only Audit Trail",
    description: "Every read, write, and delete is recorded atomically alongside the secret operation. Immutable. Filterable. Always consistent.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93l-1.41 1.41M5.34 18.66l-1.41 1.41M20 12h2M2 12h2M19.07 19.07l-1.41-1.41M5.34 5.34L3.93 3.93"/>
      </svg>
    ),
    title: "CI/CD Tokens",
    description: "Create scoped tokens for pipelines with read-only access to a single environment. Revoke them instantly — no cache, no delay.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
      </svg>
    ),
    title: "Self-Hostable",
    description: "Run the full stack with docker-compose up. Open-source, MIT licensed. No vendor lock-in, no data leaving your infrastructure.",
  },
];

export function FeatureCards() {
  return (
    <section
      className="py-24 border-t"
      style={{ borderColor: "#E2E4EC", background: "#FFFFFF" }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "#6366F1" }}
          >
            Features
          </span>
          <h2
            className="text-3xl font-bold"
            style={{ color: "#111318", letterSpacing: "-0.03em" }}
          >
            Everything a team needs.
          </h2>
          <p className="mt-3 text-base max-w-xl mx-auto" style={{ color: "#5A5F75" }}>
            Built for developer teams who take security seriously without sacrificing developer experience.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon, title, description }) => (
            <div
              key={title}
              className="rounded-xl p-5 border transition-all"
              style={{
                background: "#FFFFFF",
                borderColor: "#E2E4EC",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "#6366F1";
                el.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.08)";
                el.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "#E2E4EC";
                el.style.boxShadow = "none";
                el.style.transform = "none";
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                style={{ background: "#EEF2FF", color: "#6366F1" }}
              >
                {icon}
              </div>
              <h3
                className="text-sm font-semibold mb-2"
                style={{ color: "#111318" }}
              >
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#5A5F75" }}>
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
