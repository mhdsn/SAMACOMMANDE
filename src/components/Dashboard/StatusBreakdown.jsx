import { useState } from "react";
import { COLORS, SHADOWS } from "../../constants/theme";
import { ORDER_STATUS } from "../../constants/status";
import { PieChart } from "lucide-react";

const DONUT_SIZE = 160;
const DONUT_STROKE = 26;
const DONUT_RADIUS = (DONUT_SIZE - DONUT_STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

function DonutChart({ orders }) {
  const [hovered, setHovered] = useState(null);
  const total = orders.length;
  const entries = Object.entries(ORDER_STATUS);

  const segments = entries.map(([key, config]) => {
    const count = orders.filter((o) => o.status === key).length;
    const pct = total > 0 ? count / total : 0;
    return { key, config, count, pct };
  });

  let offset = 0;

  return (
    <div
      style={{
        position: "relative",
        width: DONUT_SIZE,
        height: DONUT_SIZE,
        flexShrink: 0,
      }}
    >
      <svg width={DONUT_SIZE} height={DONUT_SIZE}>
        <circle
          cx={DONUT_SIZE / 2}
          cy={DONUT_SIZE / 2}
          r={DONUT_RADIUS}
          fill="none"
          stroke={COLORS.surfaceAlt}
          strokeWidth={DONUT_STROKE}
        />
        {segments.map((seg) => {
          const dashLen = seg.pct * CIRCUMFERENCE;
          const gapLen = CIRCUMFERENCE - dashLen;
          const currentOffset = offset;
          offset += seg.pct;
          const isActive = hovered === seg.key;

          return (
            <circle
              key={seg.key}
              cx={DONUT_SIZE / 2}
              cy={DONUT_SIZE / 2}
              r={DONUT_RADIUS}
              fill="none"
              stroke={seg.config.color}
              strokeWidth={isActive ? DONUT_STROKE + 6 : DONUT_STROKE}
              strokeDasharray={`${dashLen} ${gapLen}`}
              strokeDashoffset={-currentOffset * CIRCUMFERENCE}
              strokeLinecap="round"
              transform={`rotate(-90 ${DONUT_SIZE / 2} ${DONUT_SIZE / 2})`}
              style={{
                transition: "stroke-width 0.2s ease, opacity 0.2s ease",
                cursor: "pointer",
                opacity: hovered !== null && !isActive ? 0.3 : 1,
                filter: isActive ? `drop-shadow(0 2px 6px ${seg.config.color}40)` : "none",
              }}
              onMouseEnter={() => setHovered(seg.key)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
        }}
      >
        {hovered ? (
          <>
            <div style={{ fontSize: 28, fontWeight: 800, color: ORDER_STATUS[hovered].color, lineHeight: 1, letterSpacing: -1 }}>
              {segments.find((s) => s.key === hovered)?.count}
            </div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4, fontWeight: 600 }}>
              {ORDER_STATUS[hovered].label}
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 30, fontWeight: 800, color: COLORS.text, lineHeight: 1, letterSpacing: -1 }}>
              {total}
            </div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4, fontWeight: 500 }}>
              total
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Legend({ orders }) {
  const total = orders.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1, minWidth: 0 }}>
      {Object.entries(ORDER_STATUS).map(([key, config]) => {
        const count = orders.filter((o) => o.status === key).length;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;

        return (
          <div key={key}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 4,
                    background: config.color,
                    flexShrink: 0,
                    boxShadow: `0 1px 4px ${config.color}30`,
                  }}
                />
                <span style={{ fontSize: 13, fontWeight: 500, color: COLORS.textSecondary }}>
                  {config.label}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, letterSpacing: -0.5 }}>
                  {count}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: config.color,
                    fontWeight: 600,
                    background: `${config.color}12`,
                    padding: "2px 8px",
                    borderRadius: 6,
                  }}
                >
                  {pct}%
                </span>
              </div>
            </div>
            <div
              style={{
                height: 6,
                borderRadius: 6,
                background: COLORS.surfaceAlt,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  borderRadius: 6,
                  background: `linear-gradient(90deg, ${config.color}, ${config.color}cc)`,
                  transition: "width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function StatusBreakdown({ orders, isMobile }) {
  return (
    <div
      style={{
        background: COLORS.surface,
        borderRadius: 18,
        border: `1px solid ${COLORS.borderLight}`,
        boxShadow: SHADOWS.xs,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: isMobile ? "16px 18px" : "20px 24px",
          borderBottom: `1px solid ${COLORS.borderLight}`,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: COLORS.blueLight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: COLORS.blue,
          }}
        >
          <PieChart size={15} strokeWidth={2.2} />
        </div>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.2 }}>
            Répartition des statuts
          </h3>
          <span style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 500 }}>
            Vue d'ensemble de vos commandes
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          padding: isMobile ? 18 : 28,
          display: "flex",
          gap: isMobile ? 28 : 44,
          alignItems: "center",
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        <DonutChart orders={orders} />
        <Legend orders={orders} />
      </div>
    </div>
  );
}
