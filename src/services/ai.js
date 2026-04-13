import { formatCurrency, formatDate } from "../utils/format";
import { getOrderTotal, getOrderRef } from "../utils/orders";
import { computeStats, computeMonthlyRevenue } from "../utils/stats";
import { supabase } from "./supabase";

/**
 * Build a structured summary of all order data for the AI context.
 */
export function buildOrderContext(orders) {
  const stats = computeStats(orders);
  const monthly = computeMonthlyRevenue(orders);

  const ordersList = orders
    .map((o) => {
      const total = getOrderTotal(o.items);
      const items = o.items.map((i) => `${i.name} (x${i.qty} @ ${i.price})`).join(", ");
      return `- ${getOrderRef(o.id)} | ${o.client} | ${formatDate(o.date)} | ${o.status} | ${formatCurrency(total)} | Articles: ${items}${o.notes ? ` | Notes: ${o.notes}` : ""}`;
    })
    .join("\n");

  const monthlyStr = monthly
    .filter((m) => m.value > 0)
    .map((m) => `${m.label}: ${formatCurrency(m.value)}`)
    .join(", ");

  return `
=== DONNÉES ACTUELLES DE L'ENTREPRISE ===

STATISTIQUES CLÉS:
- Revenu total (commandes terminées): ${formatCurrency(stats.totalRevenue)}
- Revenu en attente: ${formatCurrency(stats.pendingRevenue)}
- Nombre total de commandes: ${stats.totalCount}
- Commandes terminées: ${stats.completedCount}
- Commandes en attente: ${stats.pendingCount}
- Panier moyen: ${formatCurrency(stats.avgBasket)}

REVENUS MENSUELS: ${monthlyStr || "Aucun revenu enregistré"}

LISTE DES COMMANDES:
${ordersList || "Aucune commande"}
`.trim();
}

const SYSTEM_PROMPT = `Tu es l'assistant IA de SamaCommande, une application de gestion de commandes pour PME et freelances au Sénégal.

RÔLE: Analyste business et conseiller stratégique.

TU PEUX:
- Analyser les tendances de revenus et prédire les prochains mois
- Identifier les meilleurs clients et les opportunités de relance
- Donner des conseils pour augmenter le chiffre d'affaires
- Suggérer des améliorations de processus
- Repérer les anomalies (retards, impayés potentiels)
- Calculer des KPIs métier (taux de conversion, LTV client, etc.)

STYLE:
- Réponds en français, de manière concise et actionnable
- Utilise des chiffres précis tirés des données
- Structure tes réponses avec des listes ou des sections courtes
- Sois proactif : suggère des actions concrètes
- Formate en markdown quand c'est utile (gras, listes, etc.)`;

/**
 * Send a message via Supabase Edge Function (proxies to Anthropic API).
 */
export async function sendMessage(messages, orders, onChunk) {
  const context = buildOrderContext(orders);

  // Build messages with context injected in the last user message
  const apiMessages = messages.map((m, i) => {
    const isLast = i === messages.length - 1;
    return {
      role: m.role,
      content:
        m.role === "user" && isLast
          ? `${m.content}\n\n---\n${context}`
          : m.content,
    };
  });

  // Call the Edge Function — the API key stays server-side
  const { data: { session } } = await supabase.auth.getSession();
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const url = `${supabaseUrl}/functions/v1/ai-chat`;

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        system: SYSTEM_PROMPT,
        messages: apiMessages,
      }),
    });
  } catch {
    throw new Error("NETWORK_ERROR");
  }

  if (!response.ok) {
    let code = `API_ERROR_${response.status}`;
    try {
      const text = await response.text();
      console.error("Edge Function error:", response.status, text);
      const body = JSON.parse(text);
      if (body.error) code = body.error;
      if (body.msg) code = body.msg;
    } catch { /* ignore parse error */ }
    throw new Error(code);
  }

  // Parse Anthropic SSE stream (proxied through Edge Function)
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullText = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (!data || data === "[DONE]") continue;

      try {
        const event = JSON.parse(data);
        if (event.type === "content_block_delta" && event.delta?.text) {
          fullText += event.delta.text;
          onChunk(fullText);
        }
      } catch {
        // skip malformed SSE chunk
      }
    }
  }

  return fullText;
}
