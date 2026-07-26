import { locales, defaultLocale } from "@/i18n/config";
import { TOOLS_SITE_URL } from "@/lib/cn";

/**
 * Build a locale-prefixed absolute URL for a given path, honoring the
 * `localePrefix: "as-needed"` routing strategy (the default locale is
 * served without a prefix, every other locale gets a `/<locale>` prefix).
 */
export function localizedUrl(locale: string, path: string): string {
  const clean = path === "/" ? "" : `/${path.replace(/^\/+/, "").replace(/\/+$/, "")}`;
  const prefix = locale === defaultLocale ? "" : `/${locale}`;
  return `${TOOLS_SITE_URL}${prefix}${clean || (prefix ? "" : "/")}`;
}

/**
 * Metadata `alternates` block with a per-locale canonical plus hreflang
 * `languages` map (including `x-default`) for a given page path.
 *
 * @param path   Route path without locale prefix, e.g. "/", "/about",
 *               "/tools/background-remover".
 * @param locale Current request locale — used for the canonical URL.
 */
/** Map a route locale to a BCP-47 hreflang code (region subtag uppercased). */
function hreflangCode(locale: string): string {
  const [lang, region] = locale.split("-");
  return region ? `${lang}-${region.toUpperCase()}` : lang;
}

export function alternatesFor(path: string, locale: string) {
  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[hreflangCode(l)] = localizedUrl(l, path);
  }
  languages["x-default"] = localizedUrl(defaultLocale, path);

  return {
    canonical: localizedUrl(locale, path),
    languages,
  };
}
