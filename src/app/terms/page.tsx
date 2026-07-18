export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-32">
      <p className="eyebrow-mono text-primary mb-3">Terms</p>
      <h1 className="font-display text-5xl md:text-7xl leading-[0.92] tracking-tight">
        Be kind, be useful.
      </h1>

      <div className="prose prose-neutral max-w-none mt-10 space-y-6 text-[15px] leading-relaxed">
        <Section title="1. The deal">
          <p>
            Motionix (motionix.xyz) provides free tools that run in your browser where possible.
            By using the site, you agree to use the tools within the law and to use them for what
            they&apos;re built for.
          </p>
        </Section>

        <Section title="2. Don&apos;t use the background remover for deception">
          <p>
            The background remover is great for product shots, profile photos, and creative work.
            It is not a tool for dodging platform rules, faking photographs, or misleading
            employers. We&apos;re not in the position to police this — we ask that you don&apos;t.
          </p>
        </Section>

        <Section title="3. The passport tool">
          <p>
            You confirm that the photo you upload is of you, or of someone whose consent you
            have. We don&apos;t store it, but embassy rules apply. If you get a rejection, that&apos;s
            not on us — we&apos;ll tell you which rule to check before you take a second trip.
          </p>
        </Section>

        <Section title="4. Availability">
          <p>
            We&apos;re a small team. Tools may be down. Code may have bugs. We fix them as quickly as
            we can and document known issues on the changelog (coming soon).
          </p>
        </Section>

        <Section title="5. Liability">
          <p>
            The site is provided "as is". For the official documents and passport photos, follow
            the actual consular authority. For any sensitive visual content, keep originals.
          </p>
        </Section>

        <Section title="6. Changes to these terms">
          <p>
            We&apos;ll keep this page reasonable. Major changes get an entry here.
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
