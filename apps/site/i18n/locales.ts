export const locales = ["en", "fr"] as const;

export const defaultLocale = "fr";

export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}
