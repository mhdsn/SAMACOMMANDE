import { useState } from "react";
import { COLORS, SHADOWS, RADIUS } from "../../constants/theme";
import { formatCurrency } from "../../utils/format";
import {
  computeStats,
  computeRevenueData,
  filterOrdersByPeriod,
  computeDailySales,
  countDailyOrders,
} from "../../utils/stats";
import {
  TrendingUp,
  Clock,
  ClipboardList,
  BarChart3,
  LineChart,
  CalendarDays,
  CalendarRange,
  Sun,
  Activity,
} from "lucide-react";
import StatCard from "./StatCard";
import MiniBarChart from "./MiniBarChart";
import RevenueAreaChart from "./RevenueAreaChart";
import RecentOrders from "./RecentOrders";
import StatusBreakdown from "./StatusBreakdown";
import AgingAlerts from "./AgingAlerts";
import { UpgradeBanner } from "../UI";

const PERIODS = [
  { key: "day", label: "Jour", icon: Sun },
  { key: "week", label: "Semaine", icon: CalendarDays },
  { key: "month", label: "Mois", icon: CalendarDays },
  { key: "year", label: "Année", icon: CalendarRange },
  { key: "custom", label: "Personnalisé", icon: CalendarRange },
];

const CHART_TITLES = {
  day: "Revenus des 7 derniers jours",
  week: "Revenus de la semaine",
  month: "Revenus journaliers du mois",
  year: "Revenus mensuels",
  custom: "Revenus de la période",
};

const CHART_SUBS = {
  day: "Ventes quotidiennes récentes",
  week: "Du lundi au dimanche",
  month: "Détail jour par jour",
  year: "Aperçu de l'année en cours",
  custom: "Période sélectionnée",
};

export default function Dashboard({ orders, recentOrders, isMobile, isTablet, isPro, onUpgrade }) {
  const [chartType, setChartType] = useState("area");
  const [period, setPeriod] = useState("year");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });

  // Filter orders by selected period
  const filteredOrders = filterOrdersByPeriod(orders, period, customRange);
  const stats = computeStats(filteredOrders);
  const chartData = computeRevenueData(orders, period, customRange);

  // Daily sales (always from full orders, not filtered)
  const dailySales = computeDailySales(orders);
  const dailyCount = countDailyOrders(orders);

  // Recent orders from filtered set
  const filteredRecent = filteredOrders
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <>
      {/* ─── Period Filter ─── */}
      <div
        style={{
          display: "flex",
          alignItems: isMobile ? "stretch" : "center",
          gap: isMobile ? 8 : 12,
          marginBottom: isMobile ? 16 : 24,
          flexDirection: isMobile ? "column" : "row",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 3,
            background: COLORS.surface,
            borderRadius: RADIUS.lg,
            padding: 3,
            border: `1px solid ${COLORS.borderLight}`,
            boxShadow: SHADOWS.xs,
            overflowX: "auto",
            flexShrink: 0,
          }}
        >
          {PERIODS.map((p) => {
            const active = period === p.key;
            return (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                style={{
                  padding: isMobile ? "7px 12px" : "8px 16px",
                  borderRadius: RADIUS.md,
                  fontSize: isMobile ? 12 : 13,
                  fontWeight: active ? 700 : 500,
                  background: active
                    ? `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`
                    : "transparent",
                  color: active ? "#fff" : COLORS.textSecondary,
                  boxShadow: active ? SHADOWS.accent : "none",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Custom date pickers */}
        {period === "custom" && (
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              animation: "fadeInUp 0.2s ease",
            }}
          >
            <input
              type="date"
              value={customRange.start}
              onChange={(e) => setCustomRange((r) => ({ ...r, start: e.target.value }))}
              style={{
                padding: "7px 12px",
                borderRadius: RADIUS.sm,
                border: `1.5px solid ${COLORS.border}`,
                fontSize: 13,
                fontFamily: "inherit",
                color: COLORS.text,
                background: COLORS.surface,
                outline: "none",
              }}
            />
            <span style={{ fontSize: 13, color: COLORS.textMuted, fontWeight: 500 }}>à</span>
            <input
              type="date"
              value={customRange.end}
              onChange={(e) => setCustomRange((r) => ({ ...r, end: e.target.value }))}
              style={{
                padding: "7px 12px",
                borderRadius: RADIUS.sm,
                border: `1.5px solid ${COLORS.border}`,
                fontSize: 13,
                fontFamily: "inherit",
                color: COLORS.text,
                background: COLORS.surface,
                outline: "none",
              }}
            />
          </div>
        )}
      </div>

      {/* ─── KPI Cards ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "1fr 1fr"
            : isTablet
            ? "repeat(3, 1fr)"
            : "repeat(4, 1fr)",
          gap: isMobile ? 10 : 16,
          marginBottom: isMobile ? 20 : 28,
        }}
      >
        {/* Ventes du jour - hero card spanning 2 cols on desktop */}
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
          sub={`${stats.completedCount} terminée${stats.completedCount !== 1 ? "s" : ""}`}
          color={COLORS.successLight}
          accentColor={COLORS.success}
          isMobile={isMobile}
        />
        <StatCard
          icon={<Clock size={18} strokeWidth={2} />}
          label="En cours"
          value={formatCurrency(stats.pendingRevenue)}
          sub="À encaisser"
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
      </div>

      {/* ─── Secondary KPI ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? 10 : 16,
          marginBottom: isMobile ? 20 : 28,
        }}
      >
        <div
          style={{
            background: COLORS.surface,
            borderRadius: 18,
            padding: isMobile ? "16px" : "20px 24px",
            border: `1px solid ${COLORS.borderLight}`,
            boxShadow: SHADOWS.xs,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              background: COLORS.blueLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.blue,
              flexShrink: 0,
            }}
          >
            <BarChart3 size={20} strokeWidth={2} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 600, marginBottom: 2 }}>
              Panier moyen
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, letterSpacing: -0.5 }}>
              {formatCurrency(stats.avgBasket)}
            </div>
          </div>
          <div
            style={{
              fontSize: 11,
              color: COLORS.textPlaceholder,
              fontWeight: 500,
              textAlign: "right",
            }}
          >
            Par commande
          </div>
        </div>

        <div
          style={{
            background: COLORS.surface,
            borderRadius: 18,
            padding: isMobile ? "16px" : "20px 24px",
            border: `1px solid ${COLORS.borderLight}`,
            boxShadow: SHADOWS.xs,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              background: COLORS.dangerLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: COLORS.danger,
              flexShrink: 0,
            }}
          >
            <TrendingUp size={20} strokeWidth={2} style={{ transform: "scaleY(-1)" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 600, marginBottom: 2 }}>
              Annulées
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, letterSpacing: -0.5 }}>
              {stats.cancelledCount || 0}
            </div>
          </div>
          <div
            style={{
              fontSize: 11,
              color: COLORS.textPlaceholder,
              fontWeight: 500,
              textAlign: "right",
            }}
          >
            {formatCurrency(stats.cancelledRevenue || 0)}
          </div>
        </div>
      </div>

      {/* ─── Chart + Recent Orders ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile || isTablet ? "1fr" : "5fr 3fr",
          gap: isMobile ? 12 : 20,
          marginBottom: isMobile ? 12 : 20,
        }}
      >
        <div
          style={{
            background: COLORS.surface,
            borderRadius: 18,
            border: `1px solid ${COLORS.borderLight}`,
            boxShadow: SHADOWS.xs,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Chart header */}
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
                  background: COLORS.successLight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: COLORS.success,
                }}
              >
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
              {/* Period total */}
              <div
                style={{
                  textAlign: "right",
                  paddingRight: isPro ? 10 : 0,
                  borderRight: isPro ? `1px solid ${COLORS.borderLight}` : "none",
                  marginRight: isPro ? 0 : 0,
                }}
              >
                <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 500 }}>Total période</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.success, letterSpacing: -0.5 }}>
                  {formatCurrency(chartData.reduce((s, d) => s + d.value, 0))}
                </div>
              </div>
              {/* Chart type toggle */}
              {isPro && (
                <div
                  style={{
                    display: "flex",
                    gap: 2,
                    background: COLORS.surfaceAlt,
                    borderRadius: 10,
                    padding: 3,
                  }}
                >
                  {[
                    { key: "area", icon: <LineChart size={14} /> },
                    { key: "bar", icon: <BarChart3 size={14} /> },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setChartType(t.key)}
                      title={t.key === "area" ? "Courbe" : "Barres"}
                      style={{
                        padding: "7px 10px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        background: chartType === t.key ? COLORS.surface : "transparent",
                        color: chartType === t.key ? COLORS.accent : COLORS.textMuted,
                        boxShadow: chartType === t.key ? SHADOWS.sm : "none",
                        transition: "all 0.15s ease",
                        display: "flex",
                        alignItems: "center",
                        cursor: "pointer",
                      }}
                    >
                      {t.icon}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chart body */}
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
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
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

      {/* ─── Bottom section: Aging + Status side by side on desktop ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile || isTablet ? "1fr" : "1fr 1fr",
          gap: isMobile ? 12 : 20,
        }}
      >
        {/* Aging Alerts */}
        <AgingAlerts orders={filteredOrders} isMobile={isMobile} />

        {/* Status Breakdown */}
        {isPro ? (
          <StatusBreakdown orders={filteredOrders} isMobile={isMobile} />
        ) : (
          <div
            style={{
              background: COLORS.surface,
              borderRadius: 18,
              border: `1px solid ${COLORS.borderLight}`,
              boxShadow: SHADOWS.xs,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ filter: "blur(6px)", opacity: 0.4, pointerEvents: "none" }}>
              <StatusBreakdown orders={filteredOrders} isMobile={isMobile} />
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UpgradeBanner
                icon={<BarChart3 size={20} />}
                title="Analytics avancés"
                description="Analysez la répartition de vos commandes par statut."
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
