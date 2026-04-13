import { COLORS, SHADOWS } from "../../constants/theme";
import { PLANS } from "../../constants/plans";
import { formatCurrency } from "../../utils/format";
import { Check, X as XIcon, Crown, Zap, Shield, Smartphone, Sparkles } from "lucide-react";

export default function PricingPage({ currentPlan, onSwitch, isMobile }) {
  const starter = PLANS.starter;
  const pro = PLANS.pro;

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: isMobile ? 28 : 40 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "6px 16px", borderRadius: 20,
          background: COLORS.accentSubtle, color: COLORS.accent,
          fontSize: 12, fontWeight: 700, letterSpacing: 0.3, marginBottom: 16,
        }}>
          <Zap size={13} /> TARIFS
        </div>
        <h2 style={{
          fontSize: isMobile ? 24 : 30, fontWeight: 800,
          letterSpacing: -0.8, marginBottom: 8, color: COLORS.text,
        }}>
          Gratuit pour démarrer, Pro pour grandir
        </h2>
        <p style={{
          fontSize: 14, color: COLORS.textMuted, maxWidth: 420,
          margin: "0 auto", lineHeight: 1.6,
        }}>
          Sans engagement. Annulez à tout moment.
        </p>
      </div>

      {/* Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: isMobile ? 16 : 20,
        marginBottom: isMobile ? 28 : 40,
      }}>
        {/* Starter */}
        <div style={{
          background: COLORS.surface, borderRadius: 20,
          padding: isMobile ? 24 : 28,
          border: `1.5px solid ${currentPlan === "starter" ? COLORS.accent + "33" : COLORS.borderLight}`,
          boxShadow: SHADOWS.sm,
          display: "flex", flexDirection: "column",
        }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>
              {starter.name}
            </h3>
            <p style={{ fontSize: 13, color: COLORS.textMuted }}>{starter.description}</p>
          </div>

          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 34, fontWeight: 800, color: COLORS.text, letterSpacing: -1 }}>
              Gratuit
            </span>
          </div>

          <div style={{ flex: 1, marginBottom: 24 }}>
            {starter.features.map((f, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "7px 0",
              }}>
                <span style={{
                  width: 20, height: 20, borderRadius: 6,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  background: f.included ? COLORS.successLight : COLORS.surfaceAlt,
                  color: f.included ? COLORS.success : COLORS.textPlaceholder,
                }}>
                  {f.included ? <Check size={12} strokeWidth={2.5} /> : <XIcon size={10} />}
                </span>
                <span style={{
                  fontSize: 13, fontWeight: 500,
                  color: f.included ? COLORS.textSecondary : COLORS.textPlaceholder,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  {f.label}
                  {f.isNew && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 7px",
                      borderRadius: 8, background: COLORS.accentSubtle,
                      color: COLORS.accent, letterSpacing: 0.3,
                    }}>
                      NOUVEAU
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>

          {currentPlan === "starter" ? (
            <div style={{
              padding: "12px 24px", borderRadius: 12,
              background: COLORS.surfaceAlt, color: COLORS.textMuted,
              fontSize: 14, fontWeight: 600, textAlign: "center",
              border: `1.5px solid ${COLORS.border}`,
            }}>
              Plan actuel
            </div>
          ) : (
            <button
              onClick={() => onSwitch("starter")}
              style={{
                padding: "12px 24px", borderRadius: 12,
                background: COLORS.surface, color: COLORS.textSecondary,
                fontSize: 14, fontWeight: 600, textAlign: "center",
                cursor: "pointer", border: `1.5px solid ${COLORS.border}`,
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.surfaceAlt; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.surface; }}
            >
              Revenir au gratuit
            </button>
          )}
        </div>

        {/* Pro */}
        <div style={{
          background: COLORS.surface, borderRadius: 20,
          padding: isMobile ? 24 : 28,
          border: `2px solid ${COLORS.accent}`,
          boxShadow: `${SHADOWS.lg}, 0 0 0 1px ${COLORS.accent}15`,
          display: "flex", flexDirection: "column",
          position: "relative",
        }}>
          {/* Badge */}
          <div style={{
            position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
            padding: "5px 18px", borderRadius: 20,
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
            color: "#fff", fontSize: 11, fontWeight: 700,
            letterSpacing: 0.5, boxShadow: SHADOWS.accent, whiteSpace: "nowrap",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <Crown size={12} /> POPULAIRE
          </div>

          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: COLORS.accent, marginBottom: 4 }}>
              {pro.name}
            </h3>
            <p style={{ fontSize: 13, color: COLORS.textMuted }}>{pro.description}</p>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{ fontSize: 34, fontWeight: 800, color: COLORS.text, letterSpacing: -1 }}>
                {formatCurrency(pro.price)}
              </span>
              <span style={{ fontSize: 14, color: COLORS.textMuted, fontWeight: 500 }}>
                / mois
              </span>
            </div>
            <div style={{ fontSize: 12, color: COLORS.success, fontWeight: 600, marginTop: 4 }}>
              ~165 F CFA / jour
            </div>
          </div>

          <div style={{ flex: 1, marginBottom: 24 }}>
            {pro.features.map((f, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: f.highlight ? "8px 10px" : "7px 0",
                ...(f.highlight ? {
                  background: `linear-gradient(135deg, ${COLORS.accentSubtle}, #FFF3E8)`,
                  borderRadius: 10, border: `1.5px solid ${COLORS.accent}22`,
                  marginTop: 2, marginBottom: 2,
                } : {}),
              }}>
                <span style={{
                  width: 20, height: 20, borderRadius: 6,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  background: f.highlight ? COLORS.accent : COLORS.successLight,
                  color: f.highlight ? "#fff" : COLORS.success,
                }}>
                  {f.highlight ? <Sparkles size={12} /> : <Check size={12} strokeWidth={2.5} />}
                </span>
                <span style={{
                  fontSize: 13, fontWeight: f.highlight ? 700 : 500,
                  color: f.highlight ? COLORS.accent : COLORS.textSecondary,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  {f.label}
                  {f.highlight && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 7px",
                      borderRadius: 8, background: COLORS.accent,
                      color: "#fff", letterSpacing: 0.3,
                    }}>
                      NOUVEAU
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>

          {currentPlan === "pro" ? (
            <div style={{
              padding: "12px 24px", borderRadius: 12,
              background: COLORS.accentSubtle, color: COLORS.accent,
              fontSize: 14, fontWeight: 600, textAlign: "center",
              border: `1.5px solid ${COLORS.accent}33`,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <Crown size={14} /> Plan actuel
            </div>
          ) : (
            <button
              onClick={() => onSwitch("pro")}
              style={{
                padding: "13px 24px", borderRadius: 12,
                background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
                color: "#fff", fontSize: 14, fontWeight: 700,
                textAlign: "center", cursor: "pointer", border: "none",
                boxShadow: SHADOWS.accent, transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = SHADOWS.accentLg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = SHADOWS.accent;
              }}
            >
              Passer à Pro
            </button>
          )}
        </div>
      </div>

      {/* Trust bar */}
      <div style={{
        display: "flex", justifyContent: "center", gap: isMobile ? 16 : 36,
        flexWrap: "wrap", padding: "16px 0",
      }}>
        {[
          { Icon: Shield, text: "Paiement sécurisé" },
          { Icon: Smartphone, text: "Wave / Orange Money" },
          { Icon: Zap, text: "Sans engagement" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <item.Icon size={16} strokeWidth={1.8} style={{ color: COLORS.accent }} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.textMuted }}>
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
