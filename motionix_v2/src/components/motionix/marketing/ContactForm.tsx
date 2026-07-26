"use client";

import { useState } from "react";
import { LuCheck, LuLoader } from "react-icons/lu";
import { cn } from "@/lib/cn";

/**
 * Tiny self-contained contact form. POSTs to /api/contact, which forwards
 * via Resend (when configured) or no-ops (so dev doesn't crash). Honeypot
 * spam protection: a hidden "leave blank" field that bots love filling.
 */
export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    body: "",
    honeypot: "",
    tool: "",
  });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state !== "idle") return;
    if (form.honeypot) return; // bot
    if (!form.email.includes("@")) {
      setError("We need your email to reply.");
      return;
    }
    if (form.body.length < 8) {
      setError("That looks a bit short. Add a few more details?");
      return;
    }
    setError(null);
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: form.subject,
          body: form.body,
          tool: form.tool || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "unknown" }));
        setError(data.hint ?? "We couldn't send that. Try emailing us directly?");
        setState("error");
        return;
      }
      setState("sent");
    } catch {
      setError("Network blip. Try again in a moment?");
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 mt-12">
        <p className="font-medium flex items-center gap-2">
          <LuCheck className="size-5 text-primary" />
          Thanks — message sent.
        </p>
        <p className="text-sm text-foreground/60 mt-2">
          We'll reply to <span className="font-mono">{form.email}</span> within a couple of days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4 mt-12 p-6 rounded-2xl border border-foreground/10 bg-paper">
      <p className="font-medium text-lg">Or write to us here</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Name"
          type="text"
          value={form.name}
          onChange={update("name")}
          placeholder="Your name"
        />
        <Field
          label="Email"
          type="email"
          value={form.email}
          onChange={update("email")}
          required
          placeholder="you@example.com"
        />
      </div>
      <label className="block">
        <span className="text-xs eyebrow-mono text-foreground/50">Subject</span>
        <input
          type="text"
          value={form.subject}
          onChange={update("subject")}
          placeholder="Short summary"
          className="mt-1 w-full rounded-xl border border-foreground/15 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none transition"
        />
      </label>
      <label className="block">
        <span className="text-xs eyebrow-mono text-foreground/50">Tool (optional)</span>
        <select
          value={form.tool}
          onChange={update("tool")}
          className="mt-1 w-full rounded-xl border border-foreground/15 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none transition"
        >
          <option value="">Not tool-related</option>
          <option value="background-remover">Background Remover</option>
          <option value="passport-photo-maker">Passport Photo Maker</option>
          <option value="photo-resizer">Photo Resizer</option>
          <option value="image-compressor">Image Compressor</option>
          <option value="student-id-photo-maker">Student ID Photo Maker</option>
          <option value="resume-photo-maker">Resume Photo Maker</option>
          <option value="signature-maker">Signature Maker</option>
          <option value="video-compressor">Video Compressor</option>
        </select>
      </label>
      <label className="block">
        <span className="text-xs eyebrow-mono text-foreground/50">Message</span>
        <textarea
          value={form.body}
          onChange={update("body")}
          rows={5}
          required
          placeholder="What did you try, what happened, what did you expect?"
          className="mt-1 w-full rounded-xl border border-foreground/15 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none transition resize-y"
        />
      </label>

      {/* Honeypot: real users don't see this; bots fill it. */}
      <input
        type="text"
        tabIndex={-1}
        value={form.honeypot}
        onChange={update("honeypot")}
        autoComplete="off"
        aria-hidden="true"
        className="absolute opacity-0 pointer-events-none -left-[9999px]"
        name="website"
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <button
        type="submit"
        disabled={state === "sending"}
        className={cn(
          "inline-flex items-center gap-2 self-start rounded-full px-6 py-3 text-sm font-medium transition",
          "bg-foreground text-background hover:bg-primary disabled:opacity-50",
        )}
      >
        {state === "sending" ? (
          <>
            <LuLoader className="size-4 animate-spin" /> Sending…
          </>
        ) : (
          <>Send message</>
        )}
      </button>
    </form>
  );
}

function Field(props: {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
}): React.ReactElement {
  return (
    <label className="block">
      <span className="text-xs eyebrow-mono text-foreground/50">{props.label}</span>
      <input
        type={props.type}
        value={props.value}
        onChange={props.onChange}
        required={props.required}
        placeholder={props.placeholder}
        className="mt-1 w-full rounded-xl border border-foreground/15 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none transition"
      />
    </label>
  );
}
