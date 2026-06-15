import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { withLocale } from "@/lib/i18n-path";

export function Hero() {
  const locale = useLocale();
  const t = useTranslations("hero");

  return (
    <section
      className="relative flex items-center pt-14 overflow-hidden lg:min-h-[calc(100svh-128px)]"
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

      <div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-20 lg:py-12 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Left: Headline + CTAs */}
        <div>
          {/* Headline */}
          <h1
            className="animate-fade-up delay-100 font-bold leading-[1.1] tracking-[-0.04em] mb-5"
            style={{
              fontSize: "clamp(40px, 6vw, 64px)",
              color: "#111318",
            }}
          >
            {t("headline")}
            <br />
            <span style={{ color: "#6366F1" }}>{t("headlineAccent")}</span>
          </h1>

          {/* Sub-headline */}
          <p
            className="animate-fade-up delay-200 text-lg leading-relaxed mb-8 max-w-md"
            style={{ color: "#5A5F75" }}
          >
            {t("subheadline")}
          </p>

          {/* CTA buttons */}
          <div className="animate-fade-up delay-300 flex flex-wrap items-center gap-3">
            <Link
              href={withLocale("/docs/self-hosting", locale)}
              className="inline-flex min-h-11 items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors bg-[#6366F1] hover:bg-[#4F46E5]"
            >
              {t("ctaPrimary")}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <a
              href="https://github.com/mibienpanjoe/jex"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors border"
              style={{ background: "#FFFFFF", color: "#111318", borderColor: "#E2E4EC" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              {t("ctaSecondary")}
            </a>
          </div>

          {/* Social proof */}
          <p className="animate-fade-up delay-400 mt-6 text-xs" style={{ color: "#A0A5B8" }}>
            {t("socialProof")}
          </p>
        </div>

        {/* Right: Mascot */}
        <div className="animate-fade-up delay-200 mx-auto w-full max-w-xl lg:max-w-none">
          <div className="relative mx-auto aspect-square w-full max-w-[460px]">
            <Image
              src="/brand/jex-pangolin-mascot-compact.png"
              alt="Pangolin mascot guarding encrypted secrets"
              fill
              priority
              sizes="(min-width: 1024px) 460px, 90vw"
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
