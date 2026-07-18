import { SpotlightCard } from "@/components/motionix/visuals/SpotlightCard";
import { ContactForm } from "@/components/motionix/marketing/ContactForm";

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-32">
      <p className="eyebrow-mono text-primary mb-3">Contact</p>
      <h1 className="font-display text-5xl md:text-7xl leading-[0.92] tracking-tight">
        Say hi, ask a question, report a bug.
      </h1>
      <p className="mt-6 text-base md:text-lg text-foreground/70 max-w-2xl leading-relaxed">
        We read every message. We&apos;re a small team, so reply is usually within a couple of days.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-12">
        <SpotlightCard tone="paper">
          <p className="eyebrow-mono text-foreground/50">Email</p>
          <p className="font-display text-2xl mt-2 underline-offset-4 hover:underline">
            <a href="mailto:hello@motionix.xyz">hello@motionix.xyz</a>
          </p>
          <p className="text-sm text-foreground/60 mt-2">General questions, suggestions, hello.</p>
        </SpotlightCard>
        <SpotlightCard tone="peach">
          <p className="eyebrow-mono text-foreground/50">Bugs</p>
          <p className="font-display text-2xl mt-2 underline-offset-4 hover:underline">
            <a href="mailto:bugs@motionix.xyz">bugs@motionix.xyz</a>
          </p>
          <p className="text-sm text-foreground/60 mt-2">
            Include which tool + browser + what you expected vs what happened.
          </p>
        </SpotlightCard>
        <SpotlightCard tone="mint">
          <p className="eyebrow-mono text-foreground/50">Press</p>
          <p className="font-display text-2xl mt-2 underline-offset-4 hover:underline">
            <a href="mailto:press@motionix.xyz">press@motionix.xyz</a>
          </p>
          <p className="text-sm text-foreground/60 mt-2">Reviews, interviews, screenshots.</p>
        </SpotlightCard>
        <SpotlightCard tone="blush">
          <p className="eyebrow-mono text-foreground/50">Receipt / data</p>
          <p className="font-display text-2xl mt-2 underline-offset-4 hover:underline">
            <a href="mailto:privacy@motionix.xyz">privacy@motionix.xyz</a>
          </p>
          <p className="text-sm text-foreground/60 mt-2">
            Deletion requests, GDPR, anywhere we kept a record.
          </p>
        </SpotlightCard>
      </div>

      <div className="mt-12 prose prose-neutral text-[15px] text-foreground/70 leading-relaxed">
        <p>
          We do not own a customer support team. Replies are sent by a human. Please be patient.
          If your message is genuinely urgent (something affecting legal documents or
          livelihoods), put "urgent" in the subject.
        </p>
      </div>

      <ContactForm />
    </div>
  );
}
