import { useTranslations } from "next-intl";

const steps = [
  {
    labelKey: "step1Label",
    titleKey: "step1Title",
    descriptionKey: "step1Desc",
  },
  {
    labelKey: "step2Label",
    titleKey: "step2Title",
    descriptionKey: "step2Desc",
  },
  {
    labelKey: "step3Label",
    titleKey: "step3Title",
    descriptionKey: "step3Desc",
  },
];

const terminalRows = [
  {
    command: "jex secrets set DATABASE_URL=postgres://...",
    result: "Set DATABASE_URL in dev.",
    tone: "success" as const,
  },
  {
    command: "jex run -- node server.js",
    result: "12 secrets injected · no disk write",
    tone: "success" as const,
  },
  {
    command: "cat .env",
    result: "cat: .env: No such file or directory",
    tone: "muted" as const,
  },
];

export function HowItWorks() {
  const t = useTranslations("howItWorks");

  return (
    <section
      id="how-it-works"
      className="py-24 border-t"
      style={{ borderColor: "#E2E4EC", background: "#FAFAFA" }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 max-w-2xl">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "#6366F1" }}
          >
            {t("sectionLabel")}
          </span>
          <h2
            className="text-3xl font-bold tracking-tight"
            style={{ color: "#111318", letterSpacing: "-0.03em" }}
          >
            {t("headline")}
          </h2>
          <p
            className="mt-3 text-base max-w-xl"
            style={{ color: "#5A5F75" }}
          >
            {t("subheadline")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-8 lg:gap-12 items-start">
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div
                key={step.labelKey}
                className="grid grid-cols-[44px_minmax(0,1fr)] gap-4 rounded-xl border p-4 sm:p-5"
                style={{ background: "#FFFFFF", borderColor: "#E2E4EC" }}
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-sm font-semibold"
                  style={{
                    background: "#EEF2FF",
                    color: "#6366F1",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <div
                    className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: "#6366F1" }}
                  >
                    {t(step.labelKey)}
                  </div>
                  <h3
                    className="text-base font-semibold"
                    style={{ color: "#111318" }}
                  >
                    {t(step.titleKey)}
                  </h3>
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: "#5A5F75" }}
                  >
                    {t(step.descriptionKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div
            className="overflow-hidden rounded-xl border font-mono shadow-2xl"
            style={{
              background: "#0D0F14",
              borderColor: "#1F2336",
              boxShadow: "0 24px 48px rgba(17,19,24,0.16)",
            }}
          >
            <div
              className="flex items-center gap-2 border-b px-4 py-3"
              style={{ borderColor: "#1F2336" }}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#EF4444" }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#F59E0B" }} />
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#22C55E" }} />
              <span className="ml-2 text-xs" style={{ color: "#555A70" }}>
                jex workflow
              </span>
            </div>

            <div className="space-y-5 p-4 text-xs leading-relaxed sm:p-5 sm:text-sm">
              {terminalRows.map((row) => (
                <div key={row.command} className="min-w-0">
                  <div className="flex min-w-0 items-start gap-2">
                    <span className="shrink-0" style={{ color: "#22C55E" }}>
                      $
                    </span>
                    <code
                      className="min-w-0 break-words"
                      style={{ color: "#F0F2F8" }}
                    >
                      {row.command}
                    </code>
                  </div>
                  <div
                    className="mt-1 pl-4"
                    style={{
                      color: row.tone === "success" ? "#22C55E" : "#8B90A8",
                    }}
                  >
                    {row.tone === "success" ? "✓ " : ""}
                    {row.result}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
