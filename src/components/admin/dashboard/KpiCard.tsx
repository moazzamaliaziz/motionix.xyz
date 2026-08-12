"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Area, AreaChart } from "recharts";

interface KpiCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  href?: string;
  color?: string;
  sparkValues?: number[];
  barValues?: number[];
}

export function KpiCard({ label, value, change, changeLabel, color = "var(--a-accent)", sparkValues, barValues }: KpiCardProps) {
  const isPositive = (change ?? 0) >= 0;

  return (
    <div className="admin-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-base font-semibold text-[var(--a-text-2)]">{label}</p>
          <div className="mt-4 flex items-end gap-3">
            <span className="text-4xl font-bold text-[var(--a-text-1)]">{value}</span>
            {change !== undefined && (
              <span className={`mb-1 inline-flex items-center gap-1 text-sm font-medium ${isPositive ? "text-[var(--a-success)]" : "text-[var(--a-error)]"}`}>
                {isPositive ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                {isPositive ? "+" : ""}{change}%
              </span>
            )}
          </div>
          {changeLabel && (
            <p className="mt-1 text-sm text-[var(--a-text-4)]">{changeLabel}</p>
          )}
        </div>

        {/* Micro-visual */}
        {barValues && barValues.length > 0 && (
          <div className="h-16 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barValues.map((v) => ({ v }))} barCategoryGap={4}>
                <Bar dataKey="v" fill={color} radius={2} background={{ fill: "var(--a-bg-elevated)" }} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {sparkValues && sparkValues.length > 0 && (
          <div className="h-14 w-28">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkValues.map((v) => ({ v }))} margin={{ top: 4, bottom: 4, left: 0, right: 0 }}>
                <defs>
                  <linearGradient id={`spark-${label.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={color}
                  strokeWidth={2.5}
                  fill={`url(#spark-${label.replace(/\s/g, "")})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
