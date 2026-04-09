"use client";

import { useState } from "react";
import Link from "next/link";

export function InstallBlock() {
  const [copied, setCopied] = useState(false);
  const command = "npm install -g @jex/cli";

  function handleCopy() {
    navigator.clipboard.writeText(command).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <section
      className="py-24 border-t"
      style={{ borderColor: "#E2E4EC", background: "#FAFAFA" }}
    >
      <div className="mx-auto max-w-3xl px-6 text-center">
        <span
          className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: "#6366F1" }}
        >
          Get started
        </span>
        <h2
          className="text-3xl font-bold mb-4"
          style={{ color: "#111318", letterSpacing: "-0.03em" }}
        >
          Start in 5 minutes.
        </h2>
        <p className="text-base mb-10 max-w-md mx-auto" style={{ color: "#5A5F75" }}>
          Install the CLI, log in, initialize your project, and pull secrets — all from your terminal.
        </p>

        {/* Install command */}
        <div
          className="flex items-center justify-between rounded-xl border px-5 py-4 mb-6 font-mono text-sm"
          style={{
            background: "#FFFFFF",
            borderColor: "#E2E4EC",
          }}
        >
          <span style={{ color: "#111318" }}>
            <span style={{ color: "#A0A5B8" }}>$</span>{" "}
            {command}
          </span>
          <button
            onClick={handleCopy}
            className="ml-4 shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all"
            style={{
              background: copied ? "#EEF2FF" : "#F4F5F9",
              borderColor: copied ? "#6366F1" : "#E2E4EC",
              color: copied ? "#6366F1" : "#5A5F75",
            }}
            aria-label="Copy install command"
          >
            {copied ? (
              <>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M8 4V2a1 1 0 00-1-1H2a1 1 0 00-1 1v5a1 1 0 001 1h2" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
                Copy
              </>
            )}
          </button>
        </div>

        {/* Then steps */}
        <div
          className="rounded-xl border p-5 text-left font-mono text-sm space-y-1.5 mb-8"
          style={{ background: "#0D0F14", borderColor: "#1F2336" }}
        >
          <div style={{ color: "#555A70" }}># Then log in and initialize</div>
          <div>
            <span style={{ color: "#22C55E" }}>$</span>{" "}
            <span style={{ color: "#F0F2F8" }}>jex login</span>
          </div>
          <div>
            <span style={{ color: "#22C55E" }}>$</span>{" "}
            <span style={{ color: "#F0F2F8" }}>jex init</span>
          </div>
          <div>
            <span style={{ color: "#22C55E" }}>$</span>{" "}
            <span style={{ color: "#F0F2F8" }}>jex secrets pull</span>
          </div>
          <div>
            <span style={{ color: "#22C55E" }}>$</span>{" "}
            <span style={{ color: "#F0F2F8" }}>jex run</span>
            <span style={{ color: "#555A70" }}> -- </span>
            <span style={{ color: "#6366F1" }}>npm run dev</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: "#6366F1" }}
          >
            Create free account
          </Link>
          <Link
            href="/docs/getting-started/quick-start"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium border transition-colors"
            style={{ background: "#FFFFFF", color: "#111318", borderColor: "#E2E4EC" }}
          >
            Read the docs →
          </Link>
        </div>
      </div>
    </section>
  );
}
