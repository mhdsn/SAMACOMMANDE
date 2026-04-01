import { formatCurrency, formatDate } from "../utils/format";
import { getOrderTotal, getOrderRef } from "../utils/orders";
import { computeStats, computeMonthlyRevenue } from "../utils/stats";

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
 * Send a message to Gemini API with order context and streaming.
 */
export async function sendMessage(messages, orders, onChunk) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("NO_API_KEY");
  }

  const context = buildOrderContext(orders);

  // Build Gemini conversation format
  const contents = [];
  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    const isLast = i === messages.length - 1;
    contents.push({
      role: m.role === "assistant" ? "model" : "user",
      parts: [
        {
          text:
            m.role === "user" && isLast
              ? `${m.content}\n\n---\n${context}`
              : m.content,
        },
      ],
    });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }],
        },
        contents,
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
        },
      }),
    });
  } catch {
    throw new Error("NETWORK_ERROR");
  }

  if (!response.ok) {
    const status = response.status;
    if (status === 400) throw new Error("BAD_REQUEST");
    if (status === 401 || status === 403) throw new Error("INVALID_API_KEY");
    if (status === 429) throw new Error("RATE_LIMIT");
    if (status === 500 || status === 503) throw new Error("OVERLOADED");
    throw new Error(`API_ERROR`);
  }

  // Parse Gemini SSE stream
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
        const parts = event.candidates?.[0]?.content?.parts;
        if (parts) {
          for (const part of parts) {
            if (part.text) {
              fullText += part.text;
            }
          }
          onChunk(fullText);
        }
      } catch {
        // skip malformed SSE chunk
      }
    }
  }

  return fullText;
}
