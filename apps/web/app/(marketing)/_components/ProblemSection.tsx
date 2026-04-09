"use client";

const problems = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    ),
    headline: "No more Slack DMs",
    body: "Sharing secrets over chat is a security incident waiting to happen. Jex gives every team member the exact secret they need — no message history to audit.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>
    ),
    headline: "No more stale credentials",
    body: "One vault, one source of truth. When a secret rotates, every developer and every environment gets the update automatically — no manual sync.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M4.93 4.93l14.14 14.14"/>
      </svg>
    ),
    headline: "No more accidental commits",
    body: "jex run injects secrets at process launch — in memory, never to disk. No .env file, no accidental git add, no exposure in your repository history.",
  },
];

export function ProblemSection() {
  return (
    <section
      id="features"
      className="py-24 border-t"
      style={{ borderColor: "#E2E4EC", background: "#FFFFFF" }}
    >
      <div className="mx-auto max-w-6xl px-6">
        {/* Section label */}
        <div className="mb-12 text-center">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "#6366F1" }}
          >
            The problem
          </span>
          <h2
            className="text-3xl font-bold tracking-tight"
            style={{ color: "#111318", letterSpacing: "-0.03em" }}
          >
            Your secrets are scattered.
          </h2>
          <p className="mt-3 text-base max-w-xl mx-auto" style={{ color: "#5A5F75" }}>
            Every team develops workarounds. None of them are secure. Jex fixes the root cause.
          </p>
        </div>

        {/* 3-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map(({ icon, headline, body }) => (
            <div
              key={headline}
              className="rounded-xl p-6 border transition-all"
              style={{
                background: "#FFFFFF",
                borderColor: "#E2E4EC",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "#6366F1";
                el.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.08)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.borderColor = "#E2E4EC";
                el.style.boxShadow = "none";
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ background: "#EEF2FF", color: "#6366F1" }}
              >
                {icon}
              </div>
              <h3
                className="text-base font-semibold mb-2"
                style={{ color: "#111318" }}
              >
                {headline}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#5A5F75" }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
