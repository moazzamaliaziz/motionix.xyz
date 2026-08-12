import type { SVGProps } from "react";

export function PassportIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 320 280" fill="none" aria-hidden="true" {...props}>
      {/* Passport booklet */}
      <rect x="70" y="24" width="140" height="192" rx="8" fill="#d4a574" opacity="0.25" />
      <rect x="78" y="32" width="124" height="176" rx="5" fill="#d4a574" opacity="0.18" />
      {/* Gold emblem circle */}
      <circle cx="140" cy="84" r="28" stroke="#c8956e" strokeWidth="1.5" fill="none" opacity="0.4" />
      <circle cx="140" cy="84" r="18" stroke="#c8956e" strokeWidth="1" fill="none" opacity="0.3" />
      {/* Gold lines below emblem */}
      <line x1="108" y1="124" x2="172" y2="124" stroke="#c8956e" strokeWidth="1" opacity="0.35" />
      <line x1="116" y1="134" x2="164" y2="134" stroke="#c8956e" strokeWidth="0.75" opacity="0.25" />
      {/* Photo frame overlay */}
      <rect x="182" y="96" width="108" height="140" rx="6" fill="white" opacity="0.85" />
      <rect x="182" y="96" width="108" height="140" rx="6" stroke="#c8956e" strokeWidth="1.5" opacity="0.3" />
      {/* Photo silhouette */}
      <ellipse cx="236" cy="144" rx="24" ry="28" fill="#c8956e" opacity="0.15" />
      <ellipse cx="236" cy="136" rx="16" ry="18" fill="#c8956e" opacity="0.2" />
      {/* Photo guidelines */}
      <line x1="194" y1="120" x2="278" y2="120" stroke="#c8956e" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.25" />
      <line x1="194" y1="200" x2="278" y2="200" stroke="#c8956e" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.25" />
      {/* Small stamp */}
      <rect x="86" y="152" width="36" height="24" rx="2" stroke="#c8956e" strokeWidth="0.75" fill="none" opacity="0.2" />
    </svg>
  );
}

export function ResumeIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 320 280" fill="none" aria-hidden="true" {...props}>
      {/* Resume document */}
      <rect x="52" y="20" width="180" height="232" rx="6" fill="white" opacity="0.8" />
      <rect x="52" y="20" width="180" height="232" rx="6" stroke="#6b9e8a" strokeWidth="1.5" opacity="0.2" />
      {/* Header area */}
      <rect x="72" y="40" width="80" height="8" rx="4" fill="#6b9e8a" opacity="0.3" />
      <rect x="72" y="56" width="56" height="5" rx="2.5" fill="#6b9e8a" opacity="0.15" />
      {/* Divider */}
      <line x1="72" y1="72" x2="212" y2="72" stroke="#6b9e8a" strokeWidth="0.75" opacity="0.2" />
      {/* Text lines */}
      <rect x="72" y="84" width="140" height="4" rx="2" fill="#6b9e8a" opacity="0.12" />
      <rect x="72" y="96" width="120" height="4" rx="2" fill="#6b9e8a" opacity="0.1" />
      <rect x="72" y="108" width="136" height="4" rx="2" fill="#6b9e8a" opacity="0.12" />
      <rect x="72" y="120" width="100" height="4" rx="2" fill="#6b9e8a" opacity="0.1" />
      {/* Section heading */}
      <rect x="72" y="140" width="60" height="6" rx="3" fill="#6b9e8a" opacity="0.25" />
      <rect x="72" y="156" width="140" height="4" rx="2" fill="#6b9e8a" opacity="0.1" />
      <rect x="72" y="168" width="124" height="4" rx="2" fill="#6b9e8a" opacity="0.12" />
      <rect x="72" y="180" width="132" height="4" rx="2" fill="#6b9e8a" opacity="0.1" />
      {/* Portrait photo in top-right */}
      <rect x="196" y="36" width="48" height="58" rx="4" fill="#6b9e8a" opacity="0.12" />
      <ellipse cx="220" cy="54" rx="12" ry="14" fill="#6b9e8a" opacity="0.18" />
      <ellipse cx="220" cy="50" rx="8" ry="9" fill="#6b9e8a" opacity="0.22" />
    </svg>
  );
}

export function CompressIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 320 280" fill="none" aria-hidden="true" {...props}>
      {/* Large original image */}
      <rect x="32" y="32" width="148" height="180" rx="8" fill="white" opacity="0.7" />
      <rect x="32" y="32" width="148" height="180" rx="8" stroke="#d4827a" strokeWidth="1.5" opacity="0.2" />
      {/* Landscape scene in original */}
      <rect x="44" y="168" width="124" height="32" rx="4" fill="#d4827a" opacity="0.1" />
      <circle cx="80" cy="92" r="20" fill="#d4827a" opacity="0.12" />
      <path d="M44 168 L84 120 L120 152 L156 128 L168 168 Z" fill="#d4827a" opacity="0.08" />
      {/* Arrow */}
      <path d="M192 120 L212 120" stroke="#d4827a" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
      <path d="M207 114 L214 120 L207 126" stroke="#d4827a" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" strokeLinejoin="round" />
      {/* Compressed image (smaller) */}
      <rect x="216" y="56" width="84" height="120" rx="6" fill="white" opacity="0.7" />
      <rect x="216" y="56" width="84" height="120" rx="6" stroke="#d4827a" strokeWidth="1.5" opacity="0.2" />
      {/* Same scene scaled down */}
      <rect x="224" y="140" width="68" height="28" rx="3" fill="#d4827a" opacity="0.1" />
      <circle cx="252" cy="96" r="12" fill="#d4827a" opacity="0.12" />
      <path d="M224 140 L244 108 L264 132 L280 116 L292 140 Z" fill="#d4827a" opacity="0.08" />
      {/* Size labels */}
      <rect x="68" y="224" width="64" height="18" rx="9" fill="#d4827a" opacity="0.12" />
      <rect x="236" y="192" width="48" height="18" rx="9" fill="#d4827a" opacity="0.12" />
    </svg>
  );
}

export function ResizeIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 320 280" fill="none" aria-hidden="true" {...props}>
      {/* Original image frame */}
      <rect x="28" y="40" width="180" height="160" rx="6" fill="white" opacity="0.7" />
      <rect x="28" y="40" width="180" height="160" rx="6" stroke="#6b8ea8" strokeWidth="1.5" opacity="0.2" />
      {/* Image content */}
      <circle cx="80" cy="92" r="24" fill="#6b8ea8" opacity="0.12" />
      <path d="M40 168 L80 112 L120 148 L160 120 L200 168 Z" fill="#6b8ea8" opacity="0.08" />
      {/* Resize handles on corners */}
      <rect x="24" y="36" width="10" height="10" rx="2" fill="#6b8ea8" opacity="0.35" />
      <rect x="198" y="36" width="10" height="10" rx="2" fill="#6b8ea8" opacity="0.35" />
      <rect x="24" y="194" width="10" height="10" rx="2" fill="#6b8ea8" opacity="0.35" />
      <rect x="198" y="194" width="10" height="10" rx="2" fill="#6b8ea8" opacity="0.35" />
      {/* Dimension arrows */}
      <line x1="28" y1="216" x2="208" y2="216" stroke="#6b8ea8" strokeWidth="1" opacity="0.3" />
      <line x1="28" y1="212" x2="28" y2="220" stroke="#6b8ea8" strokeWidth="1" opacity="0.3" />
      <line x1="208" y1="212" x2="208" y2="220" stroke="#6b8ea8" strokeWidth="1" opacity="0.3" />
      <line x1="220" y1="40" x2="220" y2="200" stroke="#6b8ea8" strokeWidth="1" opacity="0.3" />
      <line x1="216" y1="40" x2="224" y2="40" stroke="#6b8ea8" strokeWidth="1" opacity="0.3" />
      <line x1="216" y1="200" x2="224" y2="200" stroke="#6b8ea8" strokeWidth="1" opacity="0.3" />
      {/* Target size indicator */}
      <rect x="232" y="72" width="60" height="60" rx="4" fill="#6b8ea8" opacity="0.1" stroke="#6b8ea8" strokeWidth="1" strokeDasharray="4 3" />
      {/* Resize arrow */}
      <path d="M208 140 C216 140, 224 112, 232 102" stroke="#6b8ea8" strokeWidth="1.5" opacity="0.35" strokeLinecap="round" fill="none" />
      <path d="M228 96 L234 102 L228 108" stroke="#6b8ea8" strokeWidth="1.5" opacity="0.35" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Grid lines in target */}
      <line x1="252" y1="72" x2="252" y2="132" stroke="#6b8ea8" strokeWidth="0.5" opacity="0.12" />
      <line x1="232" y1="102" x2="292" y2="102" stroke="#6b8ea8" strokeWidth="0.5" opacity="0.12" />
    </svg>
  );
}
