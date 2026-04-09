const steps = [
  {
    number: "01",
    label: "Vault",
    title: "Store secrets, encrypted",
    description:
      "Add secrets to the vault via the dashboard or CLI. Every value is encrypted with AES-256-GCM before it touches the database. The server never holds plaintext.",
    detail: (
      <div
        className="mt-4 rounded-lg p-3 font-mono text-xs border"
        style={{ background: "#F4F5F9", borderColor: "#E2E4EC" }}
      >
        <div style={{ color: "#6366F1" }}>$ jex secrets set DATABASE_URL=postgres://...</div>
        <div className="mt-1" style={{ color: "#22C55E" }}>✓ Set DATABASE_URL in dev.</div>
      </div>
    ),
  },
  {
    number: "02",
    label: "CLI",
    title: "Pull or inject on demand",
    description:
      "Use jex secrets pull to write an atomic .env file, or jex run to inject directly into your process environment — no file ever written.",
    detail: (
      <div
        className="mt-4 rounded-lg p-3 font-mono text-xs border"
        style={{ background: "#F4F5F9", borderColor: "#E2E4EC" }}
      >
        <div style={{ color: "#6366F1" }}>$ jex run -- node server.js</div>
        <div className="mt-1" style={{ color: "#22C55E" }}>✓ 12 secrets injected, no disk write</div>
      </div>
    ),
  },
  {
    number: "03",
    label: "Run",
    title: "Your app, with secrets",
    description:
      "Your process starts with secrets in its environment. Teammates, CI/CD pipelines, and different environments each get exactly the secrets they're authorized to see.",
    detail: (
      <div
        className="mt-4 rounded-lg p-3 font-mono text-xs border"
        style={{ background: "#F4F5F9", borderColor: "#E2E4EC" }}
      >
        <div style={{ color: "#8B90A8" }}>process.env.DATABASE_URL</div>
        <div className="mt-1" style={{ color: "#111318" }}>→ postgres://user:pass@host/db</div>
      </div>
    ),
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-24 border-t"
      style={{ borderColor: "#E2E4EC", background: "#FAFAFA" }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "#6366F1" }}
          >
            How it works
          </span>
          <h2
            className="text-3xl font-bold"
            style={{ color: "#111318", letterSpacing: "-0.03em" }}
          >
            Three steps. Start in five minutes.
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {/* Connector line (desktop only) */}
              {i < steps.length - 1 && (
                <div
                  className="hidden md:block absolute top-5 left-full w-full h-px"
                  style={{
                    background: "linear-gradient(to right, #E2E4EC, transparent)",
                    zIndex: 0,
                    width: "calc(100% - 40px)",
                    left: "calc(100% - 20px)",
                  }}
                />
              )}

              {/* Step number */}
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 shrink-0"
                  style={{
                    background: "#FFFFFF",
                    borderColor: "#6366F1",
                    color: "#6366F1",
                  }}
                >
                  {i + 1}
                </div>
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#A0A5B8" }}
                >
                  {step.label}
                </span>
              </div>

              <h3
                className="text-base font-semibold mb-2"
                style={{ color: "#111318" }}
              >
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#5A5F75" }}>
                {step.description}
              </p>
              {step.detail}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
