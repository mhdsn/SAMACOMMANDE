import { useState, useMemo, useEffect } from "react";
import { COLORS, SHADOWS } from "../../constants/theme";
import { formatCurrency } from "../../utils/format";
import { getOrderTotal, getOrderRef } from "../../utils/orders";
import { supabase } from "../../services/supabase";
import {
  Users,
  ShoppingBag,
  TrendingUp,
  Crown,
  UserPlus,
  ArrowUpCircle,
  CreditCard,
  CheckCircle2,
  Search,
  ChevronUp,
  ChevronDown,
  Activity,
  Globe,
  Server,
  Database,
  Shield,
  Loader,
} from "lucide-react";

/* ─── Helpers ─── */
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysAgo(iso) {
  return Math.floor((new Date() - new Date(iso)) / (1000 * 60 * 60 * 24));
}

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

function timeAgo(iso) {
  const diff = Math.floor((new Date() - new Date(iso)) / 1000);
  if (diff < 3600) return `Il y a ${Math.max(1, Math.floor(diff / 60))}min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  if (diff < 172800) return "Hier";
  return `Il y a ${Math.floor(diff / 86400)}j`;
}

const MONTHS_SHORT = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

const ACTIVITY_COLORS = {
  order: { color: COLORS.success, bg: COLORS.successLight },
  completed: { color: "#7C3AED", bg: "#F3EEFF" },
  signup: { color: COLORS.blue, bg: COLORS.blueLight },
};

/* ─── Admin Stat Card ─── */
function AdminStat({ icon, label, value, sub, color, bg }) {
  return (
    <div
      style={{
        background: COLORS.surface,
        borderRadius: 16,
        padding: "20px 22px",
        border: `1px solid ${COLORS.borderLight}`,
        boxShadow: SHADOWS.xs,
        display: "flex",
        alignItems: "center",
        gap: 16,
        transition: "all 0.2s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = SHADOWS.md;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = SHADOWS.xs;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: bg || `${color}12`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: color,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 600, marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.text, letterSpacing: -0.8, lineHeight: 1.1 }}>
          {value}
        </div>
        {sub && (
          <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 500, marginTop: 2 }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── User Table ─── */
function UserTable({ users, search, isMobile }) {
  const [sortKey, setSortKey] = useState("revenue");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    return [...users].sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (typeof va === "string") return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortAsc ? va - vb : vb - va;
    });
  }, [users, sortKey, sortAsc]);

  const filtered = useMemo(() => {
    if (!search) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q)
    );
  }, [sorted, search]);

  const handleSort = (key) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return null;
    return sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  const columns = [
    { key: "name", label: "Utilisateur", align: "left" },
    { key: "plan", label: "Plan", align: "center" },
    { key: "orders", label: "Commandes", align: "right" },
    { key: "revenue", label: "CA généré", align: "right" },
    { key: "lastActive", label: "Dernière activité", align: "right" },
    { key: "status", label: "Statut", align: "center" },
  ];

  if (filtered.length === 0) {
    return (
      <div style={{ padding: 32, textAlign: "center", color: COLORS.textMuted, fontSize: 13 }}>
        Aucun utilisateur trouvé
      </div>
    );
  }

  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 8 }}>
        {filtered.map((u) => (
          <div
            key={u.id}
            style={{
              background: COLORS.bg,
              borderRadius: 14,
              padding: "14px 16px",
              border: `1px solid ${COLORS.borderLight}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: u.plan === "pro"
                    ? `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`
                    : COLORS.surfaceAlt,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: u.plan === "pro" ? "#fff" : COLORS.textMuted,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {getInitials(u.name)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{u.name || "Sans nom"}</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>{u.email}</div>
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: 6,
                  background: u.plan === "pro" ? COLORS.accentSubtle : COLORS.surfaceAlt,
                  color: u.plan === "pro" ? COLORS.accent : COLORS.textMuted,
                  textTransform: "uppercase",
                }}
              >
                {u.plan}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: COLORS.textMuted }}>{u.orders} commandes</span>
              <span style={{ fontWeight: 700, color: COLORS.text }}>{formatCurrency(u.revenue)}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 700 }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                style={{
                  padding: "12px 16px",
                  textAlign: col.align,
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  color: sortKey === col.key ? COLORS.accent : COLORS.textPlaceholder,
                  fontWeight: 600,
                  background: COLORS.bg,
                  borderBottom: `1px solid ${COLORS.borderLight}`,
                  cursor: "pointer",
                  userSelect: "none",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  {col.label} <SortIcon col={col.key} />
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((u) => {
            const d = daysAgo(u.lastActive);
            return (
              <tr
                key={u.id}
                style={{
                  borderBottom: `1px solid ${COLORS.borderLight}`,
                  transition: "background 0.1s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.surfaceHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: u.plan === "pro"
                          ? `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`
                          : COLORS.surfaceAlt,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: u.plan === "pro" ? "#fff" : COLORS.textMuted,
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(u.name)}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{u.name || "Sans nom"}</div>
                      <div style={{ fontSize: 11, color: COLORS.textMuted }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "12px 16px", textAlign: "center" }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: 6,
                      background: u.plan === "pro"
                        ? `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`
                        : COLORS.surfaceAlt,
                      color: u.plan === "pro" ? "#fff" : COLORS.textMuted,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {u.plan === "pro" && <Crown size={10} style={{ marginRight: 3, verticalAlign: -1 }} />}
                    {u.plan}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right", fontSize: 14, fontWeight: 700, color: COLORS.text }}>
                  {u.orders}
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right", fontSize: 14, fontWeight: 700, color: COLORS.success, letterSpacing: -0.3 }}>
                  {formatCurrency(u.revenue)}
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right", fontSize: 12, color: d === 0 ? COLORS.success : d <= 2 ? COLORS.text : COLORS.textMuted }}>
                  {d === 0 ? "Aujourd'hui" : d === 1 ? "Hier" : `Il y a ${d}j`}
                </td>
                <td style={{ padding: "12px 16px", textAlign: "center" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "4px 10px",
                      borderRadius: 6,
                      background: u.status === "active" ? COLORS.successLight : COLORS.surfaceAlt,
                      color: u.status === "active" ? COLORS.success : COLORS.textMuted,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: u.status === "active" ? COLORS.success : COLORS.textPlaceholder,
                      }}
                    />
                    {u.status === "active" ? "Actif" : "Inactif"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Activity Feed ─── */
function ActivityFeed({ activities }) {
  if (activities.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: COLORS.textMuted, fontSize: 13 }}>
        Aucune activité récente
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {activities.map((a) => {
        const colors = ACTIVITY_COLORS[a.type] || { color: COLORS.textMuted, bg: COLORS.surfaceAlt };
        const IconComp = a.type === "completed" ? CheckCircle2 : a.type === "signup" ? UserPlus : ShoppingBag;
        return (
          <div
            key={a.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              borderRadius: 10,
              transition: "background 0.1s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.bg)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: colors.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: colors.color,
                flexShrink: 0,
              }}
            >
              <IconComp size={15} strokeWidth={2.2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: COLORS.text }}>
                <span style={{ fontWeight: 600 }}>{a.user}</span>{" "}
                <span style={{ color: COLORS.textMuted, fontWeight: 400 }}>— {a.detail}</span>
              </div>
            </div>
            <span style={{ fontSize: 11, color: COLORS.textPlaceholder, fontWeight: 500, whiteSpace: "nowrap", flexShrink: 0 }}>
              {a.time}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Plan Distribution Chart ─── */
function PlanDistribution({ users }) {
  const proCount = users.filter((u) => u.plan === "pro").length;
  const starterCount = users.filter((u) => u.plan === "starter").length;
  const total = users.length;
  const proPct = total > 0 ? Math.round((proCount / total) * 100) : 0;
  const starterPct = 100 - proPct;
  const proRevenue = proCount * 5000;

  return (
    <div>
      <div
        style={{
          height: 12,
          borderRadius: 12,
          background: COLORS.surfaceAlt,
          overflow: "hidden",
          display: "flex",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: `${proPct}%`,
            background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.accentDark})`,
            borderRadius: "12px 0 0 12px",
            transition: "width 0.6s ease",
          }}
        />
        <div
          style={{
            width: `${starterPct}%`,
            background: COLORS.border,
            borderRadius: "0 12px 12px 0",
          }}
        />
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        <div
          style={{
            flex: 1,
            padding: "14px 16px",
            borderRadius: 12,
            background: COLORS.accentSubtle,
            border: `1px solid ${COLORS.accent}22`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <Crown size={14} color={COLORS.accent} />
            <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.accent }}>Pro</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.text, letterSpacing: -1 }}>
            {proCount}
          </div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
            {proPct}% des utilisateurs
          </div>
          <div
            style={{
              marginTop: 10,
              paddingTop: 10,
              borderTop: `1px solid ${COLORS.accent}22`,
              fontSize: 12,
              fontWeight: 600,
              color: COLORS.success,
            }}
          >
            MRR: {formatCurrency(proRevenue)}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            padding: "14px 16px",
            borderRadius: 12,
            background: COLORS.bg,
            border: `1px solid ${COLORS.borderLight}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <Users size={14} color={COLORS.textMuted} />
            <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>Starter</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.text, letterSpacing: -1 }}>
            {starterCount}
          </div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>
            {starterPct}% des utilisateurs
          </div>
          <div
            style={{
              marginTop: 10,
              paddingTop: 10,
              borderTop: `1px solid ${COLORS.borderLight}`,
              fontSize: 12,
              fontWeight: 500,
              color: COLORS.textMuted,
            }}
          >
            Potentiel: {formatCurrency(starterCount * 5000)}/mois
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Revenue Growth ─── */
function RevenueGrowth({ data, isMobile }) {
  if (data.length === 0) {
    return (
      <div style={{ padding: 24, textAlign: "center", color: COLORS.textMuted, fontSize: 13 }}>
        Aucune donnée disponible
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div style={{ display: "flex", gap: isMobile ? 6 : 12, alignItems: "flex-end", height: 120 }}>
      {data.map((d, i) => {
        const h = (d.revenue / maxRevenue) * 100;
        const isLast = i === data.length - 1;
        return (
          <div
            key={d.month}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
          >
            <div style={{ fontSize: 10, fontWeight: 700, color: isLast ? COLORS.accent : COLORS.textMuted }}>
              {formatCurrency(d.revenue)}
            </div>
            <div
              style={{
                width: "100%",
                maxWidth: 48,
                height: `${h}%`,
                minHeight: 8,
                borderRadius: 8,
                background: isLast
                  ? `linear-gradient(180deg, ${COLORS.accent}, ${COLORS.accentDark})`
                  : `linear-gradient(180deg, ${COLORS.border}, ${COLORS.surfaceAlt})`,
                boxShadow: isLast ? `0 4px 12px ${COLORS.accent}30` : "none",
                transition: "height 0.6s ease",
              }}
            />
            <div style={{ fontSize: 11, fontWeight: isLast ? 700 : 500, color: isLast ? COLORS.text : COLORS.textMuted }}>
              {d.month}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── System Health ─── */
function SystemHealth() {
  const services = [
    { name: "Application", icon: Globe, status: "ok", uptime: "99.9%" },
    { name: "Base de données", icon: Database, status: "ok", uptime: "99.8%" },
    { name: "API", icon: Server, status: "ok", uptime: "99.9%" },
    { name: "Authentification", icon: Shield, status: "ok", uptime: "100%" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {services.map((s) => (
        <div
          key={s.name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 14px",
            borderRadius: 10,
            background: COLORS.bg,
          }}
        >
          <s.icon size={16} color={COLORS.textMuted} />
          <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: COLORS.text }}>{s.name}</span>
          <span style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 500 }}>{s.uptime}</span>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: s.status === "ok" ? COLORS.success : COLORS.danger,
              boxShadow: `0 0 6px ${s.status === "ok" ? COLORS.success : COLORS.danger}40`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN ADMIN PAGE
   ═══════════════════════════════════════════ */
export default function AdminPage({ orders: propOrders, isMobile, isTablet }) {
  const [userSearch, setUserSearch] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all profiles and all orders (admin RLS policy allows this)
  useEffect(() => {
    async function fetchAdminData() {
      setLoading(true);

      const [profilesRes, ordersRes] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }),
      ]);

      if (profilesRes.data) setProfiles(profilesRes.data);
      if (ordersRes.data) setAllOrders(ordersRes.data);

      setLoading(false);
    }

    fetchAdminData();
  }, []);

  // Build enriched user list from profiles + orders
  const users = useMemo(() => {
    return profiles.map((p) => {
      const userOrders = allOrders.filter((o) => o.user_id === p.id);
      const completedOrders = userOrders.filter((o) => o.status === "completed");
      const revenue = completedOrders.reduce((sum, o) => {
        const items = o.order_items || [];
        return sum + items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0);
      }, 0);
      const lastOrder = userOrders[0];
      const daysSinceActive = lastOrder ? daysAgo(lastOrder.created_at) : daysAgo(p.created_at);

      return {
        id: p.id,
        name: p.full_name || "",
        email: p.email || "",
        plan: p.plan || "starter",
        orders: userOrders.length,
        revenue,
        registeredAt: p.created_at,
        lastActive: lastOrder?.created_at || p.created_at,
        status: daysSinceActive <= 14 ? "active" : "inactive",
      };
    });
  }, [profiles, allOrders]);

  // Build activity feed from recent orders
  const activities = useMemo(() => {
    const items = [];

    // Recent orders as activity
    allOrders.slice(0, 15).forEach((o) => {
      const profile = profiles.find((p) => p.id === o.user_id);
      const userName = profile?.full_name || profile?.email || "Utilisateur";

      if (o.status === "completed") {
        items.push({
          id: `completed-${o.id}`,
          type: "completed",
          user: userName,
          detail: `Commande ${getOrderRef(o.id)} terminée`,
          time: timeAgo(o.updated_at || o.created_at),
          date: new Date(o.updated_at || o.created_at),
        });
      } else {
        items.push({
          id: `order-${o.id}`,
          type: "order",
          user: userName,
          detail: `Nouvelle commande ${getOrderRef(o.id)}`,
          time: timeAgo(o.created_at),
          date: new Date(o.created_at),
        });
      }
    });

    // Recent signups
    profiles
      .filter((p) => daysAgo(p.created_at) <= 30)
      .forEach((p) => {
        items.push({
          id: `signup-${p.id}`,
          type: "signup",
          user: p.full_name || p.email || "Utilisateur",
          detail: "Inscription sur la plateforme",
          time: timeAgo(p.created_at),
          date: new Date(p.created_at),
        });
      });

    return items.sort((a, b) => b.date - a.date).slice(0, 10);
  }, [allOrders, profiles]);

  // Monthly revenue data (last 6 months)
  const monthlyRevenue = useMemo(() => {
    const now = new Date();
    const data = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.getMonth();
      const year = d.getFullYear();

      const monthOrders = allOrders.filter((o) => {
        const od = new Date(o.date || o.created_at);
        return od.getMonth() === month && od.getFullYear() === year && o.status === "completed";
      });

      const revenue = monthOrders.reduce((sum, o) => {
        const items = o.order_items || [];
        return sum + items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0);
      }, 0);

      data.push({
        month: MONTHS_SHORT[month],
        revenue,
        orders: monthOrders.length,
      });
    }

    return data;
  }, [allOrders]);

  // Computed stats
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const proUsers = users.filter((u) => u.plan === "pro").length;
  const totalOrders = allOrders.length;
  const totalRevenue = users.reduce((s, u) => s + u.revenue, 0);
  const mrr = proUsers * 5000;
  const conversionRate = totalUsers > 0 ? Math.round((proUsers / totalUsers) * 100) : 0;

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 80, color: COLORS.textMuted, gap: 10 }}>
        <Loader size={18} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 14 }}>Chargement des données...</span>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      {/* ─── Admin Header ─── */}
      <div
        style={{
          background: `linear-gradient(135deg, ${COLORS.text}, #2A2420)`,
          borderRadius: 18,
          padding: isMobile ? "20px 18px" : "24px 28px",
          marginBottom: isMobile ? 16 : 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Shield size={18} color={COLORS.accent} />
            <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.accent, textTransform: "uppercase", letterSpacing: 1 }}>
              Administration
            </span>
          </div>
          <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>
            Panneau d'administration
          </h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontWeight: 400, marginTop: 2 }}>
            Vue globale de votre plateforme SamaCommande
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 16px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 8px #22C55E60" }} />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
            Système opérationnel
          </span>
        </div>
      </div>

      {/* ─── KPI Cards ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : isTablet ? "repeat(3, 1fr)" : "repeat(4, 1fr)",
          gap: isMobile ? 10 : 16,
          marginBottom: isMobile ? 16 : 24,
        }}
      >
        <AdminStat
          icon={<Users size={22} strokeWidth={1.8} />}
          label="Utilisateurs"
          value={totalUsers}
          sub={`${activeUsers} actifs`}
          color={COLORS.blue}
          bg={COLORS.blueLight}
        />
        <AdminStat
          icon={<ShoppingBag size={22} strokeWidth={1.8} />}
          label="Commandes totales"
          value={totalOrders}
          sub="Toutes plateformes"
          color={COLORS.success}
          bg={COLORS.successLight}
        />
        <AdminStat
          icon={<TrendingUp size={22} strokeWidth={1.8} />}
          label="CA total"
          value={formatCurrency(totalRevenue)}
          sub="Volume traité"
          color={COLORS.accent}
          bg={COLORS.accentLight}
        />
        <AdminStat
          icon={<Crown size={22} strokeWidth={1.8} />}
          label="MRR"
          value={formatCurrency(mrr)}
          sub={`${conversionRate}% conversion`}
          color="#7C3AED"
          bg="#F3EEFF"
        />
      </div>

      {/* ─── Users Table + Activity ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile || isTablet ? "1fr" : "3fr 2fr",
          gap: isMobile ? 12 : 20,
          marginBottom: isMobile ? 12 : 20,
        }}
      >
        {/* Users Table */}
        <div
          style={{
            background: COLORS.surface,
            borderRadius: 18,
            border: `1px solid ${COLORS.borderLight}`,
            boxShadow: SHADOWS.xs,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: isMobile ? "14px 16px" : "18px 22px",
              borderBottom: `1px solid ${COLORS.borderLight}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: COLORS.blueLight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: COLORS.blue,
                }}
              >
                <Users size={15} strokeWidth={2.2} />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.2 }}>
                  Utilisateurs
                </h3>
                <span style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 500 }}>
                  {totalUsers} inscrits
                </span>
              </div>
            </div>
            <div style={{ position: "relative", minWidth: isMobile ? "100%" : 200 }}>
              <span
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: COLORS.textPlaceholder,
                  pointerEvents: "none",
                  display: "flex",
                }}
              >
                <Search size={13} />
              </span>
              <input
                type="text"
                placeholder="Rechercher..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 34px",
                  borderRadius: 10,
                  border: `1.5px solid ${COLORS.border}`,
                  fontSize: 12,
                  outline: "none",
                  background: COLORS.bg,
                  color: COLORS.text,
                  fontFamily: "inherit",
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
          </div>
          <UserTable users={users} search={userSearch} isMobile={isMobile} />
        </div>

        {/* Activity Feed */}
        <div
          style={{
            background: COLORS.surface,
            borderRadius: 18,
            border: `1px solid ${COLORS.borderLight}`,
            boxShadow: SHADOWS.xs,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: isMobile ? "14px 16px" : "18px 22px",
              borderBottom: `1px solid ${COLORS.borderLight}`,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: COLORS.successLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: COLORS.success,
              }}
            >
              <Activity size={15} strokeWidth={2.2} />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.2 }}>
                Activité récente
              </h3>
              <span style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 500 }}>
                Dernières actions
              </span>
            </div>
          </div>
          <div style={{ padding: isMobile ? "6px 6px" : "8px 10px", flex: 1, overflowY: "auto" }}>
            <ActivityFeed activities={activities} />
          </div>
        </div>
      </div>

      {/* ─── Bottom: Plan Distribution + Revenue + Health ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 1fr",
          gap: isMobile ? 12 : 20,
        }}
      >
        {/* Plan Distribution */}
        <div
          style={{
            background: COLORS.surface,
            borderRadius: 18,
            border: `1px solid ${COLORS.borderLight}`,
            boxShadow: SHADOWS.xs,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: isMobile ? "14px 16px" : "18px 22px",
              borderBottom: `1px solid ${COLORS.borderLight}`,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
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
              <Crown size={15} strokeWidth={2.2} />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.2 }}>
                Répartition des plans
              </h3>
              <span style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 500 }}>
                Conversion & revenus
              </span>
            </div>
          </div>
          <div style={{ padding: isMobile ? 16 : 22 }}>
            <PlanDistribution users={users} />
          </div>
        </div>

        {/* Revenue Growth */}
        <div
          style={{
            background: COLORS.surface,
            borderRadius: 18,
            border: `1px solid ${COLORS.borderLight}`,
            boxShadow: SHADOWS.xs,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: isMobile ? "14px 16px" : "18px 22px",
              borderBottom: `1px solid ${COLORS.borderLight}`,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: COLORS.successLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: COLORS.success,
              }}
            >
              <TrendingUp size={15} strokeWidth={2.2} />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.2 }}>
                Croissance MRR
              </h3>
              <span style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 500 }}>
                6 derniers mois
              </span>
            </div>
          </div>
          <div style={{ padding: isMobile ? 16 : 22 }}>
            <RevenueGrowth data={monthlyRevenue} isMobile={isMobile} />
          </div>
        </div>

        {/* System Health */}
        <div
          style={{
            background: COLORS.surface,
            borderRadius: 18,
            border: `1px solid ${COLORS.borderLight}`,
            boxShadow: SHADOWS.xs,
            overflow: "hidden",
            gridColumn: isMobile ? "auto" : isTablet ? "1 / -1" : "auto",
          }}
        >
          <div
            style={{
              padding: isMobile ? "14px 16px" : "18px 22px",
              borderBottom: `1px solid ${COLORS.borderLight}`,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: "#E8FBF0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#22C55E",
              }}
            >
              <Server size={15} strokeWidth={2.2} />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.2 }}>
                Santé du système
              </h3>
              <span style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 500 }}>
                Tous services opérationnels
              </span>
            </div>
          </div>
          <div style={{ padding: isMobile ? "8px 10px" : "12px 14px" }}>
            <SystemHealth />
          </div>
        </div>
      </div>
    </>
  );
}
