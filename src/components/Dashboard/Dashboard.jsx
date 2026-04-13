import { useState } from "react";
import { COLORS, SHADOWS, RADIUS } from "../../constants/theme";
import { ORDER_STATUS } from "../../constants/status";
import { formatCurrency, formatDate } from "../../utils/format";
import { getOrderTotal, getOrderRef } from "../../utils/orders";
import {
  computeStats,
  computeRevenueData,
  filterOrdersByPeriod,
  computeDailySales,
  countDailyOrders,
} from "../../utils/stats";
import {
  TrendingUp, Clock, ClipboardList, BarChart3, LineChart,
  CalendarDays, CalendarRange, Sun, Activity,
  CircleCheck, PackageCheck, Truck, AlertCircle, Lock,
} from "lucide-react";
import StatCard from "./StatCard";
import MiniBarChart from "./MiniBarChart";
import RevenueAreaChart from "./RevenueAreaChart";
import RecentOrders from "./RecentOrders";
import StatusBreakdown from "./StatusBreakdown";
import AgingAlerts from "./AgingAlerts";
import { UpgradeBanner, Badge } from "../UI";

const PERIODS = [
  { key: "day", label: "Jour", icon: Sun },
  { key: "week", label: "Semaine", icon: CalendarDays },
  { key: "month", label: "Mois", icon: CalendarDays },
  { key: "year", label: "Annee", icon: CalendarRange },
  { key: "custom", label: "Personnalise", icon: CalendarRange },
];

const CHART_TITLES = {
  day: "Revenus des 7 derniers jours",
  week: "Revenus de la semaine",
  month: "Revenus journaliers du mois",
  year: "Revenus mensuels",
  custom: "Revenus de la periode",
};

const CHART_SUBS = {
  day: "Ventes quotidiennes recentes",
  week: "Du lundi au dimanche",
  month: "Detail jour par jour",
  year: "Apercu de l'annee en cours",
  custom: "Periode selectionnee",
};

// ─── Mini order list for dashboard panels ───
function OrderMiniList({ orders, icon, title, subtitle, emptyText, accentColor, bgColor, isMobile, isPro, onUpgrade, proTitle, proDesc }) {
  const content = (
    <div style={{
      background: COLORS.surface, borderRadius: 18,
      border: `1px solid ${COLORS.borderLight}`,
      boxShadow: SHADOWS.xs, overflow: "hidden",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{
        padding: isMobile ? "16px 18px" : "20px 24px",
        borderBottom: `1px solid ${COLORS.borderLight}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: bgColor, display: "flex",
            alignItems: "center", justifyContent: "center", color: accentColor,
          }}>
            {icon}
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.2 }}>
              {title}
            </h3>
            <span style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 500 }}>
              {subtitle}
            </span>
          </div>
        </div>
        <span style={{
          fontSize: 13, fontWeight: 700, color: accentColor,
          background: bgColor, padding: "4px 12px", borderRadius: 8,
        }}>
          {orders.length}
        </span>
      </div>

      <div style={{ padding: isMobile ? "8px 10px" : "10px 14px", flex: 1 }}>
        {orders.length === 0 ? (
          <div style={{ padding: 28, textAlign: "center", color: COLORS.textMuted, fontSize: 13 }}>
            {emptyText}
          </div>
        ) : (
          orders.slice(0, 5).map((o, idx) => (
            <div
              key={o.id}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 12px", borderRadius: 12,
                borderBottom: idx < Math.min(orders.length, 5) - 1 ? `1px solid ${COLORS.borderLight}` : "none",
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.bg; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: bgColor, color: accentColor,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 800, flexShrink: 0,
              }}>
                {o.client.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 600, color: COLORS.text,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {o.client}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.accent }}>{getOrderRef(o.id)}</span>
                  <span style={{ fontSize: 9, color: COLORS.textPlaceholder }}>|</span>
                  <span style={{ fontSize: 11, color: COLORS.textPlaceholder }}>{formatDate(o.date)}</span>
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, letterSpacing: -0.3 }}>
                  {formatCurrency(getOrderTotal(o.items))}
                </div>
                <Badge status={o.status} />
              </div>
            </div>
          ))
        )}
        {orders.length > 5 && (
          <div style={{
            padding: "8px 12px", textAlign: "center",
            fontSize: 12, color: COLORS.textMuted, fontWeight: 500,
          }}>
            + {orders.length - 5} autre{orders.length - 5 > 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );

  if (isPro) return content;

  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 18 }}>
      <div style={{ filter: "blur(5px)", opacity: 0.4, pointerEvents: "none" }}>{content}</div>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
      }}>
        <UpgradeBanner
          icon={icon}
          title={proTitle}
          description={proDesc}
          onUpgrade={onUpgrade}
          compact
        />
      </div>
    </div>
  );
}

export default function Dashboard({ orders, recentOrders, isMobile, isTablet, isPro, onUpgrade }) {
  const [chartType, setChartType] = useState("area");
  const [period, setPeriod] = useState("year");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  const filteredOrders = filterOrdersByPeriod(orders, period, customRange);
  const stats = computeStats(filteredOrders);
  const chartData = computeRevenueData(orders, period, customRange);

  const dailySales = computeDailySales(orders);
  const dailyCount = countDailyOrders(orders);

  const filteredRecent = filteredOrders
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Orders lists for the new panels
  const pendingOrders = filteredOrders
    .filter((o) => o.status === "pending")
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const undeliveredOrders = filteredOrders
    .filter((o) => o.status === "confirmed")
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Extra stats
  const confirmedCount = filteredOrders.filter((o) => o.status === "confirmed").length;
  const conversionRate = stats.totalCount > 0
    ? Math.round(((stats.completedCount / stats.totalCount) * 100))
    : 0;

  return (
    <>
      {/* ─── Period Filter ─── */}
      <div style={{
        display: "flex",
        alignItems: isMobile ? "stretch" : "center",
        gap: isMobile ? 8 : 12,
        marginBottom: isMobile ? 16 : 24,
        flexDirection: isMobile ? "column" : "row",
        flexWrap: "wrap",
      }}>
        <div style={{
          display: "flex", gap: 3,
          background: COLORS.surface, borderRadius: RADIUS.lg,
          padding: 3, border: `1px solid ${COLORS.borderLight}`,
          boxShadow: SHADOWS.xs, overflowX: "auto", flexShrink: 0,
        }}>
          {PERIODS.map((p) => {
            const active = period === p.key;
            return (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                style={{
                  padding: isMobile ? "7px 12px" : "8px 16px",
                  borderRadius: RADIUS.md, fontSize: isMobile ? 12 : 13,
                  fontWeight: active ? 700 : 500,
                  background: active
                    ? `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`
                    : "transparent",
                  color: active ? "#fff" : COLORS.textSecondary,
                  boxShadow: active ? SHADOWS.accent : "none",
                  whiteSpace: "nowrap", transition: "all 0.15s ease",
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {period === "custom" && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", animation: "fadeInUp 0.2s ease" }}>
            <input
              type="date" value={customRange.start}
              onChange={(e) => setCustomRange((r) => ({ ...r, start: e.target.value }))}
              style={{
                padding: "7px 12px", borderRadius: RADIUS.sm,
                border: `1.5px solid ${COLORS.border}`, fontSize: 13,
                fontFamily: "inherit", color: COLORS.text, background: COLORS.surface, outline: "none",
              }}
            />
            <span style={{ fontSize: 13, color: COLORS.textMuted, fontWeight: 500 }}>a</span>
            <input
              type="date" value={customRange.end}
              onChange={(e) => setCustomRange((r) => ({ ...r, end: e.target.value }))}
              style={{
                padding: "7px 12px", borderRadius: RADIUS.sm,
                border: `1.5px solid ${COLORS.border}`, fontSize: 13,
                fontFamily: "inherit", color: COLORS.text, background: COLORS.surface, outline: "none",
              }}
            />
          </div>
        )}
      </div>

      {/* ─── KPI Cards ─── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : isTablet ? "repeat(3, 1fr)" : "repeat(5, 1fr)",
        gap: isMobile ? 10 : 16,
        marginBottom: isMobile ? 20 : 28,
      }}>
        <div style={{ gridColumn: isMobile ? "1 / -1" : "auto" }}>
          <StatCard
            icon={<Sun size={20} strokeWidth={2} />}
            label="Ventes du jour"
            value={formatCurrency(dailySales)}
            sub={`${dailyCount} commande${dailyCount !== 1 ? "s" : ""} aujourd'hui`}
            color="#FFF7ED"
            accentColor="#EA580C"
            isMobile={isMobile}
            highlight
          />
        </div>
        <StatCard
          icon={<TrendingUp size={18} strokeWidth={2} />}
          label="Revenus"
          value={formatCurrency(stats.totalRevenue)}
          sub={`${stats.completedCount} terminee${stats.completedCount !== 1 ? "s" : ""}`}
          color={COLORS.successLight}
          accentColor={COLORS.success}
          isMobile={isMobile}
        />
        <StatCard
          icon={<Clock size={18} strokeWidth={2} />}
          label="En cours"
          value={formatCurrency(stats.pendingRevenue)}
          sub="A encaisser"
          color={COLORS.warningLight}
          accentColor={COLORS.warning}
          isMobile={isMobile}
        />
        <StatCard
          icon={<ClipboardList size={18} strokeWidth={2} />}
          label="Commandes"
          value={stats.totalCount}
          sub={`${stats.pendingCount} en attente`}
          color={COLORS.accentLight}
          accentColor={COLORS.accent}
          isMobile={isMobile}
        />
        <StatCard
          icon={<CircleCheck size={18} strokeWidth={2} />}
          label="Confirmees"
          value={confirmedCount}
          sub={`${conversionRate}% taux de livraison`}
          color={COLORS.blueLight}
          accentColor={COLORS.blue}
          isMobile={isMobile}
        />
      </div>

      {/* ─── Pending + Undelivered lists (Pro) ─── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile || isTablet ? "1fr" : "1fr 1fr",
        gap: isMobile ? 12 : 20,
        marginBottom: isMobile ? 20 : 28,
      }}>
        <OrderMiniList
          orders={pendingOrders}
          icon={<AlertCircle size={16} strokeWidth={2.2} />}
          title="A confirmer"
          subtitle={`${pendingOrders.length} commande${pendingOrders.length !== 1 ? "s" : ""} en attente`}
          emptyText="Aucune commande en attente de confirmation"
          accentColor={COLORS.warning}
          bgColor={COLORS.warningLight}
          isMobile={isMobile}
          isPro={isPro}
          onUpgrade={onUpgrade}
          proTitle="Suivi des confirmations — Pro"
          proDesc="Visualisez les commandes en attente de confirmation."
        />
        <OrderMiniList
          orders={undeliveredOrders}
          icon={<Truck size={16} strokeWidth={2.2} />}
          title="A livrer"
          subtitle={`${undeliveredOrders.length} commande${undeliveredOrders.length !== 1 ? "s" : ""} confirmee${undeliveredOrders.length !== 1 ? "s" : ""}`}
          emptyText="Aucune commande en attente de livraison"
          accentColor={COLORS.blue}
          bgColor={COLORS.blueLight}
          isMobile={isMobile}
          isPro={isPro}
          onUpgrade={onUpgrade}
          proTitle="Suivi des livraisons — Pro"
          proDesc="Visualisez les commandes confirmees non encore livrees."
        />
      </div>

      {/* ─── Chart + Recent Orders ─── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile || isTablet ? "1fr" : "5fr 3fr",
        gap: isMobile ? 12 : 20,
        marginBottom: isMobile ? 12 : 20,
      }}>
        <div style={{
          background: COLORS.surface, borderRadius: 18,
          border: `1px solid ${COLORS.borderLight}`,
          boxShadow: SHADOWS.xs, position: "relative", overflow: "hidden",
        }}>
          <div style={{
            padding: isMobile ? "16px 18px" : "20px 24px",
            borderBottom: `1px solid ${COLORS.borderLight}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: 12,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 11,
                background: COLORS.successLight,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: COLORS.success,
              }}>
                <Activity size={17} strokeWidth={2.2} />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.2 }}>
                  {CHART_TITLES[period]}
                </h3>
                <span style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 500 }}>
                  {CHART_SUBS[period]}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                textAlign: "right",
                paddingRight: isPro ? 10 : 0,
                borderRight: isPro ? `1px solid ${COLORS.borderLight}` : "none",
              }}>
                <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 500 }}>Total periode</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.success, letterSpacing: -0.5 }}>
                  {formatCurrency(chartData.reduce((s, d) => s + d.value, 0))}
                </div>
              </div>
              {isPro && (
                <div style={{
                  display: "flex", gap: 2,
                  background: COLORS.surfaceAlt, borderRadius: 10, padding: 3,
                }}>
                  {[
                    { key: "area", icon: <LineChart size={14} /> },
                    { key: "bar", icon: <BarChart3 size={14} /> },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setChartType(t.key)}
                      title={t.key === "area" ? "Courbe" : "Barres"}
                      style={{
                        padding: "7px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                        background: chartType === t.key ? COLORS.surface : "transparent",
                        color: chartType === t.key ? COLORS.accent : COLORS.textMuted,
                        boxShadow: chartType === t.key ? SHADOWS.sm : "none",
                        transition: "all 0.15s ease",
                        display: "flex", alignItems: "center", cursor: "pointer",
                      }}
                    >
                      {t.icon}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ padding: isMobile ? "12px 10px 10px" : "16px 20px 16px" }}>
            {isPro ? (
              chartType === "area" ? (
                <RevenueAreaChart data={chartData} isMobile={isMobile} />
              ) : (
                <MiniBarChart data={chartData} isMobile={isMobile} />
              )
            ) : (
              <div style={{ position: "relative" }}>
                <div style={{ filter: "blur(6px)", opacity: 0.4, pointerEvents: "none" }}>
                  <RevenueAreaChart data={chartData} isMobile={isMobile} />
                </div>
                <div style={{
                  position: "absolute", inset: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <UpgradeBanner
                    icon={<LineChart size={20} />}
                    title="Graphiques Pro"
                    description="Visualisez vos revenus avec des graphiques interactifs."
                    onUpgrade={onUpgrade}
                    compact
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <RecentOrders orders={filteredRecent.length > 0 ? filteredRecent : recentOrders} isMobile={isMobile} />
      </div>

      {/* ─── Bottom section: Aging + Status ─── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile || isTablet ? "1fr" : "1fr 1fr",
        gap: isMobile ? 12 : 20,
      }}>
        <AgingAlerts orders={filteredOrders} isMobile={isMobile} />

        {isPro ? (
          <StatusBreakdown orders={filteredOrders} isMobile={isMobile} />
        ) : (
          <div style={{
            background: COLORS.surface, borderRadius: 18,
            border: `1px solid ${COLORS.borderLight}`,
            boxShadow: SHADOWS.xs, position: "relative", overflow: "hidden",
          }}>
            <div style={{ filter: "blur(6px)", opacity: 0.4, pointerEvents: "none" }}>
              <StatusBreakdown orders={filteredOrders} isMobile={isMobile} />
            </div>
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <UpgradeBanner
                icon={<BarChart3 size={20} />}
                title="Analytics avances"
                description="Analysez la repartition de vos commandes par statut."
                onUpgrade={onUpgrade}
                compact
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
