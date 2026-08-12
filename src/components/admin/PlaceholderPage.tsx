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
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        <p className="mt-1 text-sm text-[#888]">{description}</p>
      </div>

      <div className="border border-[#222] rounded-lg bg-[#0a0a0a] p-12 text-center">
        <div className="text-4xl mb-4">{icon}</div>
        <h2 className="text-lg font-medium text-white mb-2">{title}</h2>
        <p className="text-sm text-[#666] max-w-md mx-auto mb-6">
          This module is planned for Phase D of the admin panel. Data will be managed here once the backend integration is complete.
        </p>
        {features && features.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {features.map((f) => (
              <span
                key={f}
                className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-[#111] border border-[#222] text-[#888]"
              >
                {f}
              </span>
            ))}
          </div>
        )}
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium rounded-md bg-white text-black hover:bg-[#e0e0e0] transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
