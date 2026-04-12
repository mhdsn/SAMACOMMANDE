import { formatCurrency, formatDate } from "../../utils/format";
import { getOrderTotal, getOrderRef, PAYMENT_METHODS } from "../../utils/orders";

/**
 * Open a formatted, printable invoice in a new browser tab.
 * Uses settings from useSettings hook for company info, logo, colors.
 */
export default function generateInvoice(order, settings, isPro = false) {
  const total = getOrderTotal(order.items);
  const ref = getOrderRef(order.id);
  const w = window.open("", "_blank", "width=800,height=900");

  // Merge settings with defaults
  const company = settings?.company || {};
  const invoice = settings?.invoice || {};
  const accent = invoice.accentColor || "#D4622B";
  const companyName = company.name || "SamaCommande";
  const companyAddress = company.address || "Dakar, Sénégal";
  const companyNinea = company.ninea || "";
  const companyPhone = company.phone || "";
  const companyEmail = company.email || "";
  const logo = invoice.logo || "";
  const footerText = invoice.footerText || "Merci pour votre confiance";
  const paymentTerms = invoice.paymentTerms || "";

  const itemsHtml = order.items
    .map(
      (i) =>
        `<tr>
      <td>${i.name}</td>
      <td>${i.qty}</td>
      <td>${formatCurrency(i.price)}</td>
      <td>${formatCurrency(i.qty * i.price)}</td>
    </tr>`
    )
    .join("");

  const notesHtml = order.notes
    ? `<div class="notes"><strong>Notes :</strong> ${order.notes}</div>`
    : "";

  const logoHtml = logo
    ? `<img src="${logo}" alt="Logo" style="max-height:52px;max-width:160px;object-fit:contain;border-radius:6px" />`
    : `<div style="width:44px;height:44px;border-radius:10px;background:${accent};display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;font-weight:800">${companyName[0].toUpperCase()}</div>`;

  const companyInfoParts = [companyAddress];
  if (companyNinea) companyInfoParts.push(`NINEA ${companyNinea}`);
  if (companyPhone) companyInfoParts.push(companyPhone);
  if (companyEmail) companyInfoParts.push(companyEmail);
  const companyInfoHtml = companyInfoParts.join(" · ");

  w.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <title>Facture ${ref}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'DM Sans',sans-serif; color:#1A1612; padding:48px; background:#fff; }
    .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:48px; padding-bottom:24px; border-bottom:2px solid ${accent}; }
    .logo-area { display:flex; align-items:center; gap:14px; }
    .company-name { font-size:22px; font-weight:700; color:${accent}; letter-spacing:-0.5px; }
    .invoice-info { text-align:right; font-size:13px; color:#8C8279; }
    .invoice-info .num { font-size:20px; font-weight:700; color:#1A1612; margin-bottom:4px; }
    .section { margin-bottom:32px; }
    .section-title { font-size:11px; text-transform:uppercase; letter-spacing:1.5px; color:#8C8279; margin-bottom:8px; font-weight:500; }
    .client-name { font-size:18px; font-weight:700; margin-bottom:4px; }
    table { width:100%; border-collapse:collapse; margin-top:8px; }
    th { text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#8C8279; padding:10px 12px; border-bottom:1.5px solid #E8E2D9; font-weight:500; }
    th:last-child { text-align:right; }
    td { padding:14px 12px; border-bottom:1px solid #F3F0EB; font-size:14px; }
    td:last-child { text-align:right; font-weight:500; }
    .total-row { display:flex; justify-content:flex-end; margin-top:16px; }
    .total-box { background:#FAF8F5; padding:16px 28px; border-radius:8px; text-align:right; }
    .total-label { font-size:12px; color:#8C8279; text-transform:uppercase; letter-spacing:1px; }
    .total-amount { font-size:28px; font-weight:700; color:${accent}; margin-top:4px; }
    .footer { margin-top:64px; padding-top:20px; border-top:1px solid #E8E2D9; font-size:12px; color:#8C8279; text-align:center; }
    .notes { background:#FFF8E8; padding:14px 18px; border-radius:8px; font-size:13px; color:#8C8279; margin-top:24px; border-left:3px solid #C68B1E; }
    .print-btn { background:${accent}; color:#fff; border:none; padding:12px 32px; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; font-family:inherit; }
    .watermark { margin-top:32px; padding:12px 0; text-align:center; font-size:11px; color:#B5ADA5; letter-spacing:0.3px; }
    .watermark a { color:#B5ADA5; text-decoration:none; font-weight:600; }
    @media print { .no-print { display:none!important; } }
  </style>
</head>
<body>

<div class="header">
  <div>
    <div class="logo-area">
      ${logoHtml}
      <div>
        <div class="company-name">${companyName}</div>
        <div style="font-size:12px;color:#8C8279;margin-top:2px">${companyInfoHtml}</div>
      </div>
    </div>
  </div>
  <div class="invoice-info">
    <div class="num">FACTURE ${ref}</div>
    <div>Date : ${formatDate(order.date)}</div>
    ${paymentTerms ? `<div>Échéance : ${paymentTerms}</div>` : ""}
  </div>
</div>

<div class="section">
  <div class="section-title">Facturé à</div>
  <div class="client-name">${order.client}</div>
  <div style="font-size:13px;color:#8C8279">${order.phone}</div>
  ${order.email ? `<div style="font-size:13px;color:#8C8279">${order.email}</div>` : ""}
  ${order.address ? `<div style="font-size:13px;color:#8C8279;margin-top:6px"><strong>Adresse de livraison :</strong> ${order.address}</div>` : ""}
  ${order.payment ? `<div style="font-size:13px;color:#8C8279;margin-top:6px"><strong>Paiement :</strong> ${PAYMENT_METHODS[order.payment] || order.payment}</div>` : ""}
</div>

<div class="section">
  <div class="section-title">Détail de la commande</div>
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Qté</th>
        <th>Prix unit.</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
  </table>
  <div class="total-row">
    <div class="total-box">
      <div class="total-label">Total TTC</div>
      <div class="total-amount">${formatCurrency(total)}</div>
    </div>
  </div>
</div>

${notesHtml}

<div class="footer">
  ${footerText}
</div>

${!isPro ? `<div class="watermark">Facture générée par <a href="#">SamaCommande</a></div>` : ""}

<div class="no-print" style="text-align:center;margin-top:24px">
  <button class="print-btn" onclick="window.print()">Imprimer / Télécharger PDF</button>
</div>

</body>
</html>`);

  w.document.close();
}
