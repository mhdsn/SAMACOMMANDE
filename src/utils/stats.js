import { MONTHS_FR } from "../constants/status";
import { getOrderTotal } from "./orders";

/**
 * Compute all dashboard KPIs from a list of orders.
 */
export function computeStats(orders) {
  const completed = orders.filter((o) => o.status === "completed");
  const pending = orders.filter(
    (o) => o.status === "pending" || o.status === "confirmed"
  );
  const cancelled = orders.filter((o) => o.status === "cancelled");

  const totalRevenue = completed.reduce(
    (sum, o) => sum + getOrderTotal(o.items),
    0
  );
  const pendingRevenue = pending.reduce(
    (sum, o) => sum + getOrderTotal(o.items),
    0
  );
  const cancelledRevenue = cancelled.reduce(
    (sum, o) => sum + getOrderTotal(o.items),
    0
  );
  const completedCount = completed.length;
  const cancelledCount = cancelled.length;
  const avgBasket = completedCount > 0 ? totalRevenue / completedCount : 0;
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return {
    totalRevenue,
    pendingRevenue,
    cancelledRevenue,
    completedCount,
    cancelledCount,
    avgBasket,
    pendingCount,
    totalCount: orders.length,
  };
}

/**
 * Build monthly revenue data for the chart.
 */
export function computeMonthlyRevenue(orders) {
  return MONTHS_FR.map((label, idx) => {
    const value = orders
      .filter(
        (o) =>
          o.status === "completed" && new Date(o.date).getMonth() === idx
      )
      .reduce((sum, o) => sum + getOrderTotal(o.items), 0);
    return { label, value };
  });
}

// ─── Period filtering ───

const DAYS_FR_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getMondayOfWeek(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d;
}

/**
 * Filter orders by a given period.
 */
export function filterOrdersByPeriod(orders, period, customRange) {
  const now = new Date();
  let start, end;

  switch (period) {
    case "day": {
      const today = toDateStr(now);
      return orders.filter((o) => o.date && o.date.startsWith(today));
    }
    case "week": {
      start = getMondayOfWeek(now);
      end = new Date(start);
      end.setDate(end.getDate() + 7);
      break;
    }
    case "month": {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      break;
    }
    case "year": {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear() + 1, 0, 1);
      break;
    }
    case "custom": {
      if (!customRange?.start || !customRange?.end) return orders;
      start = new Date(customRange.start);
      end = new Date(customRange.end);
      end.setDate(end.getDate() + 1); // inclusive end
      break;
    }
    default:
      return orders;
  }

  return orders.filter((o) => {
    const d = new Date(o.date);
    return d >= start && d < end;
  });
}

/**
 * Build chart revenue data adapted to the selected period granularity.
 */
export function computeRevenueData(orders, period, customRange) {
  const now = new Date();

  switch (period) {
    case "day": {
      // Show the last 7 days
      const data = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const ds = toDateStr(d);
        const isToday = i === 0;
        const value = orders
          .filter((o) => o.status === "completed" && o.date && o.date.startsWith(ds))
          .reduce((sum, o) => sum + getOrderTotal(o.items), 0);
        data.push({
          label: isToday ? "Auj." : `${d.getDate()}/${d.getMonth() + 1}`,
          value,
        });
      }
      return data;
    }

    case "week": {
      const monday = getMondayOfWeek(now);
      return DAYS_FR_SHORT.map((label, i) => {
        const d = new Date(monday);
        d.setDate(d.getDate() + i);
        const ds = toDateStr(d);
        const value = orders
          .filter((o) => o.status === "completed" && o.date && o.date.startsWith(ds))
          .reduce((sum, o) => sum + getOrderTotal(o.items), 0);
        return { label, value };
      });
    }

    case "month": {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const ds = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const value = orders
          .filter((o) => o.status === "completed" && o.date && o.date.startsWith(ds))
          .reduce((sum, o) => sum + getOrderTotal(o.items), 0);
        return { label: String(day), value };
      });
    }

    case "year":
      return computeMonthlyRevenue(orders);

    case "custom": {
      if (!customRange?.start || !customRange?.end) return computeMonthlyRevenue(orders);
      const start = new Date(customRange.start);
      const end = new Date(customRange.end);
      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      if (diffDays <= 45) {
        // Daily granularity
        return Array.from({ length: diffDays }, (_, i) => {
          const d = new Date(start);
          d.setDate(d.getDate() + i);
          const ds = toDateStr(d);
          const value = orders
            .filter((o) => o.status === "completed" && o.date && o.date.startsWith(ds))
            .reduce((sum, o) => sum + getOrderTotal(o.items), 0);
          return { label: `${d.getDate()}/${d.getMonth() + 1}`, value };
        });
      } else {
        // Monthly granularity
        const months = [];
        const current = new Date(start.getFullYear(), start.getMonth(), 1);
        const endMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0);
        while (current <= endMonth) {
          const y = current.getFullYear();
          const m = current.getMonth();
          const value = orders
            .filter((o) => {
              const d = new Date(o.date);
              return o.status === "completed" && d.getFullYear() === y && d.getMonth() === m;
            })
            .reduce((sum, o) => sum + getOrderTotal(o.items), 0);
          const label = y === now.getFullYear() ? MONTHS_FR[m] : `${MONTHS_FR[m]} ${y}`;
          months.push({ label, value });
          current.setMonth(current.getMonth() + 1);
        }
        return months;
      }
    }

    default:
      return computeMonthlyRevenue(orders);
  }
}

/**
 * Compute today's completed sales total (from all orders, not filtered).
 */
export function computeDailySales(orders) {
  const today = toDateStr(new Date());
  return orders
    .filter((o) => o.status === "completed" && o.date && o.date.startsWith(today))
    .reduce((sum, o) => sum + getOrderTotal(o.items), 0);
}

/**
 * Count today's total orders.
 */
export function countDailyOrders(orders) {
  const today = toDateStr(new Date());
  return orders.filter((o) => o.date && o.date.startsWith(today)).length;
}
