import { locales, defaultLocale } from "@/i18n/config";
import { TOOLS_SITE_URL } from "@/lib/cn";
import { getPageIndexability } from "./page-indexability";

export function localizedUrl(locale: string, path: string): string {
  const clean = path === "/" ? "" : `/${path.replace(/^\/+/, "").replace(/\/+$/, "")}`;
  return `${TOOLS_SITE_URL}/${locale}${clean || "/"}`;
}

function hreflangCode(locale: string): string {
  const [lang, region] = locale.split("-");
  return region ? `${lang}-${region.toUpperCase()}` : lang;
}

export async function alternatesFor(path: string, locale: string) {
  const languages: Record<string, string> = {};

  for (const l of locales) {
    const { indexable } = await getPageIndexability(l, path);
    if (!indexable) continue;

    languages[hreflangCode(l)] = localizedUrl(l, path);
  }

  const { indexable: enIndexable } = await getPageIndexability(defaultLocale, path);
  if (enIndexable) {
    languages["x-default"] = localizedUrl(defaultLocale, path);
  }

  return {
    canonical: localizedUrl(locale, path),
    languages,
  };
}
