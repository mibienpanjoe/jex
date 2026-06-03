export const locales = ["en", "fr"] as const;

export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function withLocale(path: string, locale: string): string {
  if (path.startsWith("#")) return path;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  if (cleanPath === "/") return `/${locale}`;
  return `/${locale}${cleanPath}`;
}

export function switchLocalePath(pathname: string, nextLocale: Locale): string {
  const segments = pathname.split("/");
  if (isLocale(segments[1] ?? "")) {
    segments[1] = nextLocale;
    return segments.join("/") || `/${nextLocale}`;
  }
  return withLocale(pathname, nextLocale);
}
