"use client";

interface ProgressItem {
  label: string;
  value: number;
  max: number;
  color?: string;
}

interface ProgressCardProps {
  title: string;
  items: ProgressItem[];
  className?: string;
}

export function ProgressCard({ title, items, className = "" }: ProgressCardProps) {
  return (
    <div className={`admin-card p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-[var(--a-text-1)]">{title}</h3>
      <div className="mt-4 space-y-4">
        {items.map((item) => {
          const pct = item.max > 0 ? Math.round((item.value / item.max) * 100) : 0;
          return (
            <div key={item.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--a-text-2)]">{item.label}</span>
                <span className="font-medium text-[var(--a-text-1)]">{pct}%</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--a-bg-elevated)]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: item.color || "var(--a-gradient)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
