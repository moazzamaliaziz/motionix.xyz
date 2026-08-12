"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface GaugeCardProps {
  title: string;
  value: number; // 0-100
  label?: string;
  color?: string;
  className?: string;
}

export function GaugeCard({ title, value, label, color = "var(--a-accent)", className = "" }: GaugeCardProps) {
  const data = [
    { v: value },
    { v: 100 - value },
  ];

  return (
    <div className={`admin-card p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-[var(--a-text-1)]">{title}</h3>
      <div className="mt-4 flex flex-col items-center">
        <div className="h-24 w-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius="65%"
                outerRadius="100%"
                dataKey="v"
                stroke="none"
                cornerRadius={8}
                isAnimationActive={false}
              >
                <Cell fill={color} />
                <Cell fill="var(--a-bg-elevated)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="-mt-8 text-center">
          <span className="text-3xl font-bold text-[var(--a-text-1)]">{value}%</span>
          {label && <p className="mt-1 text-sm text-[var(--a-text-4)]">{label}</p>}
        </div>
      </div>
    </div>
  );
}
