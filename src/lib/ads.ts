/**
 * Google AdSense helpers — env-gated, no-op until configured.
 *
 * Monetization runs ONLY on content/marketing surfaces (blog posts, blog
 * index, marketing sections). Tool workspaces stay ad-free: the public
 * privacy promise (see the home FAQ, "we don't show ads in tools") scopes
 * where ads may appear. Do not place AdSlot on any /tools route.
 *
 * Enable by setting NEXT_PUBLIC_ADSENSE_CLIENT (e.g. "ca-pub-XXXXXXXXXXXXXXXX").
 * Individual slots take a numeric slot id from the AdSense dashboard.
 */

export function adsenseClient(): string {
  return process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";
}

export function adsEnabled(): boolean {
  return Boolean(adsenseClient());
}
