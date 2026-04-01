import { useRef, useState } from "react";
import { COLORS, SHADOWS } from "../../constants/theme";
import { UpgradeBanner } from "../UI";
import {
  Building2,
  FileText,
  Palette,
  AlertTriangle,
  Upload,
  Trash2,
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

function ColorCodeInput({ value, onChange, label }) {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const valid = isValidHex(localValue);

  const handleChange = (e) => {
    const normalized = normalizeHex(e.target.value);
    setLocalValue(normalized);
    if (isValidHex(normalized)) {
      onChange(normalized);
    }
  };

  const handleFocus = (e) => {
    setEditing(true);
    setLocalValue(value);
    e.target.style.borderColor = COLORS.accent;
    e.target.style.boxShadow = `0 0 0 3px ${COLORS.accentSubtle}`;
  };

  const handleBlur = (e) => {
    setEditing(false);
    if (!isValidHex(localValue)) setLocalValue(value);
    e.target.style.borderColor = !valid && editing ? COLORS.danger : COLORS.border;
    e.target.style.boxShadow = "none";
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
        padding: "6px 10px",
        borderRadius: 12,
        border: `1.5px solid ${COLORS.border}`,
        background: COLORS.bg,
        maxWidth: 220,
      }}>
        {/* Color swatch synced with the picker */}
        <label style={{ display: "flex", cursor: "pointer", flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: valid ? displayValue : value,
            border: `2px solid ${COLORS.borderLight}`,
            transition: "background 0.15s ease",
            position: "relative",
            overflow: "hidden",
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

        {/* Hex text input */}
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          maxLength={7}
          placeholder="#000000"
          style={{
            flex: 1,
            padding: "6px 0",
            border: "none",
            outline: "none",
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
            letterSpacing: 0.5,
            background: "transparent",
            color: valid ? COLORS.text : COLORS.danger,
            textTransform: "uppercase",
            minWidth: 0,
          }}
        />

        {/* Validity indicator */}
        {editing && (
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: valid ? COLORS.success : COLORS.danger,
            flexShrink: 0,
            transition: "background 0.15s ease",
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

function SectionCard({ title, icon, children, isMobile, actions }) {
  return (
    <div
      style={{
        background: COLORS.surface,
        borderRadius: 18,
        border: `1px solid ${COLORS.borderLight}`,
        boxShadow: SHADOWS.xs,
        marginBottom: isMobile ? 16 : 20,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: isMobile ? "16px 18px" : "20px 28px",
          borderBottom: `1px solid ${COLORS.borderLight}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ display: "flex", color: COLORS.accent }}>{icon}</span>
          <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.3 }}>{title}</h3>
        </div>
        {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}
      </div>
      <div style={{ padding: isMobile ? "18px 18px" : "24px 28px" }}>{children}</div>
    </div>
  );
}

function FieldRow({ label, sub, children, isMobile }) {
  return (
    <div
      style={{
        display: isMobile ? "block" : "flex",
        alignItems: "flex-start",
        gap: 20,
        marginBottom: 20,
      }}
    >
      <div style={{ minWidth: isMobile ? "auto" : 160, marginBottom: isMobile ? 8 : 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

function StyledInput({ value, onChange, placeholder, type = "text", ...rest }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "11px 14px",
        borderRadius: 11,
        border: `1.5px solid ${COLORS.border}`,
        fontSize: 14,
        outline: "none",
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: "inherit",
        transition: "border-color 0.2s, box-shadow 0.2s",
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
  );
}

function SaveButton({ onClick, disabled, label = "Sauvegarder" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "8px 20px",
        borderRadius: 10,
        background: disabled
          ? COLORS.surfaceAlt
          : `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
        color: disabled ? COLORS.textPlaceholder : "#fff",
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? "default" : "pointer",
        boxShadow: disabled ? "none" : SHADOWS.accent,
        transition: "all 0.15s",
        border: "none",
      }}
    >
      {label}
    </button>
  );
}

function CancelButton({ onClick, disabled }) {
  if (disabled) return null;
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 16px",
        borderRadius: 10,
        background: COLORS.surfaceAlt,
        color: COLORS.textMuted,
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        border: "none",
      }}
    >
      Annuler
    </button>
  );
}

function ProLockedOverlay({ children, isPro, onUpgrade, title, description, icon }) {
  if (isPro) return children;
  return (
    <div style={{ position: "relative" }}>
      <div style={{ filter: "blur(4px)", opacity: 0.4, pointerEvents: "none" }}>{children}</div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 2,
        }}
      >
        <UpgradeBanner icon={icon} title={title} description={description} onUpgrade={onUpgrade} compact />
      </div>
    </div>
  );
}

function SavedToast({ visible }) {
  if (!visible) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        left: "50%",
        transform: "translateX(-50%)",
        padding: "12px 28px",
        borderRadius: 14,
        background: COLORS.success,
        color: "#fff",
        fontSize: 14,
        fontWeight: 600,
        boxShadow: SHADOWS.lg,
        zIndex: 1000,
        animation: "fadeInUp 0.25s ease",
      }}
    >
      Paramètres sauvegardés
    </div>
  );
}

export default function SettingsPage({
  draft,
  hasChanges,
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

  const handleSave = () => {
    onSave();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      alert("Le logo doit faire moins de 500 Ko");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      onUpdate("invoice", { logo: ev.target.result });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    onUpdate("invoice", { logo: "" });
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const saveActions = (
    <>
      <CancelButton onClick={onDiscard} disabled={!hasChanges} />
      <SaveButton onClick={handleSave} disabled={!hasChanges} />
    </>
  );

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <SavedToast visible={showToast} />

      {hasChanges && (
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            marginBottom: 16,
            padding: "12px 20px",
            borderRadius: 14,
            background: COLORS.surface,
            border: `1.5px solid ${COLORS.accent}33`,
            boxShadow: SHADOWS.md,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            animation: "fadeInUp 0.2s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS.warning, flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>
              Modifications non sauvegardées
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <CancelButton onClick={onDiscard} disabled={false} />
            <SaveButton onClick={handleSave} disabled={false} />
          </div>
        </div>
      )}

      <SectionCard title="Entreprise" icon={<Building2 size={18} />} isMobile={isMobile} actions={saveActions}>
        <FieldRow label="Nom" sub="Affiché sur vos factures" isMobile={isMobile}>
          <StyledInput value={draft.company.name} onChange={(e) => onUpdate("company", { name: e.target.value })} placeholder="Ex: Diallo Services" />
        </FieldRow>
        <FieldRow label="Adresse" isMobile={isMobile}>
          <StyledInput value={draft.company.address} onChange={(e) => onUpdate("company", { address: e.target.value })} placeholder="Ex: Médina, Dakar, Sénégal" />
        </FieldRow>
        <FieldRow label="NINEA" sub="Numéro d'identification" isMobile={isMobile}>
          <StyledInput value={draft.company.ninea} onChange={(e) => onUpdate("company", { ninea: e.target.value })} placeholder="Ex: 005 234 567 2G3" />
        </FieldRow>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
          <FieldRow label="Téléphone" isMobile={isMobile}>
            <StyledInput value={draft.company.phone} onChange={(e) => onUpdate("company", { phone: e.target.value })} placeholder="Ex: 77 123 45 67" type="tel" />
          </FieldRow>
          <FieldRow label="Email" isMobile={isMobile}>
            <StyledInput value={draft.company.email} onChange={(e) => onUpdate("company", { email: e.target.value })} placeholder="contact@entreprise.sn" type="email" />
          </FieldRow>
        </div>
      </SectionCard>

      <SectionCard title="Personnalisation de la facture" icon={<FileText size={18} />} isMobile={isMobile} actions={isPro ? saveActions : null}>
        <ProLockedOverlay isPro={isPro} onUpgrade={onUpgrade} icon={<FileText size={18} />} title="Factures personnalisées — Pro" description="Ajoutez votre logo, changez les couleurs et personnalisez vos factures.">
          <FieldRow label="Logo" sub="PNG ou JPG, max 500 Ko" isMobile={isMobile}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              {draft.invoice.logo ? (
                <div style={{ width: 80, height: 80, borderRadius: 14, border: `2px solid ${COLORS.border}`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.bg, flexShrink: 0 }}>
                  <img src={draft.invoice.logo} alt="Logo" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                </div>
              ) : (
                <div style={{ width: 80, height: 80, borderRadius: 14, border: `2px dashed ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.bg, flexShrink: 0, color: COLORS.textPlaceholder }}>
                  <Upload size={28} strokeWidth={1.5} />
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleLogoUpload} style={{ display: "none" }} />
                <button
                  onClick={() => logoInputRef.current?.click()}
                  style={{ padding: "9px 20px", borderRadius: 10, background: COLORS.accentSubtle, color: COLORS.accent, fontSize: 13, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${COLORS.accent}33`, display: "flex", alignItems: "center", gap: 6 }}
                >
                  <Upload size={14} />
                  {draft.invoice.logo ? "Changer le logo" : "Importer un logo"}
                </button>
                {draft.invoice.logo && (
                  <button onClick={handleRemoveLogo} style={{ padding: "7px 16px", borderRadius: 8, background: COLORS.dangerLight, color: COLORS.danger, fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                    <Trash2 size={12} /> Supprimer
                  </button>
                )}
              </div>
            </div>
          </FieldRow>

          <FieldRow label="Couleur d'accent" sub="Couleur principale de la facture" isMobile={isMobile}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              {ACCENT_PRESETS.map((p) => {
                const active = draft.invoice.accentColor.toUpperCase() === p.color.toUpperCase();
                return (
                  <button
                    key={p.color}
                    onClick={() => onUpdate("invoice", { accentColor: p.color })}
                    title={p.label}
                    style={{ width: 36, height: 36, borderRadius: 10, background: p.color, border: active ? "3px solid #1A1612" : "3px solid transparent", cursor: "pointer", transition: "transform 0.15s, border 0.15s", boxShadow: SHADOWS.sm }}
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

          <FieldRow label="Échéance" sub="Facultatif — délai de paiement" isMobile={isMobile}>
            <select value={draft.invoice.paymentTerms} onChange={(e) => onUpdate("invoice", { paymentTerms: e.target.value })} style={{ width: "100%", padding: "11px 14px", borderRadius: 11, border: `1.5px solid ${COLORS.border}`, fontSize: 14, outline: "none", background: COLORS.bg, color: draft.invoice.paymentTerms ? COLORS.text : COLORS.textPlaceholder, fontFamily: "inherit", cursor: "pointer" }}>
              <option value="">Aucune échéance</option>
              <option value="À réception">À réception</option>
              <option value="7 jours">7 jours</option>
              <option value="15 jours">15 jours</option>
              <option value="30 jours">30 jours</option>
              <option value="60 jours">60 jours</option>
            </select>
          </FieldRow>

          <FieldRow label="Pied de page" sub="Message en bas de facture" isMobile={isMobile}>
            <StyledInput value={draft.invoice.footerText} onChange={(e) => onUpdate("invoice", { footerText: e.target.value })} placeholder="Merci pour votre confiance" />
          </FieldRow>

          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, marginBottom: 10 }}>Aperçu de l'en-tête</div>
            <div style={{ padding: "20px 24px", borderRadius: 14, border: `1.5px solid ${COLORS.borderLight}`, background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {draft.invoice.logo ? (
                  <img src={draft.invoice.logo} alt="Logo" style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 8 }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: draft.invoice.accentColor, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20, fontWeight: 800 }}>
                    {(draft.company.name || "G")[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: draft.invoice.accentColor }}>{draft.company.name || "Votre Entreprise"}</div>
                  <div style={{ fontSize: 11, color: "#8C8279" }}>
                    {draft.company.address || "Dakar, Sénégal"}
                    {draft.company.ninea && ` · NINEA ${draft.company.ninea}`}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: draft.invoice.accentColor }}>FACTURE #0001</div>
                {draft.invoice.paymentTerms && <div style={{ fontSize: 11, color: "#8C8279" }}>Échéance : {draft.invoice.paymentTerms}</div>}
              </div>
            </div>
            <div style={{ marginTop: 8, padding: "10px 24px", borderRadius: 10, border: `1px solid ${COLORS.borderLight}`, background: "#fff", fontSize: 12, color: "#8C8279", textAlign: "center", borderTop: `2px solid ${draft.invoice.accentColor}` }}>
              {draft.invoice.footerText || "Merci pour votre confiance"}
            </div>
          </div>
        </ProLockedOverlay>
      </SectionCard>

      <SectionCard title="Apparence de l'application" icon={<Palette size={18} />} isMobile={isMobile} actions={isPro ? saveActions : null}>
        <ProLockedOverlay isPro={isPro} onUpgrade={onUpgrade} icon={<Palette size={18} />} title="Thème personnalisé — Pro" description="Changez les couleurs de l'interface pour correspondre à votre marque.">
          <FieldRow label="Couleur principale" sub="Modifie l'accent de l'interface" isMobile={isMobile}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <button
                onClick={() => onUpdate("theme", { accentColor: "" })}
                style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, #D4622B, #B8501F)`, border: !draft.theme.accentColor ? "3px solid #1A1612" : "3px solid transparent", cursor: "pointer", transition: "transform 0.15s", boxShadow: SHADOWS.sm }}
                title="Par défaut"
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              />
              {ACCENT_PRESETS.filter((p) => p.color !== "#D4622B").map((p) => {
                const active = draft.theme.accentColor.toUpperCase() === p.color.toUpperCase();
                return (
                  <button
                    key={p.color}
                    onClick={() => onUpdate("theme", { accentColor: p.color })}
                    title={p.label}
                    style={{ width: 36, height: 36, borderRadius: 10, background: p.color, border: active ? "3px solid #1A1612" : "3px solid transparent", cursor: "pointer", transition: "transform 0.15s", boxShadow: SHADOWS.sm }}
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
            <div style={{ padding: "14px 18px", borderRadius: 14, background: `${draft.theme.accentColor}12`, border: `1.5px solid ${draft.theme.accentColor}33`, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: draft.theme.accentColor, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>Thème personnalisé actif</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>Rechargez la page pour appliquer pleinement le nouveau thème.</div>
              </div>
            </div>
          )}
        </ProLockedOverlay>
      </SectionCard>

      <SectionCard title="Zone de danger" icon={<AlertTriangle size={18} />} isMobile={isMobile}>
        <FieldRow label="Réinitialiser" sub="Remet tous les paramètres par défaut" isMobile={isMobile}>
          <button
            onClick={() => {
              if (confirm("Réinitialiser tous les paramètres ? Cette action est irréversible.")) {
                onReset();
              }
            }}
            style={{ padding: "11px 24px", borderRadius: 12, background: COLORS.dangerLight, color: COLORS.danger, fontSize: 13, fontWeight: 600, cursor: "pointer", border: `1.5px solid ${COLORS.danger}22`, transition: "all 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.danger; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.dangerLight; e.currentTarget.style.color = COLORS.danger; }}
          >
            Réinitialiser les paramètres
          </button>
        </FieldRow>
      </SectionCard>
    </div>
  );
}
