import { COLORS, SHADOWS } from "../../constants/theme";
import { formatCurrency, formatDate } from "../../utils/format";
import { getOrderTotal, getOrderRef } from "../../utils/orders";
import { Badge } from "../UI";
import { Clock } from "lucide-react";

const AVATAR_COLORS = [
  "#D4622B",
  "#2563EB",
  "#1B7D46",
  "#7C3AED",
  "#0891B2",
  "#C026D3",
  "#DC2626",
];

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function RecentOrders({ orders, isMobile }) {
  const totalAmount = orders.reduce((s, o) => s + getOrderTotal(o.items), 0);

  return (
    <div
      style={{
        background: COLORS.surface,
        borderRadius: 18,
        border: `1px solid ${COLORS.borderLight}`,
        boxShadow: SHADOWS.xs,
        display: "flex",
        flexDirection: "column",
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
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: COLORS.accentSubtle,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.accent,
            }}
          >
            <Clock size={15} strokeWidth={2.2} />
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.2 }}>
              Commandes récentes
            </h3>
            <span style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 500 }}>
              {orders.length} dernières
            </span>
          </div>
        </div>
        {totalAmount > 0 && (
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: COLORS.accent,
              background: COLORS.accentSubtle,
              padding: "5px 12px",
              borderRadius: 8,
              letterSpacing: -0.3,
            }}
          >
            {formatCurrency(totalAmount)}
          </div>
        )}
      </div>

      {/* Order list */}
      <div
        style={{
          padding: isMobile ? "8px 10px" : "10px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          flex: 1,
        }}
      >
        {orders.map((o, idx) => {
          const avatarColor = getAvatarColor(o.client);
          return (
            <div
              key={o.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: 12,
                background: "transparent",
                border: "1px solid transparent",
                transition: "all 0.15s ease",
                cursor: "default",
                borderBottom: idx < orders.length - 1 ? `1px solid ${COLORS.borderLight}` : "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = COLORS.bg;
                e.currentTarget.style.borderColor = COLORS.borderLight;
                e.currentTarget.style.borderBottom = `1px solid ${COLORS.borderLight}`;
                e.currentTarget.style.borderRadius = "12px";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "transparent";
                e.currentTarget.style.borderBottom = idx < orders.length - 1 ? `1px solid ${COLORS.borderLight}` : "none";
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 11,
                  background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}bb)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 12.5,
                  fontWeight: 700,
                  flexShrink: 0,
                  letterSpacing: 0.3,
                  boxShadow: `0 2px 8px ${avatarColor}30`,
                }}
              >
                {getInitials(o.client)}
              </div>

              {/* Info */}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: COLORS.text,
                    marginBottom: 3,
                  }}
                >
                  {o.client}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      fontSize: 11,
                      color: COLORS.accent,
                      fontWeight: 600,
                    }}
                  >
                    {getOrderRef(o.id)}
                  </span>
                  <span style={{ fontSize: 9, color: COLORS.textPlaceholder }}>|</span>
                  <span style={{ fontSize: 11, color: COLORS.textPlaceholder }}>
                    {formatDate(o.date)}
                  </span>
                </div>
              </div>

              {/* Amount + Status */}
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 4 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: COLORS.text,
                    marginBottom: 3,
                    letterSpacing: -0.3,
                  }}
                >
                  {formatCurrency(getOrderTotal(o.items))}
                </div>
                <Badge status={o.status} />
              </div>
            </div>
          );
        })}

        {orders.length === 0 && (
          <div style={{ padding: 32, textAlign: "center", color: COLORS.textMuted, fontSize: 13 }}>
            Aucune commande récente
          </div>
        )}
      </div>
    </div>
  );
}
