import { useRef, useState } from "react";
import { COLORS, SHADOWS } from "../../constants/theme";
import { UpgradeBanner } from "../UI";
import {
  Building2, FileText, Palette, AlertTriangle,
  Upload, Trash2, Save, X, Check, Loader2,
  Phone, Mail, MapPin, Hash, Eye,
} from "lucide-react";

const ACCENT_PRESETS = [
  { color: "#D4622B", label: "Orange" },
  { color: "#2563EB", label: "Bleu" },
  { color: "#1B7D46", label: "Vert" },
  { color: "#7C3AED", label: "Violet" },
  { color: "#DC2626", label: "Rouge" },
  { color: "#0891B2", label: "Cyan" },
  { color: "#C026D3", label: "Magenta" },
  { color: "#1A1612", label: "Noir" },
];

function isValidHex(hex) {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
}

function normalizeHex(raw) {
  let v = raw.replace(/[^0-9A-Fa-f#]/g, "");
  if (!v.startsWith("#")) v = "#" + v;
  return v.slice(0, 7);
}

// ─── Styled Input ───
function StyledInput({ value, onChange, placeholder, type = "text", icon: Icon, ...rest }) {
  return (
    <div style={{ position: "relative" }}>
      {Icon && (
        <span style={{
          position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
          color: COLORS.textPlaceholder, display: "flex", pointerEvents: "none",
        }}>
          <Icon size={15} />
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: Icon ? "12px 14px 12px 40px" : "12px 14px",
          borderRadius: 12,
          border: `1.5px solid ${COLORS.border}`,
          fontSize: 14,
          outline: "none",
          background: COLORS.surface,
          color: COLORS.text,
          fontFamily: "inherit",
          transition: "border-color 0.2s, box-shadow 0.2s",
          boxSizing: "border-box",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = COLORS.accent;
          e.target.style.boxShadow = `0 0 0 3px ${COLORS.accentSubtle}`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = COLORS.border;
          e.target.style.boxShadow = "none";
        }}
        {...rest}
      />
    </div>
  );
}

// ─── Color Code Input ───
function ColorCodeInput({ value, onChange, label }) {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const valid = isValidHex(localValue);

  const handleChange = (e) => {
    const normalized = normalizeHex(e.target.value);
    setLocalValue(normalized);
    if (isValidHex(normalized)) onChange(normalized);
  };

  const handleFocus = () => { setEditing(true); setLocalValue(value); };
  const handleBlur = () => {
    setEditing(false);
    if (!isValidHex(localValue)) setLocalValue(value);
  };

  const displayValue = editing ? localValue : value;

  return (
    <div style={{ marginTop: 10 }}>
      {label && (
        <div style={{ fontSize: 11.5, fontWeight: 600, color: COLORS.textMuted, marginBottom: 6 }}>
          {label}
        </div>
      )}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "6px 10px", borderRadius: 12,
        border: `1.5px solid ${COLORS.border}`,
        background: COLORS.surface, maxWidth: 220,
        transition: "border-color 0.2s",
      }}>
        <label style={{ display: "flex", cursor: "pointer", flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: valid ? displayValue : value,
            border: `2px solid ${COLORS.borderLight}`,
            transition: "background 0.15s ease",
            position: "relative", overflow: "hidden",
          }}>
            <input
              type="color"
              value={valid ? displayValue : value}
              onChange={(e) => { setLocalValue(e.target.value); onChange(e.target.value); }}
              style={{
                position: "absolute", inset: -8,
                width: "calc(100% + 16px)", height: "calc(100% + 16px)",
                border: "none", padding: 0, cursor: "pointer", opacity: 0,
              }}
            />
          </div>
        </label>
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          maxLength={7}
          placeholder="#000000"
          style={{
            flex: 1, padding: "6px 0", border: "none", outline: "none",
            fontSize: 14, fontWeight: 600,
            fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
            letterSpacing: 0.5, background: "transparent",
            color: valid ? COLORS.text : COLORS.danger,
            textTransform: "uppercase", minWidth: 0,
          }}
        />
        {editing && (
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: valid ? COLORS.success : COLORS.danger,
            flexShrink: 0, transition: "background 0.15s ease",
          }} />
        )}
      </div>
      {editing && !valid && localValue.length > 1 && (
        <div style={{ fontSize: 11, color: COLORS.danger, marginTop: 4, fontWeight: 500 }}>
          Format : #RGB ou #RRGGBB
        </div>
      )}
    </div>
  );
}

// ─── Section Card ───
function SectionCard({ title, subtitle, icon, children, isMobile, danger }) {
  const accentColor = danger ? COLORS.danger : COLORS.accent;
  return (
    <div style={{
      background: COLORS.surface,
      borderRadius: 20,
      border: `1px solid ${danger ? COLORS.danger + "20" : COLORS.borderLight}`,
      boxShadow: SHADOWS.sm,
      marginBottom: isMobile ? 16 : 22,
      overflow: "hidden",
      transition: "box-shadow 0.2s",
    }}>
      <div style={{
        padding: isMobile ? "18px 20px" : "22px 28px",
        borderBottom: `1px solid ${COLORS.borderLight}`,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: danger ? COLORS.dangerLight : COLORS.accentSubtle,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: accentColor, flexShrink: 0,
        }}>
          {icon}
        </div>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.3, margin: 0 }}>{title}</h3>
          {subtitle && (
            <p style={{ fontSize: 12, color: COLORS.textMuted, margin: "2px 0 0" }}>{subtitle}</p>
          )}
        </div>
      </div>
      <div style={{ padding: isMobile ? "20px 20px" : "24px 28px" }}>{children}</div>
    </div>
  );
}

// ─── Field Row ───
function FieldRow({ label, sub, children, isMobile }) {
  return (
    <div style={{
      display: isMobile ? "block" : "flex",
      alignItems: "flex-start", gap: 24,
      marginBottom: 22,
    }}>
      <div style={{ minWidth: isMobile ? "auto" : 170, marginBottom: isMobile ? 8 : 0, paddingTop: isMobile ? 0 : 8 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.text }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

// ─── Pro Locked Overlay ───
function ProLockedOverlay({ children, isPro, onUpgrade, title, description, icon }) {
  if (isPro) return children;
  return (
    <div style={{ position: "relative" }}>
      <div style={{ filter: "blur(4px)", opacity: 0.4, pointerEvents: "none" }}>{children}</div>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
      }}>
        <UpgradeBanner icon={icon} title={title} description={description} onUpgrade={onUpgrade} compact />
      </div>
    </div>
  );
}

// ─── Toast ───
function SavedToast({ visible }) {
  if (!visible) return null;
  return (
    <div style={{
      position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
      padding: "12px 24px", borderRadius: 14,
      background: COLORS.success, color: "#fff",
      fontSize: 14, fontWeight: 600,
      boxShadow: SHADOWS.lg, zIndex: 1000,
      animation: "fadeInUp 0.25s ease",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <Check size={16} strokeWidth={2.5} />
      Parametres sauvegardes
    </div>
  );
}

// ─── Main ───
export default function SettingsPage({
  draft,
  hasChanges,
  saving,
  errorMsg,
  onUpdate,
  onSave,
  onDiscard,
  onReset,
  isPro,
  onUpgrade,
  isMobile,
}) {
  const logoInputRef = useRef(null);
  const [showToast, setShowToast] = useState(false);

  const handleSave = async () => {
    const success = await onSave();
    if (success) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      alert("Le logo doit faire moins de 500 Ko");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => onUpdate("invoice", { logo: ev.target.result });
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    onUpdate("invoice", { logo: "" });
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  return (
    <div style={{ maxWidth: 740, margin: "0 auto", paddingBottom: hasChanges ? 90 : 20 }}>
      <SavedToast visible={showToast} />

      {/* ═══ Entreprise ═══ */}
      <SectionCard
        title="Entreprise"
        subtitle="Informations affichees sur vos factures"
        icon={<Building2 size={18} />}
        isMobile={isMobile}
      >
        <FieldRow label="Nom" sub="Raison sociale" isMobile={isMobile}>
          <StyledInput
            value={draft.company.name}
            onChange={(e) => onUpdate("company", { name: e.target.value })}
            placeholder="Ex: Diallo Services"
            icon={Building2}
          />
        </FieldRow>
        <FieldRow label="Adresse" isMobile={isMobile}>
          <StyledInput
            value={draft.company.address}
            onChange={(e) => onUpdate("company", { address: e.target.value })}
            placeholder="Ex: Medina, Dakar, Senegal"
            icon={MapPin}
          />
        </FieldRow>
        <FieldRow label="NINEA" sub="Numero d'identification" isMobile={isMobile}>
          <StyledInput
            value={draft.company.ninea}
            onChange={(e) => onUpdate("company", { ninea: e.target.value })}
            placeholder="Ex: 005 234 567 2G3"
            icon={Hash}
          />
        </FieldRow>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.text, marginBottom: 8 }}>Telephone</div>
            <StyledInput
              value={draft.company.phone}
              onChange={(e) => onUpdate("company", { phone: e.target.value })}
              placeholder="Ex: 77 123 45 67"
              type="tel"
              icon={Phone}
            />
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.text, marginBottom: 8 }}>Email</div>
            <StyledInput
              value={draft.company.email}
              onChange={(e) => onUpdate("company", { email: e.target.value })}
              placeholder="contact@entreprise.sn"
              type="email"
              icon={Mail}
            />
          </div>
        </div>
      </SectionCard>

      {/* ═══ Facture ═══ */}
      <SectionCard
        title="Personnalisation de la facture"
        subtitle="Logo, couleurs et mentions de vos factures"
        icon={<FileText size={18} />}
        isMobile={isMobile}
      >
        <ProLockedOverlay
          isPro={isPro}
          onUpgrade={onUpgrade}
          icon={<FileText size={18} />}
          title="Factures personnalisees — Pro"
          description="Ajoutez votre logo, changez les couleurs et personnalisez vos factures."
        >
          {/* Logo */}
          <FieldRow label="Logo" sub="PNG ou JPG, max 500 Ko" isMobile={isMobile}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              {draft.invoice.logo ? (
                <div style={{
                  width: 80, height: 80, borderRadius: 14,
                  border: `2px solid ${COLORS.border}`,
                  overflow: "hidden", display: "flex", alignItems: "center",
                  justifyContent: "center", background: COLORS.bg, flexShrink: 0,
                }}>
                  <img src={draft.invoice.logo} alt="Logo" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                </div>
              ) : (
                <div style={{
                  width: 80, height: 80, borderRadius: 14,
                  border: `2px dashed ${COLORS.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: COLORS.bg, flexShrink: 0, color: COLORS.textPlaceholder,
                }}>
                  <Upload size={28} strokeWidth={1.5} />
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleLogoUpload} style={{ display: "none" }} />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  style={{
                    padding: "10px 20px", borderRadius: 12,
                    background: COLORS.accentSubtle, color: COLORS.accent,
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                    border: `1.5px solid ${COLORS.accent}30`,
                    display: "flex", alignItems: "center", gap: 6,
                    fontFamily: "inherit", transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.accent; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.accentSubtle; e.currentTarget.style.color = COLORS.accent; }}
                >
                  <Upload size={14} />
                  {draft.invoice.logo ? "Changer le logo" : "Importer un logo"}
                </button>
                {draft.invoice.logo && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    style={{
                      padding: "8px 16px", borderRadius: 10,
                      background: COLORS.dangerLight, color: COLORS.danger,
                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 5,
                      border: "none", fontFamily: "inherit",
                    }}
                  >
                    <Trash2 size={12} /> Supprimer
                  </button>
                )}
              </div>
            </div>
          </FieldRow>

          {/* Couleur */}
          <FieldRow label="Couleur d'accent" sub="Couleur principale de la facture" isMobile={isMobile}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {ACCENT_PRESETS.map((p) => {
                const active = draft.invoice.accentColor.toUpperCase() === p.color.toUpperCase();
                return (
                  <button
                    key={p.color}
                    type="button"
                    onClick={() => onUpdate("invoice", { accentColor: p.color })}
                    title={p.label}
                    style={{
                      width: 36, height: 36, borderRadius: 10, background: p.color,
                      border: active ? `3px solid ${COLORS.text}` : "3px solid transparent",
                      cursor: "pointer", transition: "transform 0.15s, border 0.15s",
                      boxShadow: active ? `0 0 0 2px ${COLORS.surface}, 0 0 0 4px ${p.color}` : SHADOWS.sm,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  />
                );
              })}
            </div>
            <ColorCodeInput
              value={draft.invoice.accentColor}
              onChange={(color) => onUpdate("invoice", { accentColor: color })}
              label="Ou saisissez un code couleur"
            />
          </FieldRow>

          {/* Echeance */}
          <FieldRow label="Echeance" sub="Delai de paiement" isMobile={isMobile}>
            <select
              value={draft.invoice.paymentTerms}
              onChange={(e) => onUpdate("invoice", { paymentTerms: e.target.value })}
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 12,
                border: `1.5px solid ${COLORS.border}`, fontSize: 14, outline: "none",
                background: COLORS.surface,
                color: draft.invoice.paymentTerms ? COLORS.text : COLORS.textPlaceholder,
                fontFamily: "inherit", cursor: "pointer",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => { e.target.style.borderColor = COLORS.accent; }}
              onBlur={(e) => { e.target.style.borderColor = COLORS.border; }}
            >
              <option value="">Aucune echeance</option>
              <option value="A reception">A reception</option>
              <option value="7 jours">7 jours</option>
              <option value="15 jours">15 jours</option>
              <option value="30 jours">30 jours</option>
              <option value="60 jours">60 jours</option>
            </select>
          </FieldRow>

          {/* Pied de page */}
          <FieldRow label="Pied de page" sub="Message en bas de facture" isMobile={isMobile}>
            <StyledInput
              value={draft.invoice.footerText}
              onChange={(e) => onUpdate("invoice", { footerText: e.target.value })}
              placeholder="Merci pour votre confiance"
            />
          </FieldRow>

          {/* Apercu */}
          <div style={{
            marginTop: 8, padding: "16px 20px", borderRadius: 16,
            background: COLORS.bg, border: `1px solid ${COLORS.borderLight}`,
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              fontSize: 11, fontWeight: 700, color: COLORS.textPlaceholder,
              textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12,
            }}>
              <Eye size={12} />
              Apercu de la facture
            </div>
            <div style={{
              padding: "20px 24px", borderRadius: 14,
              border: `1.5px solid ${COLORS.borderLight}`,
              background: "#fff",
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {draft.invoice.logo ? (
                  <img src={draft.invoice.logo} alt="Logo" style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 8 }} />
                ) : (
                  <div style={{
                    width: 48, height: 48, borderRadius: 10,
                    background: draft.invoice.accentColor,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 20, fontWeight: 800,
                  }}>
                    {(draft.company.name || "G")[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: draft.invoice.accentColor }}>
                    {draft.company.name || "Votre Entreprise"}
                  </div>
                  <div style={{ fontSize: 11, color: "#8C8279" }}>
                    {draft.company.address || "Dakar, Senegal"}
                    {draft.company.ninea && ` · NINEA ${draft.company.ninea}`}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: draft.invoice.accentColor }}>FACTURE #0001</div>
                {draft.invoice.paymentTerms && (
                  <div style={{ fontSize: 11, color: "#8C8279" }}>Echeance : {draft.invoice.paymentTerms}</div>
                )}
              </div>
            </div>
            <div style={{
              marginTop: 8, padding: "10px 24px", borderRadius: 10,
              border: `1px solid ${COLORS.borderLight}`, background: "#fff",
              fontSize: 12, color: "#8C8279", textAlign: "center",
              borderTop: `2px solid ${draft.invoice.accentColor}`,
            }}>
              {draft.invoice.footerText || "Merci pour votre confiance"}
            </div>
          </div>
        </ProLockedOverlay>
      </SectionCard>

      {/* ═══ Apparence ═══ */}
      <SectionCard
        title="Apparence de l'application"
        subtitle="Personnalisez les couleurs de l'interface"
        icon={<Palette size={18} />}
        isMobile={isMobile}
      >
        <ProLockedOverlay
          isPro={isPro}
          onUpgrade={onUpgrade}
          icon={<Palette size={18} />}
          title="Theme personnalise — Pro"
          description="Changez les couleurs de l'interface pour correspondre a votre marque."
        >
          <FieldRow label="Couleur principale" sub="Modifie l'accent de l'interface" isMobile={isMobile}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => onUpdate("theme", { accentColor: "" })}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: `linear-gradient(135deg, #D4622B, #B8501F)`,
                  border: !draft.theme.accentColor ? `3px solid ${COLORS.text}` : "3px solid transparent",
                  cursor: "pointer", transition: "transform 0.15s", boxShadow: SHADOWS.sm,
                }}
                title="Par defaut"
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              />
              {ACCENT_PRESETS.filter((p) => p.color !== "#D4622B").map((p) => {
                const active = draft.theme.accentColor.toUpperCase() === p.color.toUpperCase();
                return (
                  <button
                    key={p.color}
                    type="button"
                    onClick={() => onUpdate("theme", { accentColor: p.color })}
                    title={p.label}
                    style={{
                      width: 36, height: 36, borderRadius: 10, background: p.color,
                      border: active ? `3px solid ${COLORS.text}` : "3px solid transparent",
                      cursor: "pointer", transition: "transform 0.15s", boxShadow: SHADOWS.sm,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                  />
                );
              })}
            </div>
            <ColorCodeInput
              value={draft.theme.accentColor || "#D4622B"}
              onChange={(color) => onUpdate("theme", { accentColor: color })}
              label="Ou saisissez un code couleur"
            />
          </FieldRow>

          {draft.theme.accentColor && (
            <div style={{
              padding: "14px 18px", borderRadius: 14,
              background: `${draft.theme.accentColor}10`,
              border: `1.5px solid ${draft.theme.accentColor}25`,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: draft.theme.accentColor, flexShrink: 0,
              }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>Theme personnalise actif</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>Rechargez la page pour appliquer le nouveau theme.</div>
              </div>
            </div>
          )}
        </ProLockedOverlay>
      </SectionCard>

      {/* ═══ Zone de danger ═══ */}
      <SectionCard
        title="Zone de danger"
        subtitle="Actions irreversibles"
        icon={<AlertTriangle size={18} />}
        isMobile={isMobile}
        danger
      >
        <div style={{
          display: "flex", alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          flexDirection: isMobile ? "column" : "row",
          gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.text }}>Reinitialiser les parametres</div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>Remet tous les parametres par defaut. Cette action est irreversible.</div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (confirm("Reinitialiser tous les parametres ? Cette action est irreversible.")) {
                onReset();
              }
            }}
            style={{
              padding: "11px 24px", borderRadius: 12,
              background: COLORS.dangerLight, color: COLORS.danger,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              border: `1.5px solid ${COLORS.danger}20`,
              transition: "all 0.15s", fontFamily: "inherit",
              whiteSpace: "nowrap", flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.danger; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.dangerLight; e.currentTarget.style.color = COLORS.danger; }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Trash2 size={14} />
              Reinitialiser
            </span>
          </button>
        </div>
      </SectionCard>

      {/* ═══ Sticky Save Bar ═══ */}
      {hasChanges && (
        <div style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          zIndex: 100,
          padding: isMobile ? "12px 16px" : "14px 24px",
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderTop: `1px solid ${COLORS.borderLight}`,
          boxShadow: "0 -4px 20px rgba(26,22,18,0.08)",
          animation: "fadeInUp 0.2s ease",
        }}>
          <div style={{
            maxWidth: 740, margin: "0 auto",
            display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: 12,
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: errorMsg ? COLORS.danger : COLORS.warning, flexShrink: 0,
                  boxShadow: `0 0 6px ${errorMsg ? COLORS.danger : COLORS.warning}50`,
                }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>
                  {errorMsg ? "Erreur de sauvegarde" : "Modifications non sauvegardees"}
                </span>
              </div>
              {errorMsg && (
                <span style={{ fontSize: 11, color: COLORS.danger, marginLeft: 18 }}>
                  {errorMsg}
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={onDiscard}
                style={{
                  padding: "10px 18px", borderRadius: 12,
                  background: COLORS.surface, color: COLORS.textSecondary,
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  border: `1.5px solid ${COLORS.border}`,
                  fontFamily: "inherit", transition: "all 0.15s",
                  display: "flex", alignItems: "center", gap: 6,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.bg; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.surface; }}
              >
                <X size={14} />
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "10px 22px", borderRadius: 12,
                  background: saving
                    ? COLORS.surfaceAlt
                    : `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
                  color: saving ? COLORS.textPlaceholder : "#fff",
                  fontSize: 13, fontWeight: 700, letterSpacing: -0.2,
                  cursor: saving ? "default" : "pointer",
                  boxShadow: saving ? "none" : SHADOWS.accent,
                  transition: "all 0.2s",
                  border: "none", fontFamily: "inherit",
                  display: "flex", alignItems: "center", gap: 7,
                }}
                onMouseEnter={(e) => {
                  if (!saving) {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = SHADOWS.accentLg;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!saving) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = SHADOWS.accent;
                  }
                }}
              >
                {saving ? (
                  <>
                    <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    Sauvegarder
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
