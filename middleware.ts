import createMiddleware from "next-intl/middleware";

const locales = ["en", "fr", "de", "hi", "ja", "zh-cn"] as const;
const defaultLocale = "en";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
});

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|og|favicon|.*\\..*).*)",
  ],
};
