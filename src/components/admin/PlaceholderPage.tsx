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
        <h1 className="text-[22px] font-semibold text-white tracking-tight">{title}</h1>
        <p className="mt-1 text-[13px] text-white/30">{description}</p>
      </div>

      <div className="admin-card p-16 text-center relative overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-5 text-2xl">
            {icon}
          </div>
          <h2 className="text-[16px] font-semibold text-white/80 mb-2">{title}</h2>
          <p className="text-[13px] text-white/30 max-w-sm mx-auto mb-6 leading-relaxed">
            This module is planned for Phase D. Data will be managed here once the backend integration is complete.
          </p>
          {features && features.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mb-8">
              {features.map((f) => (
                <span
                  key={f}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-white/[0.04] border border-white/[0.06] text-white/30"
                >
                  {f}
                </span>
              ))}
            </div>
          )}
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium rounded-lg bg-white/[0.06] text-white/60 hover:bg-white/[0.1] hover:text-white/80 border border-white/[0.06] transition-all duration-200"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
