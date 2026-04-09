import Link from "next/link";

function TerminalDemo() {
  return (
    <div
      className="rounded-xl overflow-hidden shadow-2xl"
      style={{
        background: "#0D0F14",
        border: "1px solid #2A2F42",
        boxShadow: "0 32px 64px rgba(0,0,0,0.25), 0 0 0 1px rgba(99,102,241,0.08)",
      }}
    >
      {/* Window chrome */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ borderBottom: "1px solid #1F2336" }}
      >
        <div className="w-3 h-3 rounded-full" style={{ background: "#EF4444" }} />
        <div className="w-3 h-3 rounded-full" style={{ background: "#F59E0B" }} />
        <div className="w-3 h-3 rounded-full" style={{ background: "#22C55E" }} />
        <span
          className="ml-2 text-xs font-mono"
          style={{ color: "#555A70" }}
        >
          terminal
        </span>
      </div>

      {/* Terminal content */}
      <div className="p-5 font-mono text-sm leading-relaxed space-y-1">
        {/* Command 1 */}
        <div className="flex items-center gap-2">
          <span style={{ color: "#22C55E" }}>$</span>
          <span style={{ color: "#8B90A8" }}>jex</span>
          <span style={{ color: "#F0F2F8" }}>secrets pull</span>
        </div>
        <div style={{ color: "#555A70" }} className="pl-4">
          ✓ Fetching secrets for{" "}
          <span style={{ color: "#8B90A8" }}>my-app</span>
          {" "}
          <span
            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
            style={{ background: "rgba(34,197,94,0.12)", color: "#22C55E" }}
          >
            dev
          </span>
        </div>
        <div style={{ color: "#22C55E" }} className="pl-4">
          ✓ Pulled 14 secrets to .env
        </div>

        {/* Spacer */}
        <div className="py-1" />

        {/* Command 2 */}
        <div className="flex items-center gap-2">
          <span style={{ color: "#22C55E" }}>$</span>
          <span style={{ color: "#8B90A8" }}>jex</span>
          <span style={{ color: "#F0F2F8" }}>run</span>
          <span style={{ color: "#555A70" }}>--</span>
          <span style={{ color: "#6366F1" }}>npm run dev</span>
        </div>
        <div style={{ color: "#555A70" }} className="pl-4">
          ● Injecting 14 secrets into environment
        </div>
        <div style={{ color: "#22C55E" }} className="pl-4">
          ✓ No .env file written to disk
        </div>
        <div className="pl-4" style={{ color: "#555A70" }}>
          &gt;{" "}
          <span style={{ color: "#8B90A8" }}>my-app@1.0.0</span>{" "}
          dev
        </div>
        <div className="pl-4" style={{ color: "#555A70" }}>
          &gt;{" "}
          <span style={{ color: "#F0F2F8" }}>next dev</span>
        </div>
        <div className="pl-4 pt-1" style={{ color: "#8B90A8" }}>
          ▲ Next.js 15.0.0
        </div>
        <div className="pl-4" style={{ color: "#555A70" }}>
          - Local:{" "}
          <span style={{ color: "#6366F1" }}>http://localhost:3000</span>
        </div>

        {/* Blinking cursor */}
        <div className="flex items-center gap-2 pt-2">
          <span style={{ color: "#22C55E" }}>$</span>
          <span
            className="cursor-blink inline-block w-2 h-4 align-middle"
            style={{ background: "#6366F1" }}
          />
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section
      className="relative min-h-screen flex items-center pt-14 overflow-hidden"
      style={{ background: "#FAFAFA" }}
    >
      {/* Dot-grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, #D0D3E8 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          opacity: 0.5,
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)",
        }}
      />

      {/* Indigo glow blob top-right */}
      <div
        className="pointer-events-none absolute -top-40 right-0 w-[600px] h-[500px]"
        style={{
          background: "radial-gradient(ellipse at top right, rgba(99,102,241,0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left: Headline + CTAs */}
        <div>
          {/* Pill badge */}
          <div className="animate-fade-up mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium"
            style={{ borderColor: "#E2E4EC", background: "#FFFFFF", color: "#5A5F75" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#22C55E" }}
            />
            Open-source · MIT License
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-up delay-100 font-bold leading-[1.1] tracking-[-0.04em] mb-5"
            style={{
              fontSize: "clamp(40px, 6vw, 64px)",
              color: "#111318",
            }}
          >
            Share secrets,
            <br />
            <span style={{ color: "#6366F1" }}>not .env files.</span>
          </h1>

          {/* Sub-headline */}
          <p
            className="animate-fade-up delay-200 text-lg leading-relaxed mb-8 max-w-md"
            style={{ color: "#5A5F75" }}
          >
            Jex is an open-source secrets manager for developer teams. Encrypted vault,
            Go CLI, and a dashboard — without ever leaking a plaintext value.
          </p>

          {/* CTA buttons */}
          <div className="animate-fade-up delay-300 flex flex-wrap items-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors bg-[#6366F1] hover:bg-[#4F46E5]"
            >
              Get started for free
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <a
              href="https://github.com/jex-app/jex"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors border"
              style={{ background: "#FFFFFF", color: "#111318", borderColor: "#E2E4EC" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              View on GitHub
            </a>
          </div>

          {/* Social proof */}
          <p className="animate-fade-up delay-400 mt-6 text-xs" style={{ color: "#A0A5B8" }}>
            Free and self-hostable · AES-256-GCM encryption · RBAC · Audit trail
          </p>
        </div>

        {/* Right: Terminal demo */}
        <div className="animate-fade-up delay-200 lg:block">
          <TerminalDemo />
        </div>
      </div>
    </section>
  );
}
