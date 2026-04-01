import { getOrderTotal, getOrderRef, PAYMENT_METHODS } from "./orders";
import { ORDER_STATUS } from "../constants/status";

function fmtDate(iso) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function fmtNum(n) {
  return new Intl.NumberFormat("fr-FR").format(n);
}

function buildArticlesCell(items) {
  return items
    .map((i) => `${i.name} (x${i.qty}) — ${fmtNum(i.qty * i.price)} F`)
    .join("\n");
}

/**
 * Export orders to a professional CSV (semicolon-separated, Excel FR compatible).
 * One row per order, articles detailed in a multi-line cell.
 */
export function exportOrdersCSV(orders) {
  const SEP = ";";
  const sorted = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));

  const lines = [];

  // ── Header
  lines.push([
    "N°",
    "Date",
    "Client",
    "Téléphone",
    "Email",
    "Statut",
    "Paiement",
    "Détail articles",
    "Nb articles",
    "Total (F CFA)",
    "Notes",
  ]);

  // ── Data rows
  for (const o of sorted) {
    lines.push([
      getOrderRef(o.id),
      fmtDate(o.date),
      o.client,
      `'${o.phone}`,                                   // prefix ' keeps leading zeros in Excel
      o.email || "",
      ORDER_STATUS[o.status]?.label || o.status,
      PAYMENT_METHODS[o.payment] || o.payment || "",
      buildArticlesCell(o.items),
      o.items.length,
      getOrderTotal(o.items),
      o.notes || "",
    ]);
  }

  // ── Blank separator
  lines.push([]);

  // ── Summary block
  const completed = sorted.filter((o) => o.status === "completed");
  const pending   = sorted.filter((o) => o.status === "pending" || o.status === "confirmed");
  const cancelled = sorted.filter((o) => o.status === "cancelled");

  const sumCompleted = completed.reduce((s, o) => s + getOrderTotal(o.items), 0);
  const sumPending   = pending.reduce((s, o) => s + getOrderTotal(o.items), 0);
  const sumCancelled = cancelled.reduce((s, o) => s + getOrderTotal(o.items), 0);
  const sumAll       = sorted.reduce((s, o) => s + getOrderTotal(o.items), 0);

  lines.push(["", "", "", "", "", "", "", "RÉCAPITULATIF",                  "",                           ""]);
  lines.push(["", "", "", "", "", "", "", "Commandes exportées",            sorted.length,                ""]);
  lines.push(["", "", "", "", "", "", "", "Terminées",                      completed.length,             sumCompleted]);
  lines.push(["", "", "", "", "", "", "", "En attente / Confirmées",        pending.length,               sumPending]);
  lines.push(["", "", "", "", "", "", "", "Annulées",                       cancelled.length,             sumCancelled]);
  lines.push([]);
  lines.push(["", "", "", "", "", "", "", "TOTAL GÉNÉRAL (F CFA)",          "",                           sumAll]);

  // ── Export date
  const now = new Date();
  lines.push([]);
  lines.push(["", "", "", "", "", "", "", `Exporté le ${fmtDate(now.toISOString())} à ${String(now.getHours()).padStart(2, "0")}h${String(now.getMinutes()).padStart(2, "0")}`, "", ""]);
  lines.push(["", "", "", "", "", "", "", "SamaCommande — samacommande.app", "", ""]);

  // ── Encode
  const esc = (val) => {
    if (val === undefined || val === null) return "";
    const str = String(val);
    if (str.includes(SEP) || str.includes('"') || str.includes("\n") || str.includes("'")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csv =
    "\uFEFF" +
    lines.map((row) => (row.length ? row.map(esc).join(SEP) : "")).join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `samacommande_commandes_${now.toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
