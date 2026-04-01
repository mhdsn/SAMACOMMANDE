export const PAYMENT_METHODS = {
  wave: "Wave",
  orange_money: "Orange Money",
  especes: "Espèces",
  virement: "Virement bancaire",
};

/**
 * Compute the total price of an order's line items.
 */
export function getOrderTotal(items) {
  return items.reduce((sum, item) => sum + (Number(item.qty) || 0) * (Number(item.price) || 0), 0);
}

/**
 * Generate a padded order reference string: #0001, #0012, etc.
 */
export function getOrderRef(id) {
  return `#${String(id).padStart(4, "0")}`;
}

/**
 * Return a new blank order template.
 */
export function createBlankOrder() {
  return {
    client: "",
    phone: "",
    email: "",
    payment: "",
    items: [{ name: "", qty: 1, price: "" }],
    notes: "",
  };
}
