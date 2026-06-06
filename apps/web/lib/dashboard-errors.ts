"use client";

import { withLocale } from "@/lib/i18n-path";

type DashboardErrorOptions = {
  locale: string;
  router: {
    replace: (href: string) => void;
  };
  fallbackPath?: string;
  onRecoverableError?: () => void;
};

export function getErrorStatus(err: unknown): number | undefined {
  if (typeof err === "object" && err !== null && "status" in err) {
    const status = (err as { status?: unknown }).status;
    return typeof status === "number" ? status : undefined;
  }

  return undefined;
}

export function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof TypeError && err.message === "Failed to fetch") {
    return fallback;
  }

  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export function handleDashboardLoadError(
  err: unknown,
  { locale, router, fallbackPath = "/dashboard", onRecoverableError }: DashboardErrorOptions
) {
  const status = getErrorStatus(err);

  if (status === 401 || status === 403) {
    const callbackURL = withLocale(fallbackPath, locale);
    router.replace(
      `${withLocale("/login", locale)}?callbackURL=${encodeURIComponent(callbackURL)}`
    );
    return;
  }

  if (status === 404) {
    router.replace(withLocale(fallbackPath, locale));
    return;
  }

  onRecoverableError?.();
}
