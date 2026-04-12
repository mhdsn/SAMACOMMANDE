import { useState, useRef, useEffect } from "react";
import { COLORS, SHADOWS } from "../../constants/theme";
import { ORDER_STATUS } from "../../constants/status";
import { formatCurrency, formatDate } from "../../utils/format";
import { getOrderTotal, getOrderRef, PAYMENT_METHODS } from "../../utils/orders";
import { sendWhatsApp } from "../../utils/whatsapp";
import { generateInvoice } from "../Invoice";
import {
  Lock, FileDown, MessageCircle, Calendar, Phone, Mail,
  Clock, CircleCheck, PackageCheck, XCircle,
  ChevronDown, ArrowRight, MapPin, CreditCard,
  Banknote, Smartphone, Building2, Wallet,
} from "lucide-react";

const STATUS_ICONS = { Clock, CircleCheck, PackageCheck, XCircle };

const PAYMENT_ICONS = {
  wave: Smartphone,
  orange_money: Wallet,
  especes: Banknote,
  virement: Building2,
};

const PAYMENT_COLORS = {
  wave: { color: "#1DC3E0", bg: "#E6F9FC" },
  orange_money: { color: "#FF6B00", bg: "#FFF2E6" },
  especes: { color: COLORS.success, bg: COLORS.successLight },
  virement: { color: COLORS.blue, bg: COLORS.blueLight },
};

function getStatusIcon(status, size = 14) {
  const cfg = ORDER_STATUS[status];
  if (!cfg) return null;
  const Icon = STATUS_ICONS[cfg.icon];
  return Icon ? <Icon size={size} /> : null;
}

function getAvatarColor(name) {
  const colors = [
    { bg: "linear-gradient(135deg, #FCEADE, #F8D4BC)", color: "#D4622B" },
    { bg: "linear-gradient(135deg, #EFF6FF, #DBEAFE)", color: "#2563EB" },
    { bg: "linear-gradient(135deg, #E9F7EF, #D1FAE5)", color: "#1B7D46" },
    { bg: "linear-gradient(135deg, #FDF6E3, #FEF3C7)", color: "#B57D14" },
    { bg: "linear-gradient(135deg, #FDEEEC, #FEE2E2)", color: "#C0392B" },
    { bg: "linear-gradient(135deg, #F3E8FF, #E9D5FF)", color: "#7C3AED" },
    { bg: "linear-gradient(135deg, #E0F2FE, #BAE6FD)", color: "#0284C7" },
    { bg: "linear-gradient(135deg, #FEF3C7, #FDE68A)", color: "#D97706" },
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

// ─── Status Dropdown ───
function StatusDropdown({ order, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const currentCfg = ORDER_STATUS[order.status];
  const allowedNext = currentCfg?.next || [];

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => allowedNext.length > 0 && setOpen(!open)}
        style={{
          display: "flex", alignItems: "center", gap: 5,
          padding: "5px 10px 5px 8px",
          borderRadius: 20,
          border: `1.5px solid ${currentCfg.color}25`,
          background: currentCfg.bg,
          color: currentCfg.color,
          fontSize: 11.5, fontWeight: 650,
          cursor: allowedNext.length > 0 ? "pointer" : "default",
          fontFamily: "inherit",
          transition: "all 0.2s ease",
          boxShadow: open ? `0 0 0 3px ${currentCfg.color}12` : "none",
          whiteSpace: "nowrap",
        }}
      >
        {getStatusIcon(order.status, 12)}
        {currentCfg.label}
        {allowedNext.length > 0 && (
          <ChevronDown size={11} style={{
            transition: "transform 0.2s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            opacity: 0.5,
          }} />
        )}
      </button>

      {open && allowedNext.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0,
          minWidth: 210, background: COLORS.surface, borderRadius: 14,
          border: `1px solid ${COLORS.borderLight}`,
          boxShadow: SHADOWS.lg, zIndex: 50, overflow: "hidden",
          animation: "fadeIn 0.12s ease",
        }}>
          <div style={{
            padding: "8px 14px", fontSize: 10, fontWeight: 700,
            color: COLORS.textPlaceholder, textTransform: "uppercase",
            letterSpacing: 0.8, borderBottom: `1px solid ${COLORS.borderLight}`,
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
                onClick={() => { onStatusChange(order.id, key); setOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  width: "100%", padding: "11px 14px", background: "transparent",
                  border: "none",
                  borderBottom: i < allowedNext.length - 1 ? `1px solid ${COLORS.borderLight}` : "none",
                  cursor: "pointer", transition: "background 0.1s ease",
                  fontFamily: "inherit", textAlign: "left",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = isDanger ? COLORS.dangerLight : cfg.bg; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: 9,
                  background: cfg.bg, color: cfg.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {Icon && <Icon size={15} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: isDanger ? COLORS.danger : COLORS.text }}>
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
export default function OrderRow({ order, onStatusChange, isMobile, isPro, onUpgrade, settings }) {
  const handleInvoice = () => {
    if (!isPro) { onUpgrade?.(); return; }
    generateInvoice(order, settings, isPro);
  };
  const handleWhatsApp = () => {
    if (!isPro) { onUpgrade?.(); return; }
    sendWhatsApp(order, settings?.company?.name || "SamaCommande");
  };

  const statusConfig = ORDER_STATUS[order.status];
  const total = getOrderTotal(order.items);
  const itemCount = order.items?.length || 0;
  const avatarStyle = getAvatarColor(order.client);
  const isCancelled = order.status === "cancelled";
  const paymentColor = PAYMENT_COLORS[order.payment];
  const PaymentIcon = PAYMENT_ICONS[order.payment] || CreditCard;

  const hasContact = order.phone || order.email || order.address;

  return (
    <div
      style={{
        background: COLORS.surface,
        borderRadius: 18,
        border: `1px solid ${COLORS.borderLight}`,
        overflow: "hidden",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: SHADOWS.sm,
        display: "flex",
        flexDirection: "column",
        opacity: isCancelled ? 0.65 : 1,
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = SHADOWS.lg;
        e.currentTarget.style.borderColor = COLORS.border;
        e.currentTarget.style.transform = "translateY(-3px)";
        if (isCancelled) e.currentTarget.style.opacity = "0.9";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = SHADOWS.sm;
        e.currentTarget.style.borderColor = COLORS.borderLight;
        e.currentTarget.style.transform = "translateY(0)";
        if (isCancelled) e.currentTarget.style.opacity = "0.65";
      }}
    >
      {/* ─── Left accent strip ─── */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
        background: isCancelled
          ? `repeating-linear-gradient(180deg, ${statusConfig.color} 0, ${statusConfig.color} 6px, transparent 6px, transparent 10px)`
          : `linear-gradient(180deg, ${statusConfig.color}, ${statusConfig.color}55)`,
        borderRadius: "18px 0 0 18px",
        zIndex: 1,
      }} />

      {/* ─── Header ─── */}
      <div style={{ padding: isMobile ? "16px 16px 14px 20px" : "18px 22px 16px 26px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          {/* Avatar */}
          <div style={{
            width: isMobile ? 44 : 48, height: isMobile ? 44 : 48,
            borderRadius: 14, background: avatarStyle.bg,
            color: avatarStyle.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: isMobile ? 15 : 16, fontWeight: 800,
            flexShrink: 0, letterSpacing: -0.5,
            boxShadow: `0 2px 8px ${avatarStyle.color}15`,
          }}>
            {getInitials(order.client)}
          </div>

          {/* Name + meta */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontWeight: 700, fontSize: isMobile ? 15 : 16,
              color: COLORS.text, letterSpacing: -0.3,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              textDecoration: isCancelled ? "line-through" : "none",
              lineHeight: 1.3,
            }}>
              {order.client}
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 6, marginTop: 3,
              flexWrap: "wrap",
            }}>
              <span style={{
                fontSize: 11.5, fontWeight: 700, color: COLORS.accent,
                letterSpacing: -0.2,
              }}>
                {getOrderRef(order.id)}
              </span>
              <span style={{
                width: 3, height: 3, borderRadius: "50%",
                background: COLORS.textPlaceholder, flexShrink: 0,
              }} />
              <span style={{
                fontSize: 11, color: COLORS.textPlaceholder,
                display: "flex", alignItems: "center", gap: 3,
              }}>
                <Calendar size={10} />
                {formatDate(order.date)}
              </span>
            </div>
          </div>

          <StatusDropdown order={order} onStatusChange={onStatusChange} />
        </div>
      </div>

      {/* ─── Total band ─── */}
      <div style={{
        margin: isMobile ? "0 16px 0 20px" : "0 22px 0 26px",
        padding: "12px 16px",
        borderRadius: 14,
        background: isCancelled
          ? COLORS.bg
          : `linear-gradient(135deg, ${statusConfig.bg}80, ${statusConfig.bg}30)`,
        border: `1px solid ${isCancelled ? COLORS.borderLight : statusConfig.color + "18"}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 7,
            background: COLORS.surface, color: COLORS.textSecondary,
            border: `1px solid ${COLORS.borderLight}`,
          }}>
            {itemCount} article{itemCount !== 1 ? "s" : ""}
          </span>
          {order.payment && (
            <span style={{
              fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 7,
              display: "inline-flex", alignItems: "center", gap: 4,
              background: paymentColor?.bg || COLORS.accentSubtle,
              color: paymentColor?.color || COLORS.accent,
              border: `1px solid ${(paymentColor?.color || COLORS.accent) + "20"}`,
            }}>
              <PaymentIcon size={11} />
              {PAYMENT_METHODS[order.payment] || order.payment}
            </span>
          )}
        </div>
        <span style={{
          fontSize: isMobile ? 22 : 24, fontWeight: 800, letterSpacing: -0.8,
          color: isCancelled ? COLORS.textPlaceholder : COLORS.text,
          textDecoration: isCancelled ? "line-through" : "none",
          lineHeight: 1,
        }}>
          {formatCurrency(total)}
        </span>
      </div>

      {/* ─── Contact chips ─── */}
      {hasContact && (
        <div style={{
          padding: isMobile ? "10px 16px 0 20px" : "12px 22px 0 26px",
          display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6,
        }}>
          {order.phone && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 11.5, color: COLORS.textMuted,
              padding: "4px 10px 4px 8px", borderRadius: 8,
              background: COLORS.bg,
            }}>
              <Phone size={11} style={{ color: COLORS.textPlaceholder }} />
              {order.phone}
            </span>
          )}
          {order.email && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 11.5, color: COLORS.textMuted,
              padding: "4px 10px 4px 8px", borderRadius: 8,
              background: COLORS.bg,
            }}>
              <Mail size={11} style={{ color: COLORS.textPlaceholder }} />
              {order.email}
            </span>
          )}
          {order.address && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 11.5, color: COLORS.textMuted,
              padding: "4px 10px 4px 8px", borderRadius: 8,
              background: COLORS.bg,
            }}>
              <MapPin size={11} style={{ color: COLORS.textPlaceholder }} />
              {order.address}
            </span>
          )}
        </div>
      )}

      {/* ─── Items list ─── */}
      <div style={{
        padding: isMobile ? "12px 16px 14px 20px" : "14px 22px 16px 26px",
        flex: 1,
      }}>
        {order.items?.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "8px 0",
              borderBottom: i < order.items.length - 1 ? `1px solid ${COLORS.borderLight}` : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
              <span style={{
                width: 22, height: 22, borderRadius: 7,
                background: COLORS.bg, color: COLORS.textMuted,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10.5, fontWeight: 700, flexShrink: 0,
                border: `1px solid ${COLORS.borderLight}`,
              }}>
                {i + 1}
              </span>
              <span style={{
                fontSize: 13, color: COLORS.text, fontWeight: 500,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {item.name}
              </span>
              {item.qty > 1 && (
                <span style={{
                  fontSize: 10.5, color: COLORS.textPlaceholder, fontWeight: 700,
                  padding: "1px 6px", borderRadius: 5,
                  background: COLORS.bg, flexShrink: 0,
                }}>
                  x{item.qty}
                </span>
              )}
            </div>
            <span style={{
              fontSize: 13, fontWeight: 650, color: COLORS.textSecondary,
              whiteSpace: "nowrap", marginLeft: 12, letterSpacing: -0.3,
            }}>
              {formatCurrency(item.qty * item.price)}
            </span>
          </div>
        ))}
      </div>

      {/* ─── Footer: Actions ─── */}
      <div style={{
        display: "flex", gap: 8,
        padding: isMobile ? "0 16px 16px 20px" : "0 22px 18px 26px",
      }}>
        <button
          onClick={handleWhatsApp}
          title="Envoyer via WhatsApp"
          style={{
            borderRadius: 12, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 6, fontWeight: 600, whiteSpace: "nowrap",
            fontFamily: "inherit",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            flex: 1, padding: "11px 12px", fontSize: 12.5,
            border: `1.5px solid ${isPro ? "#25D36620" : COLORS.borderLight}`,
            background: isPro ? "#F0FDF4" : COLORS.surfaceAlt,
            color: isPro ? "#25D366" : COLORS.textMuted,
          }}
          onMouseEnter={(e) => {
            if (isPro) {
              e.currentTarget.style.background = "#25D366";
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.borderColor = "#25D366";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(37,211,102,0.3)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            if (isPro) {
              e.currentTarget.style.background = "#F0FDF4";
              e.currentTarget.style.color = "#25D366";
              e.currentTarget.style.borderColor = "#25D36620";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }
          }}
        >
          {isPro ? <MessageCircle size={15} /> : <Lock size={12} />}
          WhatsApp
        </button>
        <button
          onClick={handleInvoice}
          title="Télécharger la facture"
          style={{
            borderRadius: 12, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 6, fontWeight: 600, whiteSpace: "nowrap",
            fontFamily: "inherit",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            flex: 1, padding: "11px 12px", fontSize: 12.5,
            border: `1.5px solid ${isPro ? COLORS.accent + "20" : COLORS.borderLight}`,
            background: isPro ? COLORS.accentLight : COLORS.surfaceAlt,
            color: isPro ? COLORS.accent : COLORS.textMuted,
          }}
          onMouseEnter={(e) => {
            if (isPro) {
              e.currentTarget.style.background = COLORS.accent;
              e.currentTarget.style.color = "#fff";
              e.currentTarget.style.borderColor = COLORS.accent;
              e.currentTarget.style.boxShadow = SHADOWS.accent;
              e.currentTarget.style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            if (isPro) {
              e.currentTarget.style.background = COLORS.accentLight;
              e.currentTarget.style.color = COLORS.accent;
              e.currentTarget.style.borderColor = COLORS.accent + "20";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }
          }}
        >
          {isPro ? <FileDown size={15} /> : <Lock size={12} />}
          Facture
        </button>
      </div>
    </div>
  );
}
