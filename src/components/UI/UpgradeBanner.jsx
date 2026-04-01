import { COLORS, SHADOWS } from "../../constants/theme";
import { Lock } from "lucide-react";

export default function UpgradeBanner({ icon, title, description, onUpgrade, compact = false }) {
  if (compact) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 16px",
          borderRadius: 14,
          background: `linear-gradient(135deg, ${COLORS.accentSubtle}, #FFF3E8)`,
          border: `1.5px solid ${COLORS.accent}33`,
        }}
      >
        <span style={{ flexShrink: 0, display: "flex", color: COLORS.accent }}>
          {icon || <Lock size={18} />}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>{title}</div>
          <div style={{ fontSize: 12, color: COLORS.textMuted }}>{description}</div>
        </div>
        <button
          onClick={onUpgrade}
          style={{
            padding: "7px 16px",
            borderRadius: 10,
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            whiteSpace: "nowrap",
            boxShadow: SHADOWS.accent,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          Pro
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          background: `linear-gradient(135deg, ${COLORS.accentSubtle}, #FFF3E8)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
          border: `2px solid ${COLORS.accent}22`,
          color: COLORS.accent,
        }}
      >
        {icon || <Lock size={28} />}
      </div>
      <h3
        style={{
          fontSize: 20,
          fontWeight: 800,
          color: COLORS.text,
          marginBottom: 8,
          letterSpacing: -0.3,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 14,
          color: COLORS.textMuted,
          maxWidth: 360,
          lineHeight: 1.6,
          marginBottom: 24,
        }}
      >
        {description}
      </p>
      <button
        onClick={onUpgrade}
        style={{
          padding: "13px 32px",
          borderRadius: 14,
          background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
          color: "#fff",
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: SHADOWS.accentLg,
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0) scale(1)";
        }}
      >
        Passer à Pro — 5 000 F CFA/mois
      </button>
      <div style={{ fontSize: 12, color: COLORS.textPlaceholder, marginTop: 10 }}>
        Sans engagement · Annulez à tout moment
      </div>
    </div>
  );
}
