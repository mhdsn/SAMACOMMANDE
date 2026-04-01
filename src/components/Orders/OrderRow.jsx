import { useState, useRef, useEffect } from "react";
import { COLORS, SHADOWS } from "../../constants/theme";
import { ORDER_STATUS, STATUS_STEPS } from "../../constants/status";
import { formatCurrency, formatDate } from "../../utils/format";
import { getOrderTotal, getOrderRef, PAYMENT_METHODS } from "../../utils/orders";
import { sendWhatsApp } from "../../utils/whatsapp";
import { generateInvoice } from "../Invoice";
import {
  Lock, FileDown, MessageCircle, Calendar, Phone, Package,
  Clock, CircleCheck, PackageCheck, XCircle,
  ChevronDown, ArrowRight,
} from "lucide-react";

// Map icon name strings to components
const STATUS_ICONS = {
  Clock,
  CircleCheck,
  PackageCheck,
  XCircle,
};

function getStatusIcon(status, size = 14) {
  const cfg = ORDER_STATUS[status];
  if (!cfg) return null;
  const Icon = STATUS_ICONS[cfg.icon];
  return Icon ? <Icon size={size} /> : null;
}

// ─── Avatar helpers ───
function getAvatarColor(name) {
  const colors = [
    { bg: "#FCEADE", color: "#D4622B" },
    { bg: "#EFF6FF", color: "#2563EB" },
    { bg: "#E9F7EF", color: "#1B7D46" },
    { bg: "#FDF6E3", color: "#B57D14" },
    { bg: "#FDEEEC", color: "#C0392B" },
    { bg: "#F3E8FF", color: "#7C3AED" },
    { bg: "#E0F2FE", color: "#0284C7" },
    { bg: "#FEF3C7", color: "#D97706" },
  ];
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// ─── Progress bar ───
function StatusProgress({ status }) {
  const currentStep = ORDER_STATUS[status]?.step ?? 0;
  const isCancelled = status === "cancelled";

  if (isCancelled) {
    return (
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "8px 0 4px",
      }}>
        <div style={{
          flex: 1, height: 4, borderRadius: 2,
          background: `repeating-linear-gradient(90deg, ${COLORS.danger}40 0, ${COLORS.danger}40 6px, transparent 6px, transparent 10px)`,
        }} />
        <span style={{ fontSize: 10, fontWeight: 600, color: COLORS.danger, whiteSpace: "nowrap" }}>
          Annulée
        </span>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 3,
      padding: "8px 0 4px",
    }}>
      {STATUS_STEPS.map((stepKey, i) => {
        const stepCfg = ORDER_STATUS[stepKey];
        const reached = currentStep >= i;
        const isActive = currentStep === i;
        return (
          <div key={stepKey} style={{ display: "flex", alignItems: "center", flex: 1, gap: 3 }}>
            {/* Dot */}
            <div style={{
              width: isActive ? 10 : 7,
              height: isActive ? 10 : 7,
              borderRadius: "50%",
              background: reached ? stepCfg.color : COLORS.borderLight,
              flexShrink: 0,
              transition: "all 0.3s ease",
              boxShadow: isActive ? `0 0 8px ${stepCfg.color}50` : "none",
            }} />
            {/* Line */}
            {i < STATUS_STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 3, borderRadius: 2,
                background: currentStep > i
                  ? `linear-gradient(90deg, ${stepCfg.color}, ${ORDER_STATUS[STATUS_STEPS[i + 1]].color})`
                  : COLORS.borderLight,
                transition: "background 0.3s ease",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Custom Status Dropdown ───
function StatusDropdown({ order, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const currentCfg = ORDER_STATUS[order.status];
  const allowedNext = currentCfg?.next || [];

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelect = (key) => {
    onStatusChange(order.id, key);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 10px 6px 10px",
          borderRadius: 10,
          border: `1.5px solid ${currentCfg.color}30`,
          background: currentCfg.bg,
          color: currentCfg.color,
          fontSize: 12, fontWeight: 650,
          cursor: allowedNext.length > 0 ? "pointer" : "default",
          fontFamily: "inherit",
          transition: "all 0.15s ease",
          boxShadow: open ? `0 0 0 3px ${currentCfg.color}15` : "none",
          whiteSpace: "nowrap",
        }}
      >
        {getStatusIcon(order.status, 13)}
        {currentCfg.label}
        {allowedNext.length > 0 && (
          <ChevronDown
            size={12}
            style={{
              transition: "transform 0.2s ease",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              opacity: 0.6,
            }}
          />
        )}
      </button>

      {/* Dropdown menu */}
      {open && allowedNext.length > 0 && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          right: 0,
          minWidth: 200,
          background: COLORS.surface,
          borderRadius: 14,
          border: `1.5px solid ${COLORS.borderLight}`,
          boxShadow: SHADOWS.lg,
          zIndex: 50,
          overflow: "hidden",
          animation: "fadeIn 0.12s ease",
        }}>
          {/* Header */}
          <div style={{
            padding: "8px 14px",
            fontSize: 10.5, fontWeight: 700, color: COLORS.textPlaceholder,
            textTransform: "uppercase", letterSpacing: 0.6,
            borderBottom: `1px solid ${COLORS.borderLight}`,
            background: COLORS.bg,
          }}>
            Changer le statut
          </div>

          {allowedNext.map((key, i) => {
            const cfg = ORDER_STATUS[key];
            const Icon = STATUS_ICONS[cfg.icon];
            const isDanger = key === "cancelled";
            return (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  width: "100%", padding: "11px 14px",
                  background: "transparent",
                  border: "none",
                  borderBottom: i < allowedNext.length - 1 ? `1px solid ${COLORS.borderLight}` : "none",
                  cursor: "pointer",
                  transition: "background 0.1s ease",
                  fontFamily: "inherit",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isDanger ? COLORS.dangerLight : cfg.bg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: 9,
                  background: cfg.bg,
                  color: cfg.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {Icon && <Icon size={15} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600,
                    color: isDanger ? COLORS.danger : COLORS.text,
                  }}>
                    {cfg.actionLabel}
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 1 }}>
                    {key === "confirmed" && "Valider et lancer la commande"}
                    {key === "completed" && "Marquer comme livrée / terminée"}
                    {key === "cancelled" && "Annuler définitivement"}
                    {key === "pending" && "Réactiver la commande"}
                  </div>
                </div>
                <ArrowRight size={13} style={{ color: COLORS.textPlaceholder, flexShrink: 0 }} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main OrderRow ───
export default function OrderRow({
  order,
  onStatusChange,
  isMobile,
  isPro,
  onUpgrade,
  settings,
}) {
  const handleInvoice = () => {
    if (!isPro) { onUpgrade?.(); return; }
    generateInvoice(order, settings, isPro);
  };

  const handleWhatsApp = () => {
    if (!isPro) { onUpgrade?.(); return; }
    const companyName = settings?.company?.name || "SamaCommande";
    sendWhatsApp(order, companyName);
  };

  const statusConfig = ORDER_STATUS[order.status];
  const itemCount = order.items?.length || 0;
  const itemLabel = itemCount > 1 ? `${itemCount} articles` : `${itemCount} article`;
  const avatarStyle = getAvatarColor(order.client);

  const actionBtnBase = {
    borderRadius: 10,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    fontWeight: 600,
    whiteSpace: "nowrap",
    fontFamily: "inherit",
    transition: "all 0.15s ease",
  };

  return (
    <div
      style={{
        background: COLORS.surface,
        borderRadius: 16,
        border: `1px solid ${COLORS.borderLight}`,
        overflow: "hidden",
        transition: "all 0.2s ease",
        boxShadow: SHADOWS.xs,
        display: "flex",
        flexDirection: "column",
        opacity: order.status === "cancelled" ? 0.7 : 1,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = SHADOWS.md;
        e.currentTarget.style.borderColor = COLORS.border;
        e.currentTarget.style.transform = "translateY(-2px)";
        if (order.status === "cancelled") e.currentTarget.style.opacity = "1";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = SHADOWS.xs;
        e.currentTarget.style.borderColor = COLORS.borderLight;
        e.currentTarget.style.transform = "translateY(0)";
        if (order.status === "cancelled") e.currentTarget.style.opacity = "0.7";
      }}
    >
      {/* Header: status bar accent */}
      <div style={{
        height: 4,
        background: order.status === "cancelled"
          ? `repeating-linear-gradient(90deg, ${statusConfig.color} 0, ${statusConfig.color} 8px, transparent 8px, transparent 14px)`
          : `linear-gradient(90deg, ${statusConfig.color}, ${statusConfig.color}88)`,
        borderRadius: "16px 16px 0 0",
      }} />

      {/* Top section: avatar + client info + status */}
      <div
        style={{
          padding: isMobile ? "14px 16px 6px" : "16px 20px 6px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: isMobile ? 42 : 44,
            height: isMobile ? 42 : 44,
            borderRadius: 12,
            background: avatarStyle.bg,
            color: avatarStyle.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: isMobile ? 14 : 15,
            fontWeight: 800,
            flexShrink: 0,
            letterSpacing: -0.5,
            border: `1.5px solid ${avatarStyle.color}18`,
          }}
        >
          {getInitials(order.client)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 700, fontSize: 15, color: COLORS.text, letterSpacing: -0.3,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            textDecoration: order.status === "cancelled" ? "line-through" : "none",
          }}>
            {order.client}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.accent }}>{getOrderRef(order.id)}</span>
            <span style={{ fontSize: 10, color: COLORS.textPlaceholder }}>·</span>
            <span style={{ fontSize: 11, color: COLORS.textPlaceholder, display: "flex", alignItems: "center", gap: 3 }}>
              <Calendar size={10} />
              {formatDate(order.date)}
            </span>
          </div>
        </div>
        <StatusDropdown order={order} onStatusChange={onStatusChange} />
      </div>

      {/* Progress bar */}
      <div style={{ padding: isMobile ? "0 16px 10px" : "0 20px 10px", borderBottom: `1px solid ${COLORS.borderLight}` }}>
        <StatusProgress status={order.status} />
      </div>

      {/* Body */}
      <div style={{ padding: isMobile ? "14px 16px" : "16px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Contact info */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <Phone size={11} style={{ color: COLORS.textPlaceholder }} />
          <span style={{ fontSize: 12, color: COLORS.textMuted }}>{order.phone}</span>
          {order.email && <span style={{ fontSize: 12, color: COLORS.textPlaceholder }}> · {order.email}</span>}
        </div>

        {/* Order items list */}
        <div style={{
          marginBottom: 12,
          padding: "10px 12px",
          borderRadius: 10,
          background: COLORS.bg,
          border: `1px solid ${COLORS.borderLight}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8, color: COLORS.textMuted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
            <Package size={11} />
            Objet de la commande
          </div>
          {order.items?.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "5px 0",
                borderTop: i > 0 ? `1px dashed ${COLORS.borderLight}` : "none",
              }}
            >
              <span style={{ fontSize: 12.5, color: COLORS.text, fontWeight: 500 }}>
                {item.name}
                {item.qty > 1 && (
                  <span style={{ color: COLORS.textMuted, fontWeight: 400 }}> x{item.qty}</span>
                )}
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, whiteSpace: "nowrap", marginLeft: 8 }}>
                {formatCurrency(item.qty * item.price)}
              </span>
            </div>
          ))}
        </div>

        {/* Payment + Amount row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flex: 1 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 8,
              background: COLORS.surfaceAlt, color: COLORS.textSecondary,
            }}>
              {itemLabel}
            </span>
            {order.payment && (
              <span style={{
                fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 8,
                background: COLORS.accentSubtle, color: COLORS.accent,
              }}>
                {PAYMENT_METHODS[order.payment] || order.payment}
              </span>
            )}
          </div>
          <div style={{
            fontSize: 20, fontWeight: 800, letterSpacing: -0.5,
            color: order.status === "cancelled" ? COLORS.textPlaceholder : COLORS.text,
            textDecoration: order.status === "cancelled" ? "line-through" : "none",
          }}>
            {formatCurrency(getOrderTotal(order.items))}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, borderTop: `1px solid ${COLORS.borderLight}`, paddingTop: 12 }}>
          <button
            onClick={handleWhatsApp}
            title="Envoyer via WhatsApp"
            style={{
              ...actionBtnBase, flex: 1, padding: "10px 10px", fontSize: 12,
              border: `1.5px solid ${isPro ? "#25D36622" : COLORS.borderLight}`,
              background: isPro ? "#E8FBF0" : COLORS.surfaceAlt,
              color: isPro ? "#25D366" : COLORS.textMuted,
            }}
            onMouseEnter={(e) => {
              if (isPro) {
                e.currentTarget.style.background = "#25D366";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,211,102,0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (isPro) {
                e.currentTarget.style.background = "#E8FBF0";
                e.currentTarget.style.color = "#25D366";
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          >
            {isPro ? <MessageCircle size={14} /> : <Lock size={12} />} WhatsApp
          </button>
          <button
            onClick={handleInvoice}
            title="Télécharger la facture"
            style={{
              ...actionBtnBase, flex: 1, padding: "10px 10px", fontSize: 12,
              border: `1.5px solid ${isPro ? COLORS.accent + "22" : COLORS.borderLight}`,
              background: isPro ? COLORS.accentLight : COLORS.surfaceAlt,
              color: isPro ? COLORS.accent : COLORS.textMuted,
            }}
            onMouseEnter={(e) => {
              if (isPro) {
                e.currentTarget.style.background = COLORS.accent;
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.boxShadow = SHADOWS.accent;
              }
            }}
            onMouseLeave={(e) => {
              if (isPro) {
                e.currentTarget.style.background = COLORS.accentLight;
                e.currentTarget.style.color = COLORS.accent;
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          >
            {isPro ? <FileDown size={14} /> : <Lock size={12} />} Facture
          </button>
        </div>
      </div>
    </div>
  );
}
