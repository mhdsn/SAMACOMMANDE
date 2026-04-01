import { COLORS, SHADOWS } from "../../constants/theme";
import { formatToday } from "../../utils/format";
import { Menu, Plus } from "lucide-react";

export default function PageHeader({
  title,
  onNewOrder,
  onMenuToggle,
  isMobile,
  showNewOrder = true,
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: isMobile ? 24 : 32,
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {isMobile && (
          <button
            onClick={onMenuToggle}
            style={{
              background: COLORS.surface,
              border: `1.5px solid ${COLORS.borderLight}`,
              borderRadius: 13,
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.text,
              flexShrink: 0,
              boxShadow: SHADOWS.sm,
            }}
          >
            <Menu size={20} />
          </button>
        )}
        <div>
          <h1
            style={{
              fontSize: isMobile ? 24 : 28,
              fontWeight: 800,
              letterSpacing: -0.8,
              lineHeight: 1.15,
              color: COLORS.text,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontSize: 13,
              color: COLORS.textMuted,
              marginTop: 4,
              fontWeight: 450,
            }}
          >
            {formatToday()}
          </p>
        </div>
      </div>
      {showNewOrder && (
        <button
          onClick={onNewOrder}
          style={{
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
            color: "#fff",
            padding: isMobile ? "10px 18px" : "12px 26px",
            borderRadius: 13,
            fontSize: 13.5,
            fontWeight: 600,
            whiteSpace: "nowrap",
            boxShadow: SHADOWS.accent,
            flexShrink: 0,
            letterSpacing: -0.1,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = SHADOWS.accentLg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = SHADOWS.accent;
          }}
        >
          <Plus size={16} strokeWidth={2.5} />
          {isMobile ? "Nouveau" : "Nouvelle commande"}
        </button>
      )}
    </div>
  );
}
