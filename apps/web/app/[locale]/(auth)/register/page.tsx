"use client";

import { Suspense, useState, FormEvent } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { isLocale, withLocale } from "@/lib/i18n-path";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

function safeCallbackURL(value: string | null, locale: string): string {
  const fallback = withLocale("/dashboard", locale);
  if (!value) return fallback;
  if (value.startsWith("/") && !value.startsWith("//")) {
    const firstSegment = value.split("/")[1] ?? "";
    return isLocale(firstSegment) ? value : withLocale(value, locale);
  }

  try {
    const url = new URL(value);
    const apiURL = new URL(API_BASE);
    if (
      url.origin === apiURL.origin &&
      url.pathname === "/api/v1/auth/cli-callback"
    ) {
      return url.toString();
    }
  } catch {
    return fallback;
  }

  return fallback;
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const locale = useLocale();
  const t = useTranslations("auth.register");
  const authT = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackURL = safeCallbackURL(searchParams.get("callbackURL"), locale);
  const defaultDashboard = withLocale("/dashboard", locale);
  const loginHref =
    callbackURL === defaultDashboard
      ? withLocale("/login", locale)
      : `${withLocale("/login", locale)}?callbackURL=${encodeURIComponent(callbackURL)}`;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await authClient.signUp.email({
      name,
      email,
      password,
    });

    if (authError) {
      setError(authError.message ?? t("error"));
      setLoading(false);
      return;
    }

    if (callbackURL.startsWith("http://") || callbackURL.startsWith("https://")) {
      window.location.assign(callbackURL);
    } else {
      router.push(callbackURL);
    }
  }

  async function handleOAuth(provider: "github") {
    await authClient.signIn.social({ provider, callbackURL });
  }

  return (
    <div
      style={{
        background: "#141720",
        border: "1px solid #2A2F42",
        borderRadius: 12,
        width: 400,
        padding: "40px 36px",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* Logo / wordmark */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <span
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#F0F2F8",
            letterSpacing: "-0.5px",
          }}
        >
          Jex
        </span>
        <p style={{ color: "#8B90A8", fontSize: 14, marginTop: 6 }}>
          {t("subtitle")}
        </p>
      </div>

      {/* OAuth buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        <OAuthButton
          onClick={() => handleOAuth("github")}
          label={authT("continueGithub")}
          icon={<GitHubIcon />}
        />
      </div>

      {/* Divider */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
          color: "#555A70",
          fontSize: 12,
        }}
      >
        <div style={{ flex: 1, height: 1, background: "#2A2F42" }} />
        {authT("emailDivider")}
        <div style={{ flex: 1, height: 1, background: "#2A2F42" }} />
      </div>

      {/* Registration form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field
          label={t("name")}
          type="text"
          value={name}
          onChange={setName}
          autoComplete="name"
        />
        <Field
          label={authT("email")}
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />
        <Field
          label={authT("password")}
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />

        {error && (
          <p style={{ color: "#EF4444", fontSize: 13, margin: 0 }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading ? "#4F46E5" : "#6366F1",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 0",
            fontSize: 14,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            marginTop: 4,
            transition: "background 0.15s",
          }}
        >
          {loading ? t("loading") : t("submit")}
        </button>
      </form>

      <p style={{ color: "#8B90A8", fontSize: 13, textAlign: "center", marginTop: 24 }}>
        {t("hasAccount")}{" "}
        <Link href={loginHref} style={{ color: "#6366F1" }}>
          {t("signIn")}
        </Link>
      </p>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Field({
  label,
  type,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ color: "#8B90A8", fontSize: 12, fontWeight: 500 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        style={{
          background: "#1C2030",
          border: "1px solid #2A2F42",
          borderRadius: 8,
          padding: "9px 12px",
          color: "#F0F2F8",
          fontSize: 14,
          outline: "none",
        }}
      />
    </div>
  );
}

function OAuthButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        background: "#1C2030",
        border: "1px solid #2A2F42",
        borderRadius: 8,
        padding: "10px 0",
        color: "#F0F2F8",
        fontSize: 14,
        fontWeight: 500,
        cursor: "pointer",
        width: "100%",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}
