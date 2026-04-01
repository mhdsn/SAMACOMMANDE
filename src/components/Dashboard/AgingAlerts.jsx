import { COLORS, SHADOWS } from "../../constants/theme";
import { formatCurrency } from "../../utils/format";
import { getOrderTotal, getOrderRef } from "../../utils/orders";
import { AlertTriangle } from "lucide-react";

function getDaysAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  return Math.floor((now - date) / (1000 * 60 * 60 * 24));
}

function getUrgencyLevel(days) {
  if (days >= 7) return { color: COLORS.danger, bg: COLORS.dangerLight, label: "Urgent" };
  if (days >= 3) return { color: COLORS.warning, bg: COLORS.warningLight, label: "Attention" };
  return { color: COLORS.blue, bg: COLORS.blueLight, label: "Récent" };
}

export default function AgingAlerts({ orders, isMobile }) {
  const stuckOrders = orders
    .filter((o) => o.status === "pending" || o.status === "confirmed")
    .map((o) => ({ ...o, daysAgo: getDaysAgo(o.date) }))
    .filter((o) => o.daysAgo >= 2)
    .sort((a, b) => b.daysAgo - a.daysAgo);

  if (stuckOrders.length === 0) return null;

  const stuckRevenue = stuckOrders.reduce(
    (sum, o) => sum + getOrderTotal(o.items),
    0
  );

  const urgentCount = stuckOrders.filter((o) => o.daysAgo >= 7).length;
  const maxDays = stuckOrders[0]?.daysAgo || 0;

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
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: urgentCount > 0
                ? `linear-gradient(135deg, ${COLORS.danger}, ${COLORS.danger}cc)`
                : COLORS.warningLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: urgentCount > 0 ? "#fff" : COLORS.warning,
              boxShadow: urgentCount > 0 ? `0 4px 12px ${COLORS.danger}30` : "none",
            }}
          >
            <AlertTriangle size={17} strokeWidth={2.2} />
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.2 }}>
              Commandes en attente
            </h3>
            <span style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 500 }}>
              {stuckOrders.length} commande{stuckOrders.length > 1 ? "s" : ""} en souffrance
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {urgentCount > 0 && (
            <div
              style={{
                background: COLORS.dangerLight,
                padding: "6px 12px",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.danger }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.danger }}>
                {urgentCount} urgente{urgentCount > 1 ? "s" : ""}
              </span>
            </div>
          )}
          <div
            style={{
              background: COLORS.warningLight,
              padding: "8px 14px",
              borderRadius: 10,
              textAlign: "right",
            }}
          >
            <div style={{ fontSize: 10, color: COLORS.warning, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 1 }}>
              Revenus bloqués
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.warning, letterSpacing: -0.5 }}>
              {formatCurrency(stuckRevenue)}
            </div>
          </div>
        </div>
      </div>

      {/* Order list */}
      <div style={{ padding: isMobile ? "10px 12px" : "12px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
        {stuckOrders.slice(0, 5).map((o) => {
          const urgency = getUrgencyLevel(o.daysAgo);
          const barPct = Math.min(100, (o.daysAgo / Math.max(maxDays, 7)) * 100);

          return (
            <div
              key={o.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                borderRadius: 12,
                background: COLORS.bg,
                border: `1px solid ${COLORS.borderLight}`,
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = urgency.color + "33";
                e.currentTarget.style.boxShadow = SHADOWS.sm;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = COLORS.borderLight;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Urgency indicator */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: urgency.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 800, color: urgency.color }}>
                  {o.daysAgo}j
                </span>
              </div>

              {/* Client info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: COLORS.text,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {o.client}
                  </span>
                  <span style={{ fontSize: 11, color: COLORS.accent, fontWeight: 600, flexShrink: 0 }}>
                    {getOrderRef(o.id)}
                  </span>
                </div>
                {/* Progress bar showing age relative to oldest */}
                <div
                  style={{
                    height: 3,
                    borderRadius: 3,
                    background: COLORS.surfaceAlt,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${barPct}%`,
                      borderRadius: 3,
                      background: urgency.color,
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
              </div>

              {/* Amount */}
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: COLORS.text,
                  flexShrink: 0,
                  letterSpacing: -0.3,
                }}
              >
                {formatCurrency(getOrderTotal(o.items))}
              </div>
            </div>
          );
        })}
      </div>

      {stuckOrders.length > 5 && (
        <div
          style={{
            textAlign: "center",
            padding: "10px 16px 16px",
            fontSize: 12,
            color: COLORS.textMuted,
            fontWeight: 500,
          }}
        >
          +{stuckOrders.length - 5} autre{stuckOrders.length - 5 > 1 ? "s" : ""} commande{stuckOrders.length - 5 > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
