import { useTranslations } from "next-intl";

const steps = [
  {
    labelKey: "step1Label",
    titleKey: "step1Title",
    descriptionKey: "step1Desc",
    command: "jex secrets set DATABASE_URL=postgres://...",
    result: "Set DATABASE_URL in dev.",
    resultTone: "success" as const,
  },
  {
    labelKey: "step2Label",
    titleKey: "step2Title",
    descriptionKey: "step2Desc",
    command: "jex run -- node server.js",
    result: "12 secrets injected · no disk write",
    resultTone: "success" as const,
  },
  {
    labelKey: "step3Label",
    titleKey: "step3Title",
    descriptionKey: "step3Desc",
    command: "cat .env",
    result: "cat: .env: No such file or directory",
    resultTone: "muted" as const,
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
        {/* Header */}
        <div className="mb-16 text-center">
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
            className="mt-3 text-base max-w-xl mx-auto"
            style={{ color: "#5A5F75" }}
          >
            {t("subheadline")}
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {steps.map((step, i) => (
            <div key={step.labelKey} className="relative">
              {/* Dashed connector rail — from this circle's right edge to the
                  next circle's left edge. Desktop only. */}
              {i < steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className="hidden md:block absolute pointer-events-none"
                  style={{
                    top: "23px",
                    left: "48px",
                    width: "calc(100% - 16px)",
                    borderTop: "2px dashed #D1D5E8",
                    zIndex: 0,
                  }}
                />
              )}

              {/* Step header: number + label pill */}
              <div className="flex items-center gap-3 mb-5 relative z-10">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold shrink-0"
                  style={{
                    background: "#FFFFFF",
                    border: "2px solid #6366F1",
                    color: "#6366F1",
                    // 6px page-bg ring visually trims the dashed rail at the
                    // circle's edge; soft indigo glow gives weight.
                    boxShadow:
                      "0 0 0 6px #FAFAFA, 0 2px 10px rgba(99,102,241,0.15)",
                  }}
                >
                  {i + 1}
                </div>
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.14em] px-2 py-1 rounded"
                  style={{ background: "#EEF2FF", color: "#6366F1" }}
                >
                  {t(step.labelKey)}
                </span>
              </div>

              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: "#111318", letterSpacing: "-0.01em" }}
              >
                {t(step.titleKey)}
              </h3>
              <p
                className="text-sm leading-relaxed mb-5"
                style={{ color: "#5A5F75" }}
              >
                {t(step.descriptionKey)}
              </p>

              {/* Terminal code block */}
              <div
                className="rounded-lg border font-mono text-xs overflow-hidden"
                style={{ background: "#0D0F14", borderColor: "#1F2336" }}
              >
                {/* Chrome */}
                <div
                  className="flex items-center gap-1.5 px-3 py-2 border-b"
                  style={{ borderColor: "#1F2336" }}
                >
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ background: "#3A3F55" }}
                  />
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ background: "#3A3F55" }}
                  />
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ background: "#3A3F55" }}
                  />
                </div>
                {/* Command + result */}
                <div className="px-3 py-3 space-y-1.5">
                  <div className="whitespace-nowrap overflow-x-auto">
                    <span style={{ color: "#22C55E" }}>$</span>{" "}
                    <span style={{ color: "#F0F2F8" }}>{step.command}</span>
                  </div>
                  <div
                    style={{
                      color:
                        step.resultTone === "success" ? "#22C55E" : "#8B90A8",
                    }}
                  >
                    {step.resultTone === "success" ? "✓ " : ""}
                    {step.result}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
