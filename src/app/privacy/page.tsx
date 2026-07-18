export function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-32">
      <p className="eyebrow-mono text-primary mb-3">Privacy</p>
      <h1 className="font-display text-5xl md:text-7xl leading-[0.92] tracking-tight">
        The short version
      </h1>
      <p className="mt-6 text-base md:text-lg text-foreground/70 max-w-2xl leading-relaxed">
        We don&apos;t store photos. We don&apos;t sell data. We log a couple of tool events so we know
        which tools need work. Read the long version below — there isn&apos;t a paywall.
      </p>

      <div className="prose prose-neutral max-w-none mt-10 space-y-6 text-[15px] leading-relaxed">
        <Section title="1. What runs in your browser">
          <p>
            For our background remover, photo resize, image compressor, and similar tools, your
            file is processed locally in your browser. The byte stream of your image never leaves
            your device.
          </p>
          <p>
            The AI model (a small file, around 88 MB for the ISNet fp16 background model) is
            fetched once from our CDN at cdn.img.ly and cached by your browser. After the first
            run, the model loads almost instantly from cache.
          </p>
        </Section>

        <Section title="2. What we do log">
          <p>
            We use privacy-respecting analytics (Plausible or Microsoft Clarity, depending on
            deployment) to record:
          </p>
          <ul>
            <li>Which tool you visited (e.g. <code>/tools/background-remover</code>)</li>
            <li>Whether you completed or abandoned the task (success/fail event, no payload)</li>
            <li>Anonymous referrer and country</li>
          </ul>
          <p>
            We do <strong>not</strong> log the photos you upload. We do not have the technical
            capacity to log the photos you upload — they live in your browser tab.
          </p>
        </Section>

        <Section title="3. Cookies">
          <p>
            We don&apos;t use advertising cookies. We use a single functional cookie for "did this
            visitor already see the announcement bar?" — no third parties, no fingerprinting.
          </p>
        </Section>

        <Section title="4. Your rights">
          <p>
            EU / UK / California: this site is GDPR-aware. We do not have a record of your email
            to delete because we don&apos;t ask for one. If you want your analytics session
            anonymised or removed, contact us via the page footer and we&apos;ll do it.
          </p>
        </Section>

        <Section title="5. Children">
          <p>
            The site is general-audience. The passport tool is sometimes used for child photos.
            We adhere to COPPA: we do not knowingly collect personal information from anyone.
          </p>
        </Section>

        <Section title="6. Changes">
          <p>
            We&apos;ll keep this page current. If we add a server-side feature later (e.g. face
            landmark detection for the passport tool), we&apos;ll add a specific section here
            before it ships.
          </p>
        </Section>

        <Section title="7. Contact">
          <p>
            Questions: see the <a href="/contact" className="text-primary underline-offset-4 hover:underline">contact page</a>.
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

export default PrivacyPolicy;
