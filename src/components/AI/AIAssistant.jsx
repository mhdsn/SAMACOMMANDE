import { useState, useRef, useEffect } from "react";
import { COLORS, SHADOWS } from "../../constants/theme";
import { sendMessage } from "../../services/ai";
import {
  TrendingUp,
  Users,
  AlertTriangle,
  Lightbulb,
  Target,
  BarChart3,
  Sparkles,
  ArrowUp,
  Plus,
} from "lucide-react";

const STYLE_ID = "ai-assistant-keyframes";
if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes dotPulse {
      0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
      40% { opacity: 1; transform: scale(1.1); }
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

const ERROR_MESSAGES = {
  NO_API_KEY:
    "Clé API manquante. Ajoutez VITE_GEMINI_API_KEY dans votre fichier .env puis redémarrez le serveur.",
  INVALID_API_KEY:
    "Clé API invalide. Vérifiez votre clé Google AI Studio dans .env.",
  BAD_REQUEST:
    "Requête invalide. Vérifiez que votre clé API est correcte et réessayez.",
  RATE_LIMIT:
    "Trop de requêtes. Attendez quelques secondes avant de réessayer.",
  OVERLOADED:
    "L'API est temporairement surchargée. Réessayez dans un instant.",
  NETWORK_ERROR:
    "Impossible de se connecter à l'API. Vérifiez votre connexion internet.",
};

const SUGGESTIONS = [
  { Icon: TrendingUp, label: "Analyse des revenus", prompt: "Analyse mes revenus en détail : tendances, prévisions pour les prochains mois, et recommandations pour augmenter mon chiffre d'affaires." },
  { Icon: Users, label: "Meilleurs clients", prompt: "Qui sont mes meilleurs clients ? Classe-les par valeur totale et fréquence. Quels clients devrais-je relancer ?" },
  { Icon: AlertTriangle, label: "Points d'attention", prompt: "Y a-t-il des problèmes ou risques dans mes commandes ? Retards, commandes en attente trop longtemps, anomalies de prix ?" },
  { Icon: Lightbulb, label: "Conseils business", prompt: "Donne-moi 5 conseils concrets et actionnables pour développer mon activité, basés sur mes données de commandes actuelles." },
  { Icon: Target, label: "Objectifs du mois", prompt: "Propose-moi des objectifs réalistes pour ce mois basés sur ma performance actuelle, avec un plan d'action." },
  { Icon: BarChart3, label: "KPIs clés", prompt: "Calcule et analyse mes KPIs clés : panier moyen, taux de complétion, revenu par client, saisonnalité. Que dois-je améliorer ?" },
];

function MarkdownText({ text }) {
  const html = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, `<code style="background:${COLORS.surfaceAlt};padding:2px 6px;border-radius:5px;font-size:12px;font-family:monospace">$1</code>`)
    .replace(/^### (.*$)/gm, `<h4 style="font-size:14px;font-weight:700;margin:14px 0 6px;color:${COLORS.text}">$1</h4>`)
    .replace(/^## (.*$)/gm, `<h3 style="font-size:15px;font-weight:700;margin:16px 0 8px;color:${COLORS.text}">$1</h3>`)
    .replace(/^- (.*$)/gm, `<div style="padding-left:14px;margin:4px 0;position:relative"><span style="position:absolute;left:0;color:${COLORS.accent}">·</span> $1</div>`)
    .replace(/^\d+\. (.*$)/gm, (match, p1, offset, str) => {
      const lines = str.substring(0, offset).split("\n");
      const num = lines.filter((l) => /^\d+\./.test(l)).length + 1;
      return `<div style="padding-left:18px;margin:4px 0;position:relative"><span style="position:absolute;left:0;font-weight:700;color:${COLORS.accent};font-size:12px">${num}.</span> ${p1}</div>`;
    })
    .replace(/\n{2,}/g, '<div style="height:12px"></div>')
    .replace(/\n/g, "<br/>");

  return (
    <div
      style={{ fontSize: 13.5, lineHeight: 1.7, color: COLORS.textSecondary }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function AssistantAvatar() {
  return (
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: 9,
        background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        flexShrink: 0,
        marginRight: 10,
        marginTop: 2,
      }}
    >
      <Sparkles size={13} />
    </div>
  );
}

export default function AIAssistant({ orders, isMobile }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [streamText, setStreamText] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamText]);

  const handleSend = async (text) => {
    const content = text || input.trim();
    if (!content || loading) return;

    const userMsg = { role: "user", content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError(null);
    setStreamText("");

    try {
      const fullText = await sendMessage(newMessages, orders, (chunk) => setStreamText(chunk));
      setMessages((prev) => [...prev, { role: "assistant", content: fullText }]);
      setStreamText("");
    } catch (err) {
      const key = err.message?.replace(/:.*/s, "");
      setError(
        ERROR_MESSAGES[key] ||
          `Erreur inattendue : ${err.message || "Vérifiez votre clé API et votre connexion internet."}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = messages.length === 0 && !loading;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 160px)" }}>
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 16 }}>
        {isEmpty && (
          <div>
            <div style={{ textAlign: "center", padding: isMobile ? "16px 0 28px" : "24px 0 40px" }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 18px",
                  boxShadow: SHADOWS.accentLg,
                  color: "#fff",
                }}
              >
                <Sparkles size={22} />
              </div>
              <h2 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, marginBottom: 8, letterSpacing: -0.5 }}>
                Comment puis-je vous aider ?
              </h2>
              <p style={{ fontSize: 14, color: COLORS.textMuted, maxWidth: 440, margin: "0 auto", lineHeight: 1.6 }}>
                Posez une question sur vos commandes, revenus ou clients. L'IA analyse vos données en temps réel.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 8,
                maxWidth: 600,
                margin: "0 auto",
              }}
            >
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(s.prompt)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "13px 16px",
                    borderRadius: 14,
                    border: `1.5px solid ${COLORS.borderLight}`,
                    background: COLORS.surface,
                    textAlign: "left",
                    boxShadow: SHADOWS.xs,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = COLORS.accent;
                    e.currentTarget.style.boxShadow = SHADOWS.md;
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = COLORS.borderLight;
                    e.currentTarget.style.boxShadow = SHADOWS.xs;
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <span style={{ flexShrink: 0, width: 28, display: "flex", justifyContent: "center", color: COLORS.accent }}>
                    <s.Icon size={18} strokeWidth={1.8} />
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.textSecondary }}>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              marginBottom: 14,
              animation: "fadeInUp 0.2s ease",
            }}
          >
            {msg.role === "assistant" && <AssistantAvatar />}
            <div
              style={{
                maxWidth: isMobile ? "85%" : "75%",
                padding: msg.role === "user" ? "11px 16px" : "14px 18px",
                borderRadius: msg.role === "user" ? "18px 18px 6px 18px" : "18px 18px 18px 6px",
                background: msg.role === "user"
                  ? `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`
                  : COLORS.surface,
                color: msg.role === "user" ? "#fff" : COLORS.text,
                border: msg.role === "assistant" ? `1px solid ${COLORS.borderLight}` : "none",
                boxShadow: msg.role === "assistant" ? SHADOWS.sm : SHADOWS.accent,
              }}
            >
              {msg.role === "user" ? (
                <div style={{ fontSize: 14, lineHeight: 1.5, fontWeight: 500 }}>{msg.content}</div>
              ) : (
                <MarkdownText text={msg.content} />
              )}
            </div>
          </div>
        ))}

        {loading && streamText && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 14 }}>
            <AssistantAvatar />
            <div
              style={{
                maxWidth: isMobile ? "85%" : "75%",
                padding: "14px 18px",
                borderRadius: "18px 18px 18px 6px",
                background: COLORS.surface,
                border: `1px solid ${COLORS.borderLight}`,
                boxShadow: SHADOWS.sm,
              }}
            >
              <MarkdownText text={streamText} />
            </div>
          </div>
        )}

        {loading && !streamText && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 14 }}>
            <AssistantAvatar />
            <div
              style={{
                padding: "16px 22px",
                borderRadius: "18px 18px 18px 6px",
                background: COLORS.surface,
                border: `1px solid ${COLORS.borderLight}`,
                display: "flex",
                gap: 5,
                alignItems: "center",
                boxShadow: SHADOWS.sm,
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: COLORS.accent,
                    opacity: 0.5,
                    animation: `dotPulse 1.2s ease-in-out ${i * 0.15}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              margin: "12px 0",
              padding: "13px 16px",
              borderRadius: 14,
              background: COLORS.dangerLight,
              border: `1px solid ${COLORS.danger}22`,
              color: COLORS.danger,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {error}
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "flex-end",
          paddingTop: 14,
          borderTop: `1px solid ${COLORS.borderLight}`,
        }}
      >
        {messages.length > 0 && (
          <button
            onClick={() => { setMessages([]); setError(null); }}
            title="Nouvelle conversation"
            style={{
              background: COLORS.surfaceAlt,
              width: 42,
              height: 42,
              borderRadius: 12,
              border: "none",
              color: COLORS.textMuted,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.border)}
            onMouseLeave={(e) => (e.currentTarget.style.background = COLORS.surfaceAlt)}
          >
            <Plus size={18} />
          </button>
        )}
        <div style={{ flex: 1, position: "relative" }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez une question sur vos commandes..."
            rows={1}
            style={{
              width: "100%",
              padding: "12px 48px 12px 16px",
              borderRadius: 14,
              border: `1.5px solid ${COLORS.border}`,
              fontSize: 14,
              outline: "none",
              background: COLORS.surface,
              color: COLORS.text,
              resize: "none",
              fontFamily: "inherit",
              lineHeight: 1.5,
              maxHeight: 100,
              boxShadow: SHADOWS.xs,
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = COLORS.accent;
              e.target.style.boxShadow = `0 0 0 3px ${COLORS.accentSubtle}`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = COLORS.border;
              e.target.style.boxShadow = SHADOWS.xs;
            }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            style={{
              position: "absolute",
              right: 6,
              bottom: 6,
              width: 34,
              height: 34,
              borderRadius: 10,
              border: "none",
              background: loading || !input.trim()
                ? COLORS.surfaceAlt
                : `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
              color: loading || !input.trim() ? COLORS.textPlaceholder : "#fff",
              cursor: loading || !input.trim() ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: loading || !input.trim() ? "none" : SHADOWS.accent,
              transition: "all 0.15s ease",
            }}
          >
            <ArrowUp size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
