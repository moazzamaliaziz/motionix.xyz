import Link from "next/link";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: string;
  features?: string[];
}

export function PlaceholderPage({ title, description, icon, features }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold tracking-tight text-[var(--a-text-1)]">{title}</h1>
        <p className="mt-1 text-[13px] text-[var(--a-text-3)]">{description}</p>
      </div>

      <div className="admin-card p-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[var(--a-bg-elevated)] to-transparent" />
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl border border-[var(--a-border)] bg-[var(--a-bg-elevated)]">
            {icon}
          </div>
          <h2 className="text-[16px] font-semibold mb-2 text-[var(--a-text-1)]">{title}</h2>
          <p className="text-[13px] max-w-sm mx-auto mb-6 leading-relaxed text-[var(--a-text-3)]">
            This module is planned for Phase D. Data will be managed here once the backend integration is complete.
          </p>
          {features && features.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mb-8">
              {features.map((f) => (
                <span key={f} className="rounded-full border border-[var(--a-border)] bg-[var(--a-bg-elevated)] px-2.5 py-1 text-[11px] font-medium text-[var(--a-text-3)]">
                  {f}
                </span>
              ))}
            </div>
          )}
          <Link
            href="/admin"
            className="admin-btn admin-focus inline-flex items-center gap-2 rounded-lg border border-[var(--a-border)] bg-[var(--a-bg-elevated)] px-5 py-2.5 text-[13px] font-medium text-[var(--a-text-2)] transition-colors hover:opacity-80"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
