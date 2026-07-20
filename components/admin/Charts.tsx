"use client";

// Lightweight hand-rolled SVG charts (no external chart lib needed).
// Brand palette: gold on dark, accessible contrast, single visual system.

export function AreaChart({ data, height = 220 }: { data: { label: string; value: number }[]; height?: number }) {
  const W = 640, H = height, pad = 34;
  const max = Math.max(1, ...data.map((d) => d.value));
  const stepX = (W - pad * 2) / Math.max(1, data.length - 1);
  const x = (i: number) => pad + i * stepX;
  const y = (v: number) => H - pad - (v / max) * (H - pad * 2);
  const pts = data.map((d, i) => [x(i), y(d.value)] as const);
  const line = pts.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(" ");
  const area = `${line} L ${x(data.length - 1)} ${H - pad} L ${x(0)} ${H - pad} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} role="img" aria-label="Revenue chart">
      <defs>
        <linearGradient id="goldArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <line key={g} x1={pad} x2={W - pad} y1={H - pad - g * (H - pad * 2)} y2={H - pad - g * (H - pad * 2)} stroke="#ffffff" strokeOpacity="0.06" />
      ))}
      <path d={area} fill="url(#goldArea)" />
      <path d={line} fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="3.5" fill="#0B0B0B" stroke="#D4AF37" strokeWidth="2" />
          <text x={p[0]} y={H - 12} textAnchor="middle" fontSize="10" fill="#F7F1E3" fillOpacity="0.45">{data[i].label}</text>
        </g>
      ))}
    </svg>
  );
}

export function BarChart({ data, height = 220 }: { data: { label: string; value: number }[]; height?: number }) {
  const W = 640, H = height, pad = 34;
  const max = Math.max(1, ...data.map((d) => d.value));
  const bw = (W - pad * 2) / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} role="img" aria-label="Bar chart">
      <defs>
        <linearGradient id="goldBar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8C766" />
          <stop offset="100%" stopColor="#A8842A" />
        </linearGradient>
      </defs>
      {[0.5, 1].map((g) => (
        <line key={g} x1={pad} x2={W - pad} y1={H - pad - g * (H - pad * 2)} y2={H - pad - g * (H - pad * 2)} stroke="#ffffff" strokeOpacity="0.06" />
      ))}
      {data.map((d, i) => {
        const h = (d.value / max) * (H - pad * 2);
        const bx = pad + i * bw + bw * 0.2;
        return (
          <g key={i}>
            <rect x={bx} y={H - pad - h} width={bw * 0.6} height={h} rx="4" fill="url(#goldBar)" />
            <text x={bx + bw * 0.3} y={H - 12} textAnchor="middle" fontSize="10" fill="#F7F1E3" fillOpacity="0.45">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function Donut({ segments, size = 180 }: { segments: { label: string; value: number; color: string }[]; size?: number }) {
  const total = Math.max(1, segments.reduce((s, x) => s + x.value, 0));
  const r = 70, c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 180 180" width={size} height={size} className="-rotate-90">
        <circle cx="90" cy="90" r={r} fill="none" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="20" />
        {segments.map((s, i) => {
          const len = (s.value / total) * c;
          const el = (
            <circle key={i} cx="90" cy="90" r={r} fill="none" stroke={s.color} strokeWidth="20"
              strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} strokeLinecap="butt" />
          );
          offset += len;
          return el;
        })}
      </svg>
      <ul className="space-y-2 text-sm">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-cream/70">
            <span className="h-3 w-3 rounded-sm" style={{ background: s.color }} />
            {s.label} <span className="font-semibold text-cream">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
