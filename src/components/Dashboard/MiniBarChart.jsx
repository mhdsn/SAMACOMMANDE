import { useState } from "react";
import { COLORS } from "../../constants/theme";
import { formatCurrency } from "../../utils/format";
import useContainerSize from "../../hooks/useContainerSize";

const BAR_RADIUS = 5;
const GRID_LINES = 4;

export default function MiniBarChart({ data, isMobile }) {
  const [hovered, setHovered] = useState(null);
  const { ref, width: containerW } = useContainerSize();

  const max = Math.max(...data.map((d) => d.value), 1);
  const h = isMobile ? 200 : 280;
  const sidePad = isMobile ? 8 : 20;
  const topPad = 32;
  const bottomPad = 32;
  const drawH = h - topPad - bottomPad;
  const svgW = containerW || 600;
  const usableW = svgW - sidePad * 2;

  // Adaptive gap: shrink when many bars
  const baseGap = isMobile ? 4 : 10;
  const barGap = data.length > 20 ? Math.max(1, baseGap - Math.floor(data.length / 10)) : baseGap;
  const barW = Math.max(2, (usableW - barGap * (data.length - 1)) / data.length);

  // Only show every Nth label to avoid overlap
  const maxLabels = isMobile ? 7 : 14;
  const labelStep = data.length > maxLabels ? Math.ceil(data.length / maxLabels) : 1;

  if (!containerW) {
    return <div ref={ref} style={{ width: "100%", height: h }} />;
  }

  return (
    <div ref={ref} style={{ width: "100%" }}>
      <svg
        width={svgW}
        height={h}
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.accent} />
            <stop offset="100%" stopColor={COLORS.accentDark} />
          </linearGradient>
          <linearGradient id="barGradHover" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8763A" />
            <stop offset="100%" stopColor={COLORS.accent} />
          </linearGradient>
          <linearGradient id="barGradEmpty" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.border} />
            <stop offset="100%" stopColor={COLORS.surfaceAlt} />
          </linearGradient>
          <filter id="barShadow">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor={COLORS.accent} floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Grid lines + scale labels */}
        {Array.from({ length: GRID_LINES + 1 }).map((_, i) => {
          const y = topPad + (drawH / GRID_LINES) * i;
          const val = max - (max / GRID_LINES) * i;
          return (
            <g key={`grid-${i}`}>
              <line
                x1={sidePad}
                y1={y}
                x2={svgW - sidePad}
                y2={y}
                stroke={COLORS.border}
                strokeWidth={1}
                strokeDasharray={i === GRID_LINES ? "0" : "4,4"}
                opacity={0.5}
              />
              {val > 0 && (
                <text
                  x={sidePad + 2}
                  y={y - 6}
                  fontSize={10}
                  fill={COLORS.textMuted}
                  textAnchor="start"
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

        {/* Bars */}
        {data.map((d, i) => {
          const x = sidePad + i * (barW + barGap);
          const barH = d.value > 0 ? Math.max((d.value / max) * drawH, 4) : 4;
          const y = topPad + drawH - barH;
          const isHovered = hovered === i;
          const showLabel = i % labelStep === 0 || i === data.length - 1;

          return (
            <g
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: d.value > 0 ? "pointer" : "default" }}
            >
              {/* Hover background zone */}
              <rect
                x={x - 3}
                y={topPad}
                width={barW + 6}
                height={drawH + bottomPad}
                fill={isHovered ? COLORS.surfaceAlt : "transparent"}
                rx={6}
                opacity={0.5}
              />

              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx={Math.min(BAR_RADIUS, barW / 2)}
                fill={d.value > 0 ? (isHovered ? "url(#barGradHover)" : "url(#barGrad)") : "url(#barGradEmpty)"}
                filter={isHovered && d.value > 0 ? "url(#barShadow)" : "none"}
                style={{
                  transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              />

              {/* Month label */}
              {showLabel && (
                <text
                  x={x + barW / 2}
                  y={h - 8}
                  fontSize={isMobile ? 9 : data.length > 20 ? 10 : 12}
                  fill={isHovered ? COLORS.text : COLORS.textMuted}
                  textAnchor="middle"
                  fontFamily="DM Sans, sans-serif"
                  fontWeight={isHovered ? 600 : 500}
                >
                  {d.label}
                </text>
              )}

              {/* Tooltip on hover */}
              {isHovered && (
                <g>
                  <rect
                    x={Math.max(4, Math.min(x + barW / 2 - 52, svgW - 108))}
                    y={y - 34}
                    width={104}
                    height={26}
                    rx={8}
                    fill={COLORS.text}
                    opacity={0.95}
                  />
                  <text
                    x={Math.max(56, Math.min(x + barW / 2, svgW - 56))}
                    y={y - 17}
                    fontSize={12}
                    fill="#fff"
                    textAnchor="middle"
                    fontFamily="DM Sans, sans-serif"
                    fontWeight={600}
                  >
                    {d.label}: {formatCurrency(d.value)}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
