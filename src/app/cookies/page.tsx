export default function CookiesPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-32">
      <p className="eyebrow-mono text-primary mb-3">Cookies</p>
      <h1 className="font-display text-5xl md:text-7xl leading-[0.92] tracking-tight">
        Almost nothing.
      </h1>

      <div className="prose prose-neutral max-w-none mt-10 space-y-6 text-[15px] leading-relaxed">
        <Section title="1. What this site uses cookies for">
          <p>
            One cookie: a "seen it" flag that hides the announcement bar after the first
            dismissal. No third-party or advertising cookies. No persistent identifiers.
          </p>
        </Section>

        <Section title="2. Analytics">
          <p>
            We use privacy-respecting analytics (Plausible or Microsoft Clarity) which do not
            set cookies for cross-site tracking. Aggregated and anonymized at the server.
          </p>
        </Section>

        <Section title="3. Embedded models">
          <p>
            The AI model in the background remover is fetched from staticimg.ly and cached by
            your browser&apos;s normal HTTP cache. We don&apos;t control their caching — but they
            don&apos;t set cookies for our site.
          </p>
        </Section>

        <Section title="4. Your controls">
          <p>
            Disable cookies in your browser without losing access to any tool on the site. The
            single functional cookie (announcement-bar-dismissed) is regenerated on every visit
            when disabled.
          </p>
        </Section>

        <p className="text-xs text-foreground/40 font-mono uppercase tracking-widest mt-12">
          Last updated: 2026-07-13
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-xl md:text-2xl italic mt-8 mb-3">{title}</h2>
      <div className="space-y-3 text-foreground/70">{children}</div>
    </section>
  );
}
