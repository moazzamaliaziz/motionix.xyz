export const locales = ["en", "fr", "de", "hi", "ja", "zh-cn"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  hi: "हिन्दी",
  ja: "日本語",
  "zh-cn": "简体中文",
};

export const localeFlags: Record<Locale, string> = {
  en: "🇬🇧",
  fr: "🇫🇷",
  de: "🇩🇪",
  hi: "🇮🇳",
  ja: "🇯🇵",
  "zh-cn": "🇨🇳",
};
