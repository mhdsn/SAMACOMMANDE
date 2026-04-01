import { formatCurrency } from "./format";
import { getOrderTotal, getOrderRef, PAYMENT_METHODS } from "./orders";

/**
 * Normalize a Senegalese phone number to +221XXXXXXXXX format for wa.me links.
 */
export function normalizePhone(phone) {
  const digits = phone.replace(/[\s\-\.\(\)]/g, "");
  if (digits.startsWith("+221")) return digits;
  if (digits.startsWith("221") && digits.length === 12) return "+" + digits;
  if (digits.startsWith("00221")) return "+" + digits.slice(2);
  // Local 9-digit number (7X XXX XX XX)
  if (/^[7]\d{8}$/.test(digits)) return "+221" + digits;
  // Fallback: return as-is with +
  return digits.startsWith("+") ? digits : "+" + digits;
}

/**
 * Build a WhatsApp order confirmation message.
 */
export function buildOrderMessage(order, companyName) {
  const ref = getOrderRef(order.id);
  const total = getOrderTotal(order.items);
  const itemsList = order.items
    .map((i) => `  • ${i.name} x${i.qty} — ${formatCurrency(i.qty * i.price)}`)
    .join("\n");
  const payment = PAYMENT_METHODS[order.payment] || order.payment || "";

  let msg = `Bonjour ${order.client},\n\n`;
  msg += `Votre commande *${ref}* a bien été enregistrée.\n\n`;
  msg += `📋 *Détail :*\n${itemsList}\n\n`;
  msg += `💰 *Total :* ${formatCurrency(total)}\n`;
  if (payment) msg += `💳 *Paiement :* ${payment}\n`;
  msg += `\nMerci pour votre confiance !\n${companyName || "SamaCommande"}`;
  return msg;
}

/**
 * Build a WhatsApp payment reminder message.
 */
export function buildReminderMessage(order, companyName) {
  const ref = getOrderRef(order.id);
  const total = getOrderTotal(order.items);

  let msg = `Bonjour ${order.client},\n\n`;
  msg += `Ceci est un rappel concernant votre commande *${ref}*.\n\n`;
  msg += `💰 *Montant :* ${formatCurrency(total)}\n`;
  msg += `\nN'hésitez pas à nous contacter pour toute question.\n${companyName || "SamaCommande"}`;
  return msg;
}

/**
 * Open WhatsApp with a pre-filled message for an order.
 */
export function sendWhatsApp(order, companyName, type = "confirmation") {
  const phone = normalizePhone(order.phone);
  const msg =
    type === "reminder"
      ? buildReminderMessage(order, companyName)
      : buildOrderMessage(order, companyName);
  const url = `https://wa.me/${phone.replace("+", "")}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}
