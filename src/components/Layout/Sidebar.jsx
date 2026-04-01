import { COLORS, SHADOWS } from "../../constants/theme";
import {
  LayoutDashboard,
  ShoppingBag,
  Sparkles,
  Settings,
  CreditCard,
  X,
  Crown,
  Package,
  ClipboardList,
  Shield,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard", Icon: LayoutDashboard, label: "Tableau de bord" },
  { id: "orders", Icon: ShoppingBag, label: "Commandes" },
  { id: "ai", Icon: Sparkles, label: "Assistant IA" },
  { id: "settings", Icon: Settings, label: "Paramètres" },
  { id: "pricing", Icon: CreditCard, label: "Tarifs" },
];

export default function Sidebar({
  activeView,
  onNavigate,
  onLogout,
  orderCount,
  isMobile,
  isOpen,
  onClose,
  width,
  planId,
  isPro,
  maxOrders,
  isAdmin,
}) {
  const visible = isMobile ? isOpen : true;

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        width: isMobile ? 280 : width,
        background: COLORS.surfaceGlass,
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderRight: `1px solid rgba(240, 235, 229, 0.6)`,
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
        transform: visible ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: isMobile && isOpen ? SHADOWS.xl : SHADOWS.xs,
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          height: 3,
          background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.accentDark}, ${COLORS.accent})`,
          flexShrink: 0,
        }}
      />

      <div
        style={{
          padding: "24px 16px 20px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        {/* Brand */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 8px",
            marginBottom: 4,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 11,
                background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 16,
                fontWeight: 800,
                boxShadow: SHADOWS.accent,
              }}
            >
              S
            </div>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: COLORS.text,
                letterSpacing: -0.4,
              }}
            >
              Sama<span style={{ color: COLORS.accent }}>Commande</span>
            </span>
          </div>
          {isMobile && (
            <button
              onClick={onClose}
              style={{
                width: 30,
                height: 30,
                borderRadius: 9,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: COLORS.textMuted,
                background: COLORS.surfaceAlt,
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div
          style={{
            fontSize: 11,
            color: COLORS.textPlaceholder,
            padding: "0 8px",
            marginBottom: 28,
            fontWeight: 500,
          }}
        >
          Gestion de votre activité
        </div>

        {/* Section label */}
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: COLORS.textPlaceholder,
            textTransform: "uppercase",
            letterSpacing: 1.2,
            padding: "0 8px",
            marginBottom: 8,
          }}
        >
          Menu
        </div>

        {/* Navigation */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {NAV_ITEMS.map((n) => {
            const active = activeView === n.id;
            return (
              <button
                key={n.id}
                onClick={() => onNavigate(n.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: 12,
                  fontSize: 13.5,
                  fontWeight: active ? 600 : 500,
                  textAlign: "left",
                  transition: "all 0.15s ease",
                  background: active ? COLORS.accentSubtle : "transparent",
                  color: active ? COLORS.accent : COLORS.textSecondary,
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = COLORS.surfaceAlt;
                    e.currentTarget.style.color = COLORS.text;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = COLORS.textSecondary;
                  }
                }}
              >
                {active && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 3,
                      height: 20,
                      borderRadius: 4,
                      background: COLORS.accent,
                    }}
                  />
                )}
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: active ? `${COLORS.accent}18` : COLORS.surfaceAlt,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s ease",
                    flexShrink: 0,
                    color: active ? COLORS.accent : COLORS.textMuted,
                  }}
                >
                  <n.Icon size={16} strokeWidth={2} />
                </span>
                <span style={{ flex: 1 }}>{n.label}</span>
              </button>
            );
          })}

          {/* Admin nav item — only visible for admins */}
          {isAdmin && (
            <>
              <div
                style={{
                  height: 1,
                  background: COLORS.borderLight,
                  margin: "10px 8px",
                }}
              />
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: COLORS.textPlaceholder,
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  padding: "0 8px",
                  marginBottom: 6,
                }}
              >
                Admin
              </div>
              <button
                onClick={() => onNavigate("admin")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: 12,
                  fontSize: 13.5,
                  fontWeight: activeView === "admin" ? 600 : 500,
                  textAlign: "left",
                  transition: "all 0.15s ease",
                  background: activeView === "admin" ? "#1A16120D" : "transparent",
                  color: activeView === "admin" ? COLORS.text : COLORS.textSecondary,
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (activeView !== "admin") {
                    e.currentTarget.style.background = COLORS.surfaceAlt;
                    e.currentTarget.style.color = COLORS.text;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeView !== "admin") {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = COLORS.textSecondary;
                  }
                }}
              >
                {activeView === "admin" && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 3,
                      height: 20,
                      borderRadius: 4,
                      background: COLORS.text,
                    }}
                  />
                )}
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: activeView === "admin"
                      ? `linear-gradient(135deg, ${COLORS.text}, #2A2420)`
                      : COLORS.surfaceAlt,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s ease",
                    flexShrink: 0,
                    color: activeView === "admin" ? "#fff" : COLORS.textMuted,
                  }}
                >
                  <Shield size={16} strokeWidth={2} />
                </span>
                <span style={{ flex: 1 }}>Administration</span>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 6,
                    background: `linear-gradient(135deg, ${COLORS.text}, #2A2420)`,
                    color: "#fff",
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    lineHeight: "14px",
                  }}
                >
                  ADMIN
                </span>
              </button>
            </>
          )}
        </nav>

        {/* Plan card */}
        <div
          style={{
            padding: "14px 16px",
            background: isPro
              ? `linear-gradient(135deg, ${COLORS.accentSubtle}, #FFF3E8)`
              : COLORS.surface,
            borderRadius: 14,
            border: isPro
              ? `1.5px solid ${COLORS.accent}44`
              : `1.5px solid ${COLORS.borderLight}`,
            marginBottom: 10,
            boxShadow: SHADOWS.xs,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: isPro ? COLORS.accent : COLORS.textMuted, display: "flex" }}>
                {isPro ? <Crown size={14} /> : <Package size={14} />}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: isPro ? COLORS.accent : COLORS.textSecondary,
                }}
              >
                Plan {isPro ? "Pro" : "Starter"}
              </span>
            </div>
            {!isPro && (
              <button
                onClick={() => onNavigate("pricing")}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "4px 12px",
                  borderRadius: 8,
                  background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
                  color: "#fff",
                  cursor: "pointer",
                  letterSpacing: 0.3,
                  boxShadow: SHADOWS.accent,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Upgrade
              </button>
            )}
          </div>
          {!isPro && (
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>
              {orderCount}/{maxOrders} commandes
            </div>
          )}
          {!isPro && (
            <div
              style={{
                marginTop: 6,
                height: 4,
                borderRadius: 2,
                background: COLORS.border,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.min((orderCount / maxOrders) * 100, 100)}%`,
                  borderRadius: 2,
                  background:
                    orderCount >= maxOrders
                      ? COLORS.danger
                      : orderCount >= maxOrders * 0.7
                      ? COLORS.warning
                      : `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.accentDark})`,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          )}
        </div>

        {/* Footer stats */}
        <div
          style={{
            padding: 16,
            background: COLORS.surface,
            borderRadius: 14,
            border: `1.5px solid ${COLORS.borderLight}`,
            boxShadow: SHADOWS.xs,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10,
                  color: COLORS.textMuted,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  marginBottom: 4,
                }}
              >
                Commandes
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  color: COLORS.text,
                  letterSpacing: -1,
                }}
              >
                {orderCount}
              </div>
            </div>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 13,
                background: `linear-gradient(135deg, ${COLORS.accentLight}, ${COLORS.accentSubtle})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: COLORS.accent,
              }}
            >
              <ClipboardList size={20} strokeWidth={1.8} />
            </div>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 500,
            textAlign: "left",
            width: "100%",
            transition: "all 0.15s ease",
            background: "transparent",
            color: COLORS.textMuted,
            cursor: "pointer",
            border: `1.5px solid transparent`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = COLORS.dangerLight;
            e.currentTarget.style.color = COLORS.danger;
            e.currentTarget.style.borderColor = `${COLORS.danger}22`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = COLORS.textMuted;
            e.currentTarget.style.borderColor = "transparent";
          }}
        >
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: COLORS.surfaceAlt,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <LogOut size={15} strokeWidth={2} />
          </span>
          Déconnexion
        </button>
      </div>
    </div>
  );
}
