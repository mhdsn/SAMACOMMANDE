import { COLORS, SHADOWS } from "../../constants/theme";

export default function StatCard({
  icon,
  label,
  value,
  sub,
  color,
  accentColor,
  isMobile,
  highlight,
}) {
  return (
    <div
      style={{
        background: highlight
          ? `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`
          : COLORS.surface,
        borderRadius: 18,
        padding: isMobile ? "18px 16px" : highlight ? "26px 28px" : "22px 24px",
        border: highlight ? "none" : `1px solid ${COLORS.borderLight}`,
        boxShadow: highlight
          ? `0 8px 24px ${accentColor}30, 0 2px 6px ${accentColor}18`
          : SHADOWS.xs,
        transition: "all 0.2s ease",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: isMobile ? "auto" : highlight ? 150 : 130,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = highlight
          ? `0 12px 32px ${accentColor}40, 0 4px 8px ${accentColor}20`
          : SHADOWS.md;
        e.currentTarget.style.transform = "translateY(-2px)";
        if (!highlight) e.currentTarget.style.borderColor = COLORS.border;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = highlight
          ? `0 8px 24px ${accentColor}30, 0 2px 6px ${accentColor}18`
          : SHADOWS.xs;
        e.currentTarget.style.transform = "translateY(0)";
        if (!highlight) e.currentTarget.style.borderColor = COLORS.borderLight;
      }}
    >
      {/* Decorative background circle */}
      <div
        style={{
          position: "absolute",
          right: -20,
          top: -20,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: highlight
            ? "rgba(255,255,255,0.1)"
            : `${accentColor}08`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 10,
          bottom: -30,
          width: 70,
          height: 70,
          borderRadius: "50%",
          background: highlight
            ? "rgba(255,255,255,0.06)"
            : `${accentColor}05`,
          pointerEvents: "none",
        }}
      />

      {/* Header: icon + label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: isMobile ? 14 : 16,
        }}
      >
        <div
          style={{
            width: isMobile ? 34 : 38,
            height: isMobile ? 34 : 38,
            borderRadius: 11,
            background: highlight
              ? "rgba(255,255,255,0.2)"
              : color || `${accentColor}12`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: highlight ? "#fff" : accentColor,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <span
          style={{
            fontSize: isMobile ? 12 : 13,
            color: highlight ? "rgba(255,255,255,0.85)" : COLORS.textMuted,
            fontWeight: 600,
            letterSpacing: -0.1,
            lineHeight: 1.2,
          }}
        >
          {label}
        </span>
      </div>

      {/* Value */}
      <div>
        <div
          style={{
            fontSize: isMobile ? 22 : highlight ? 30 : 26,
            fontWeight: 800,
            color: highlight ? "#fff" : COLORS.text,
            letterSpacing: -0.8,
            lineHeight: 1.1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value}
        </div>
        {sub && (
          <div
            style={{
              fontSize: isMobile ? 11 : 12,
              color: highlight ? "rgba(255,255,255,0.7)" : COLORS.textMuted,
              marginTop: 6,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: highlight ? "rgba(255,255,255,0.5)" : accentColor,
                flexShrink: 0,
              }}
            />
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}
