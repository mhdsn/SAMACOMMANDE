/**
 * Format a number as XOF currency.
 * Change currency code here to switch globally.
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format an ISO date string to a short French locale date.
 */
export function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Returns today's date formatted as a long French string.
 */
export function formatToday() {
  return new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
