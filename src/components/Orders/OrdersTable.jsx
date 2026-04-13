import { useState, useEffect } from "react";
import { COLORS, SHADOWS } from "../../constants/theme";
import { ORDER_STATUS } from "../../constants/status";
import { exportOrdersCSV } from "../../utils/export";
import { formatCurrency } from "../../utils/format";
import { getOrderTotal } from "../../utils/orders";
import { Search, X, Download, Lock, Inbox, ShoppingBag, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import OrderRow from "./OrderRow";

const PAGE_SIZE = 9;

export default function OrdersTable({
  orders,
  search,
  onSearchChange,
  filterStatus,
  onFilterChange,
  onStatusChange,
  isMobile,
  isPro,
  onUpgrade,
  settings,
  allOrders,
}) {
  const [page, setPage] = useState(0);

  // Reset to first page when filters change
  useEffect(() => { setPage(0); }, [search, filterStatus]);

  const source = allOrders || orders;
  const statusCounts = source.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
  const totalRevenue = source
    .filter((o) => o.status === "completed")
    .reduce((s, o) => s + getOrderTotal(o.items), 0);

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paginatedOrders = orders.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  return (
    <div>
      {/* ─── Summary banner ─── */}
      <div
        style={{
          display: "flex",
          gap: isMobile ? 10 : 16,
          marginBottom: isMobile ? 14 : 20,
          flexWrap: "wrap",
          alignItems: "stretch",
        }}
      >
        {/* Total card */}
        <div
          style={{
            background: COLORS.surface,
            borderRadius: 16,
            padding: isMobile ? "14px 16px" : "16px 22px",
            border: `1.5px solid ${filterStatus === "all" ? COLORS.accent + "33" : COLORS.borderLight}`,
            boxShadow: filterStatus === "all" ? SHADOWS.sm : SHADOWS.xs,
            cursor: "pointer",
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "center",
            gap: 14,
            minWidth: isMobile ? "100%" : "auto",
          }}
          onClick={() => onFilterChange("all")}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              flexShrink: 0,
              boxShadow: `0 4px 12px ${COLORS.accent}25`,
            }}
          >
            <ShoppingBag size={18} strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, letterSpacing: -0.8, lineHeight: 1.1 }}>
              {source.length}
            </div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 500 }}>
              commandes · {formatCurrency(totalRevenue)}
            </div>
          </div>
        </div>

        {/* Status filter pills */}
        {Object.entries(ORDER_STATUS).map(([key, cfg]) => {
          const active = filterStatus === key;
          const count = statusCounts[key] || 0;
          return (
            <button
              key={key}
              onClick={() => onFilterChange(active ? "all" : key)}
              style={{
                padding: isMobile ? "10px 14px" : "12px 18px",
                borderRadius: 14,
                background: active ? cfg.bg : COLORS.surface,
                border: `1.5px solid ${active ? cfg.color + "44" : COLORS.borderLight}`,
                boxShadow: active ? SHADOWS.sm : SHADOWS.xs,
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = cfg.color + "33";
                  e.currentTarget.style.background = cfg.bg;
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = COLORS.borderLight;
                  e.currentTarget.style.background = COLORS.surface;
                }
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 4,
                  background: cfg.color,
                  flexShrink: 0,
                  boxShadow: active ? `0 0 8px ${cfg.color}40` : "none",
                }}
              />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: isMobile ? 17 : 20, fontWeight: 800, color: COLORS.text, lineHeight: 1.1 }}>
                  {count}
                </div>
                <div style={{ fontSize: 11, color: active ? cfg.color : COLORS.textMuted, fontWeight: active ? 600 : 500, whiteSpace: "nowrap" }}>
                  {cfg.label}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ─── Main card ─── */}
      <div
        style={{
          background: COLORS.surface,
          borderRadius: 18,
          border: `1px solid ${COLORS.borderLight}`,
          overflow: "hidden",
          boxShadow: SHADOWS.xs,
        }}
      >
        {/* Toolbar */}
        <div
          style={{
            padding: isMobile ? "12px 14px" : "14px 22px",
            display: "flex",
            gap: 10,
            alignItems: "center",
            borderBottom: `1px solid ${COLORS.borderLight}`,
            flexWrap: "wrap",
          }}
        >
          {/* Search */}
          <div style={{ flex: 1, minWidth: isMobile ? "100%" : 220, position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: COLORS.textPlaceholder,
                pointerEvents: "none",
                display: "flex",
              }}
            >
              <Search size={15} />
            </span>
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone ou email..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px 10px 40px",
                borderRadius: 12,
                border: `1.5px solid ${COLORS.border}`,
                fontSize: 13,
                outline: "none",
                background: COLORS.bg,
                color: COLORS.text,
                fontFamily: "inherit",
                boxShadow: "none",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = COLORS.accent;
                e.target.style.boxShadow = `0 0 0 3px ${COLORS.accentSubtle}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = COLORS.border;
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Active filter chip */}
          {filterStatus !== "all" && (
            <button
              onClick={() => onFilterChange("all")}
              style={{
                padding: "7px 12px",
                borderRadius: 8,
                border: `1.5px solid ${ORDER_STATUS[filterStatus]?.color + "33"}`,
                background: ORDER_STATUS[filterStatus]?.bg,
                color: ORDER_STATUS[filterStatus]?.color,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Filter size={11} />
              {ORDER_STATUS[filterStatus]?.label}
              <X size={12} />
            </button>
          )}

          {/* CSV export */}
          <button
            onClick={() => {
              if (!isPro) { onUpgrade?.(); return; }
              exportOrdersCSV(orders);
            }}
            style={{
              padding: "9px 16px",
              borderRadius: 10,
              border: `1.5px solid ${isPro ? COLORS.accent + "33" : COLORS.border}`,
              background: isPro ? COLORS.accentLight : COLORS.surfaceAlt,
              color: isPro ? COLORS.accent : COLORS.textMuted,
              fontSize: 12,
              fontWeight: 600,
              whiteSpace: "nowrap",
              cursor: "pointer",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.15s ease",
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
            {isPro ? <Download size={13} /> : <Lock size={12} />}
            Exporter
          </button>
        </div>

        {/* Results count */}
        <div
          style={{
            padding: isMobile ? "8px 16px" : "8px 22px",
            borderBottom: `1px solid ${COLORS.borderLight}`,
            background: COLORS.bg,
            fontSize: 12,
            color: COLORS.textMuted,
            fontWeight: 500,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>
            {orders.length} résultat{orders.length !== 1 ? "s" : ""}
            {filterStatus !== "all" && (
              <span style={{ color: ORDER_STATUS[filterStatus]?.color, fontWeight: 600 }}>
                {" "}· {ORDER_STATUS[filterStatus]?.label}
              </span>
            )}
            {search && (
              <span> · « {search} »</span>
            )}
          </span>
          {totalPages > 1 && (
            <span style={{ fontWeight: 600 }}>
              Page {safePage + 1} / {totalPages}
            </span>
          )}
        </div>

        {/* Cards grid */}
        <div
          style={{
            padding: isMobile ? 10 : 16,
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(360px, 1fr))",
            gap: isMobile ? 10 : 14,
          }}
        >
          {paginatedOrders.map((o) => (
            <OrderRow key={o.id} order={o} onStatusChange={onStatusChange} isMobile={isMobile} isPro={isPro} onUpgrade={onUpgrade} settings={settings} />
          ))}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div
            style={{
              padding: isMobile ? "12px 16px" : "14px 22px",
              borderTop: `1px solid ${COLORS.borderLight}`,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 6,
            }}
          >
            <button
              onClick={() => setPage(Math.max(0, safePage - 1))}
              disabled={safePage === 0}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: `1.5px solid ${COLORS.borderLight}`,
                background: safePage === 0 ? COLORS.bg : COLORS.surface,
                color: safePage === 0 ? COLORS.textPlaceholder : COLORS.text,
                cursor: safePage === 0 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "inherit",
                transition: "all 0.15s ease",
              }}
            >
              <ChevronLeft size={14} /> Préc.
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  border: `1.5px solid ${i === safePage ? COLORS.accent + "44" : COLORS.borderLight}`,
                  background: i === safePage ? COLORS.accentLight : COLORS.surface,
                  color: i === safePage ? COLORS.accent : COLORS.textMuted,
                  fontWeight: i === safePage ? 700 : 500,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s ease",
                }}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setPage(Math.min(totalPages - 1, safePage + 1))}
              disabled={safePage >= totalPages - 1}
              style={{
                padding: "8px 12px",
                borderRadius: 10,
                border: `1.5px solid ${COLORS.borderLight}`,
                background: safePage >= totalPages - 1 ? COLORS.bg : COLORS.surface,
                color: safePage >= totalPages - 1 ? COLORS.textPlaceholder : COLORS.text,
                cursor: safePage >= totalPages - 1 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "inherit",
                transition: "all 0.15s ease",
              }}
            >
              Suiv. <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Empty state */}
        {orders.length === 0 && (
          <div style={{ padding: isMobile ? 48 : 72, textAlign: "center" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                background: filterStatus !== "all"
                  ? ORDER_STATUS[filterStatus]?.bg || COLORS.surfaceAlt
                  : COLORS.surfaceAlt,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                color: filterStatus !== "all"
                  ? ORDER_STATUS[filterStatus]?.color || COLORS.textPlaceholder
                  : COLORS.textPlaceholder,
              }}
            >
              {filterStatus !== "all" ? <Search size={26} /> : <Inbox size={26} />}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, marginBottom: 6, letterSpacing: -0.3 }}>
              Aucune commande trouvée
            </div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, maxWidth: 320, margin: "0 auto" }}>
              {filterStatus !== "all"
                ? "Aucune commande avec ce statut. Cliquez sur le filtre actif pour le retirer."
                : search
                ? "Aucun résultat pour cette recherche. Essayez avec d'autres termes."
                : "Créez votre première commande pour commencer."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
