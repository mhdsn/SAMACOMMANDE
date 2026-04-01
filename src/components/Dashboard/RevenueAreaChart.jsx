import { useState } from "react";
import { COLORS } from "../../constants/theme";
import { formatCurrency } from "../../utils/format";
import useContainerSize from "../../hooks/useContainerSize";

export default function RevenueAreaChart({ data, isMobile }) {
  const [hovered, setHovered] = useState(null);
  const { ref, width: containerW } = useContainerSize();

  const h = isMobile ? 200 : 280;
  const PAD = { top: 32, right: 20, bottom: 36, left: 20 };
  const svgW = containerW || 600;
  const drawW = svgW - PAD.left - PAD.right;
  const drawH = h - PAD.top - PAD.bottom;

  const values = data.map((d) => d.value);
  const max = Math.max(...values, 1) * 1.15;

  const points = data.map((d, i) => ({
    x: PAD.left + (data.length > 1 ? (i / (data.length - 1)) * drawW : drawW / 2),
    y: PAD.top + drawH - (d.value / max) * drawH,
    value: d.value,
    label: d.label,
  }));

  // Only show every Nth label to avoid overlap
  const maxLabels = isMobile ? 7 : 14;
  const labelStep = data.length > maxLabels ? Math.ceil(data.length / maxLabels) : 1;

  // Smooth Bézier curve
  const linePath = points
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const cpx1 = prev.x + (p.x - prev.x) * 0.4;
      const cpx2 = p.x - (p.x - prev.x) * 0.4;
      return `C ${cpx1} ${prev.y}, ${cpx2} ${p.y}, ${p.x} ${p.y}`;
    })
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x} ${PAD.top + drawH} L ${points[0].x} ${PAD.top + drawH} Z`;

  if (!containerW) {
    return <div ref={ref} style={{ width: "100%", height: h }} />;
  }

  return (
    <div ref={ref} style={{ width: "100%" }}>
      <svg
        width={svgW}
        height={h}
        style={{ display: "block" }}
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.accent} stopOpacity="0.25" />
            <stop offset="60%" stopColor={COLORS.accent} stopOpacity="0.08" />
            <stop offset="100%" stopColor={COLORS.accent} stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={COLORS.accentDark} />
            <stop offset="50%" stopColor={COLORS.accent} />
            <stop offset="100%" stopColor="#E8763A" />
          </linearGradient>
          <filter id="dotGlow">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={COLORS.accent} floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Horizontal grid + scale */}
        {Array.from({ length: 5 }).map((_, i) => {
          const y = PAD.top + (drawH / 4) * i;
          const val = max - (max / 4) * i;
          return (
            <g key={`hgrid-${i}`}>
              <line
                x1={PAD.left}
                y1={y}
                x2={svgW - PAD.right}
                y2={y}
                stroke={COLORS.border}
                strokeWidth={0.8}
                strokeDasharray="4,4"
                opacity={0.4}
              />
              {val > 0 && i < 4 && (
                <text
                  x={PAD.left + 2}
                  y={y - 6}
                  fontSize={10}
                  fill={COLORS.textMuted}
                  fontFamily="DM Sans, sans-serif"
                  opacity={0.6}
                >
                  {val >= 1000000
                    ? `${(val / 1000000).toFixed(1)}M`
                    : val >= 1000
                    ? `${Math.round(val / 1000)}k`
                    : Math.round(val)}
                </text>
              )}
            </g>
          );
        })}
        {/* Baseline */}
        <line
          x1={PAD.left}
          y1={PAD.top + drawH}
          x2={svgW - PAD.right}
          y2={PAD.top + drawH}
          stroke={COLORS.border}
          strokeWidth={1}
        />

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGrad)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="url(#lineGrad)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points + hover zones */}
        {points.map((p, i) => {
          const colW = drawW / data.length;
          const isHovered = hovered === i;
          const showLabel = i % labelStep === 0 || i === data.length - 1;

          return (
            <g
              key={i}
              onMouseEnter={() => setHovered(i)}
              style={{ cursor: "pointer" }}
            >
              {/* Hit area */}
              <rect
                x={p.x - colW / 2}
                y={PAD.top}
                width={colW}
                height={drawH + PAD.bottom}
                fill="transparent"
              />

              {/* Vertical guide */}
              {isHovered && (
                <line
                  x1={p.x}
                  y1={PAD.top}
                  x2={p.x}
                  y2={PAD.top + drawH}
                  stroke={COLORS.accent}
                  strokeWidth={1}
                  strokeDasharray="3,3"
                  opacity={0.4}
                />
              )}

              {/* Glow behind dot */}
              {isHovered && p.value > 0 && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={14}
                  fill={COLORS.accent}
                  opacity={0.1}
                />
              )}

              {/* Dot */}
              <circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 7 : p.value > 0 ? (data.length > 20 ? 2.5 : 4) : 0}
                fill={isHovered ? COLORS.accent : COLORS.surface}
                stroke={isHovered ? COLORS.surface : COLORS.accent}
                strokeWidth={isHovered ? 3 : 2}
                filter={isHovered ? "url(#dotGlow)" : "none"}
                style={{ transition: "r 0.2s ease, stroke-width 0.2s ease" }}
              />

              {/* Tooltip */}
              {isHovered && (
                <g>
                  <rect
                    x={Math.max(4, Math.min(p.x - 56, svgW - 116))}
                    y={p.y - 44}
                    width={112}
                    height={30}
                    rx={10}
                    fill={COLORS.text}
                    opacity={0.95}
                  />
                  <text
                    x={Math.max(60, Math.min(p.x, svgW - 60))}
                    y={p.y - 25}
                    fontSize={12}
                    fill="#fff"
                    textAnchor="middle"
                    fontFamily="DM Sans, sans-serif"
                    fontWeight={600}
                  >
                    {p.label}: {formatCurrency(p.value)}
                  </text>
                </g>
              )}

              {/* Label */}
              {showLabel && (
                <text
                  x={p.x}
                  y={h - 8}
                  fontSize={isMobile ? 9 : data.length > 20 ? 10 : 12}
                  fill={isHovered ? COLORS.text : COLORS.textMuted}
                  textAnchor="middle"
                  fontFamily="DM Sans, sans-serif"
                  fontWeight={isHovered ? 600 : 400}
                >
                  {p.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
