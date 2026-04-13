import { useState, useMemo } from "react";
import { COLORS, SHADOWS, RADIUS } from "../../constants/theme";
import { createBlankOrder, getOrderTotal, PAYMENT_METHODS } from "../../utils/orders";
import { formatCurrency } from "../../utils/format";
import {
  Lock, Plus, X, User, Phone, Mail, ShoppingBag,
  CreditCard, ChevronRight, ChevronLeft,
  Smartphone, Banknote, Building2, Wallet,
  Check, Trash2, ArrowRight, MapPin,
} from "lucide-react";

// ─── Constants ───
const STEPS = [
  { key: "client", label: "Client", icon: User },
  { key: "articles", label: "Articles", icon: ShoppingBag },
  { key: "payment", label: "Paiement", icon: CreditCard },
];

const PAYMENT_OPTIONS = [
  { value: "wave", label: "Wave", icon: Smartphone, color: "#1DC3E0", bg: "#E6F9FC" },
  { value: "orange_money", label: "Orange Money", icon: Wallet, color: "#FF6B00", bg: "#FFF2E6" },
  { value: "especes", label: "Espèces", icon: Banknote, color: COLORS.success, bg: COLORS.successLight },
  { value: "virement", label: "Virement", icon: Building2, color: COLORS.blue, bg: COLORS.blueLight },
];

// ─── Helpers ───
function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// ─── Shared input styles ───
const inputBase = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: RADIUS.lg,
  border: `1.5px solid ${COLORS.border}`,
  fontSize: 14,
  outline: "none",
  background: COLORS.surface,
  color: COLORS.text,
  fontFamily: "inherit",
  transition: "border-color 0.2s, box-shadow 0.2s",
  boxSizing: "border-box",
};

const inputWithIcon = { ...inputBase, paddingLeft: 40 };

function applyFocus(e) {
  e.target.style.borderColor = COLORS.accent;
  e.target.style.boxShadow = `0 0 0 3px ${COLORS.accentSubtle}`;
}
function applyBlur(e, hasError) {
  e.target.style.borderColor = hasError ? COLORS.danger : COLORS.border;
  e.target.style.boxShadow = "none";
}

// ─── Step indicator ───
function StepIndicator({ current, steps, isMobile }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: isMobile ? 4 : 8, marginBottom: isMobile ? 20 : 28,
    }}>
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const Icon = step.icon;
        return (
          <div key={step.key} style={{ display: "flex", alignItems: "center", gap: isMobile ? 4 : 8 }}>
            {i > 0 && (
              <div style={{
                width: isMobile ? 20 : 36, height: 2,
                borderRadius: 1,
                background: done ? COLORS.accent : COLORS.borderLight,
                transition: "background 0.3s ease",
              }} />
            )}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: isMobile ? "6px 10px" : "8px 16px",
              borderRadius: 12,
              background: active ? COLORS.accentSubtle : done ? COLORS.successLight : COLORS.bg,
              border: `1.5px solid ${active ? COLORS.accent + "40" : done ? COLORS.success + "30" : COLORS.borderLight}`,
              transition: "all 0.3s ease",
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: 8,
                background: active
                  ? `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`
                  : done ? COLORS.success : COLORS.surfaceAlt,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: active || done ? "#fff" : COLORS.textPlaceholder,
                transition: "all 0.3s ease",
                flexShrink: 0,
              }}>
                {done ? <Check size={13} strokeWidth={2.5} /> : <Icon size={13} strokeWidth={2} />}
              </div>
              {!isMobile && (
                <span style={{
                  fontSize: 12.5, fontWeight: active ? 700 : 600,
                  color: active ? COLORS.accent : done ? COLORS.success : COLORS.textMuted,
                  whiteSpace: "nowrap",
                }}>
                  {step.label}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1: Client ───
function StepClient({ draft, updateField, errors, clearError, showSuggestions, setShowSuggestions, filteredClients, setDraft, isMobile }) {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: COLORS.text, marginBottom: 4, letterSpacing: -0.3 }}>
          Informations client
        </h3>
        <p style={{ fontSize: 13, color: COLORS.textMuted, margin: 0 }}>
          Renseignez les coordonnées du client pour cette commande.
        </p>
      </div>

      {/* Client name with autocomplete */}
      <div style={{ marginBottom: 16, position: "relative" }}>
        <label style={{
          display: "block", fontSize: 12, fontWeight: 600,
          color: errors.client ? COLORS.danger : COLORS.textSecondary,
          marginBottom: 6,
        }}>
          Nom du client <span style={{ color: COLORS.danger }}>*</span>
        </label>
        <div style={{ position: "relative" }}>
          <span style={{
            position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
            color: errors.client ? COLORS.danger : COLORS.textPlaceholder, display: "flex", pointerEvents: "none",
          }}>
            <User size={15} />
          </span>
          <input
            placeholder="Ex: Abdoulaye Diallo"
            value={draft.client}
            onChange={(e) => { updateField("client", e.target.value); setShowSuggestions(true); clearError("client"); }}
            onFocus={(e) => { applyFocus(e); setShowSuggestions(true); }}
            onBlur={(e) => { applyBlur(e, errors.client); setTimeout(() => setShowSuggestions(false), 150); }}
            style={{
              ...inputWithIcon,
              border: `1.5px solid ${errors.client ? COLORS.danger : COLORS.border}`,
            }}
          />
        </div>

        {/* Autocomplete dropdown */}
        {showSuggestions && filteredClients.length > 0 && (
          <div style={{
            position: "absolute", top: "100%", left: 0, right: 0,
            background: COLORS.surface, border: `1.5px solid ${COLORS.accent}25`,
            borderRadius: 14, boxShadow: SHADOWS.lg, zIndex: 10,
            marginTop: 4, overflow: "hidden",
          }}>
            <div style={{
              padding: "8px 14px", fontSize: 10.5, fontWeight: 700, color: COLORS.textPlaceholder,
              textTransform: "uppercase", letterSpacing: 0.8,
              borderBottom: `1px solid ${COLORS.borderLight}`,
              background: COLORS.bg,
            }}>
              Clients existants
            </div>
            {filteredClients.map((c, i) => (
              <div
                key={i}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setDraft((prev) => ({ ...prev, client: c.name, phone: c.phone, email: c.email }));
                  setShowSuggestions(false);
                  clearError("client");
                  clearError("phone");
                }}
                style={{
                  padding: "11px 14px", cursor: "pointer",
                  borderBottom: i < filteredClients.length - 1 ? `1px solid ${COLORS.borderLight}` : "none",
                  transition: "background 0.1s", display: "flex", alignItems: "center", gap: 10,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.surfaceHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: COLORS.accentSubtle, color: COLORS.accent,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 800, flexShrink: 0,
                }}>
                  {getInitials(c.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: COLORS.text }}>{c.name}</div>
                  <div style={{ fontSize: 11.5, color: COLORS.textMuted }}>{c.phone}{c.email ? ` · ${c.email}` : ""}</div>
                </div>
                <ArrowRight size={14} style={{ color: COLORS.textPlaceholder, flexShrink: 0 }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Phone & Email */}
      <div style={{ display: "flex", gap: 12, flexDirection: isMobile ? "column" : "row" }}>
        <div style={{ flex: 1 }}>
          <label style={{
            display: "block", fontSize: 12, fontWeight: 600,
            color: errors.phone ? COLORS.danger : COLORS.textSecondary,
            marginBottom: 6,
          }}>
            Téléphone <span style={{ color: COLORS.danger }}>*</span>
          </label>
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
              color: errors.phone ? COLORS.danger : COLORS.textPlaceholder, display: "flex", pointerEvents: "none",
            }}>
              <Phone size={15} />
            </span>
            <input
              type="tel"
              placeholder="77 123 45 67"
              value={draft.phone}
              onChange={(e) => { updateField("phone", e.target.value); clearError("phone"); }}
              onFocus={applyFocus}
              onBlur={(e) => applyBlur(e, errors.phone)}
              style={{
                ...inputWithIcon,
                border: `1.5px solid ${errors.phone ? COLORS.danger : COLORS.border}`,
              }}
            />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{
            display: "block", fontSize: 12, fontWeight: 600,
            color: COLORS.textSecondary, marginBottom: 6,
          }}>
            Email <span style={{ fontSize: 10, color: COLORS.textPlaceholder, fontWeight: 500 }}>(optionnel)</span>
          </label>
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
              color: COLORS.textPlaceholder, display: "flex", pointerEvents: "none",
            }}>
              <Mail size={15} />
            </span>
            <input
              type="email"
              placeholder="client@gmail.com"
              value={draft.email}
              onChange={(e) => updateField("email", e.target.value)}
              onFocus={applyFocus}
              onBlur={(e) => applyBlur(e)}
              style={inputWithIcon}
            />
          </div>
        </div>
      </div>

      {/* Adresse de livraison */}
      <div style={{ marginTop: 16 }}>
        <label style={{
          display: "block", fontSize: 12, fontWeight: 600,
          color: COLORS.textSecondary, marginBottom: 6,
        }}>
          Adresse de livraison <span style={{ fontSize: 10, color: COLORS.textPlaceholder, fontWeight: 500 }}>(optionnel)</span>
        </label>
        <div style={{ position: "relative" }}>
          <span style={{
            position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)",
            color: COLORS.textPlaceholder, display: "flex", pointerEvents: "none",
          }}>
            <MapPin size={15} />
          </span>
          <input
            placeholder="Ex: Médina, Rue 21, Dakar"
            value={draft.address}
            onChange={(e) => updateField("address", e.target.value)}
            onFocus={applyFocus}
            onBlur={(e) => applyBlur(e)}
            style={inputWithIcon}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Articles ───
function StepArticles({ draft, updateItem, addItem, removeItem, errors, clearError, isPro, maxItems, onUpgrade, isMobile }) {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: COLORS.text, marginBottom: 4, letterSpacing: -0.3 }}>
          Articles de la commande
        </h3>
        <p style={{ fontSize: 13, color: COLORS.textMuted, margin: 0 }}>
          Ajoutez les produits ou services commandés.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {draft.items.map((item, i) => {
          const sub = (Number(item.qty) || 0) * (Number(item.price) || 0);
          const nameErr = errors[`item_name_${i}`];
          const priceErr = errors[`item_price_${i}`];
          const qtyErr = errors[`item_qty_${i}`];

          return (
            <div
              key={i}
              style={{
                background: COLORS.surface,
                borderRadius: 14,
                border: `1.5px solid ${(nameErr || priceErr || qtyErr) ? COLORS.danger + "40" : COLORS.borderLight}`,
                padding: isMobile ? 14 : 16,
                transition: "all 0.2s ease",
                boxShadow: SHADOWS.xs,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = SHADOWS.sm; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = SHADOWS.xs; }}
            >
              {/* Card header */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 12,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
                    color: "#fff",
                    fontSize: 12, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.textSecondary }}>
                    Article {i + 1}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {sub > 0 && (
                    <span style={{
                      fontSize: 14, fontWeight: 700, color: COLORS.accent,
                      letterSpacing: -0.3,
                    }}>
                      {formatCurrency(sub)}
                    </span>
                  )}
                  {draft.items.length > 1 && (
                    <button
                      onClick={() => removeItem(i)}
                      style={{
                        background: "transparent", color: COLORS.textPlaceholder,
                        width: 30, height: 30, borderRadius: 8,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, cursor: "pointer", border: `1.5px solid transparent`,
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = COLORS.dangerLight;
                        e.currentTarget.style.color = COLORS.danger;
                        e.currentTarget.style.borderColor = COLORS.danger + "30";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = COLORS.textPlaceholder;
                        e.currentTarget.style.borderColor = "transparent";
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 10 }}>
                <input
                  placeholder="Nom du produit ou service..."
                  value={item.name}
                  onChange={(e) => { updateItem(i, "name", e.target.value); clearError(`item_name_${i}`); }}
                  onFocus={applyFocus}
                  onBlur={(e) => applyBlur(e, nameErr)}
                  style={{
                    ...inputBase,
                    border: `1.5px solid ${nameErr ? COLORS.danger : COLORS.border}`,
                    fontSize: 14,
                  }}
                />
              </div>

              {/* Qty + Price row */}
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: "0 0 90px" }}>
                  <label style={{
                    display: "block", fontSize: 11, fontWeight: 600,
                    color: qtyErr ? COLORS.danger : COLORS.textMuted, marginBottom: 4,
                  }}>
                    Quantité
                  </label>
                  <input
                    type="number" min={1} placeholder="1"
                    value={item.qty}
                    onChange={(e) => { updateItem(i, "qty", e.target.value); clearError(`item_qty_${i}`); }}
                    onFocus={applyFocus}
                    onBlur={(e) => applyBlur(e, qtyErr)}
                    onWheel={(e) => e.target.blur()}
                    style={{
                      ...inputBase,
                      textAlign: "center",
                      border: `1.5px solid ${qtyErr ? COLORS.danger : COLORS.border}`,
                      padding: "10px 8px",
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{
                    display: "block", fontSize: 11, fontWeight: 600,
                    color: priceErr ? COLORS.danger : COLORS.textMuted, marginBottom: 4,
                  }}>
                    Prix unitaire (F CFA)
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="number" min={0} placeholder="0"
                      value={item.price}
                      onChange={(e) => { updateItem(i, "price", e.target.value); clearError(`item_price_${i}`); }}
                      onFocus={applyFocus}
                      onBlur={(e) => applyBlur(e, priceErr)}
                      onWheel={(e) => e.target.blur()}
                      style={{
                        ...inputBase,
                        textAlign: "right",
                        paddingRight: 36,
                        border: `1.5px solid ${priceErr ? COLORS.danger : COLORS.border}`,
                      }}
                    />
                    <span style={{
                      position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)",
                      fontSize: 12, color: COLORS.textPlaceholder, fontWeight: 700, pointerEvents: "none",
                    }}>F</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add article button */}
      <div style={{ marginTop: 12 }}>
        {!isPro && draft.items.length >= maxItems ? (
          <button
            onClick={onUpgrade}
            style={{
              background: `linear-gradient(135deg, ${COLORS.accentSubtle}, #FFF3E8)`,
              color: COLORS.accent, padding: "12px 16px", borderRadius: 12,
              fontSize: 13, fontWeight: 600, border: `1.5px solid ${COLORS.accent}33`,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 7, width: "100%",
              justifyContent: "center", fontFamily: "inherit",
            }}
          >
            <Lock size={13} /> Max {maxItems} articles — Passer à Pro
          </button>
        ) : (
          <button
            onClick={addItem}
            style={{
              background: "transparent", color: COLORS.accent,
              padding: "12px 16px", borderRadius: 12, fontSize: 13, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 7, width: "100%",
              justifyContent: "center", cursor: "pointer",
              border: `1.5px dashed ${COLORS.accent}40`, transition: "all 0.15s ease",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = COLORS.accentSubtle;
              e.currentTarget.style.borderColor = COLORS.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = COLORS.accent + "40";
            }}
          >
            <Plus size={15} /> Ajouter un article
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Step 3: Payment + Notes + Summary ───
function StepPayment({ draft, updateField, errors, clearError, isMobile }) {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: COLORS.text, marginBottom: 4, letterSpacing: -0.3 }}>
          Paiement & finalisation
        </h3>
        <p style={{ fontSize: 13, color: COLORS.textMuted, margin: 0 }}>
          Choisissez le mode de paiement et ajoutez des notes si besoin.
        </p>
      </div>

      {/* Payment grid */}
      <label style={{
        display: "block", fontSize: 12, fontWeight: 600,
        color: errors.payment ? COLORS.danger : COLORS.textSecondary,
        marginBottom: 8,
      }}>
        Mode de paiement <span style={{ color: COLORS.danger }}>*</span>
      </label>
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
        gap: 10, marginBottom: 20,
      }}>
        {PAYMENT_OPTIONS.map((opt) => {
          const active = draft.payment === opt.value;
          const IconComp = opt.icon;
          return (
            <button
              key={opt.value}
              onClick={() => { updateField("payment", opt.value); clearError("payment"); }}
              style={{
                padding: "16px 10px", borderRadius: 14, cursor: "pointer",
                background: active ? opt.bg : COLORS.surface,
                border: `2px solid ${active ? opt.color : COLORS.borderLight}`,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                transition: "all 0.2s ease",
                boxShadow: active ? `0 4px 16px ${opt.color}20` : SHADOWS.xs,
                transform: active ? "scale(1.02)" : "scale(1)",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = opt.color + "60";
                  e.currentTarget.style.background = opt.bg;
                  e.currentTarget.style.transform = "scale(1.02)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.borderColor = COLORS.borderLight;
                  e.currentTarget.style.background = COLORS.surface;
                  e.currentTarget.style.transform = "scale(1)";
                }
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: active ? opt.color : COLORS.surfaceAlt,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: active ? "#fff" : COLORS.textMuted,
                transition: "all 0.2s ease",
              }}>
                <IconComp size={20} strokeWidth={2} />
              </div>
              <span style={{
                fontSize: 12, fontWeight: active ? 700 : 600,
                color: active ? opt.color : COLORS.textSecondary,
                whiteSpace: "nowrap",
              }}>
                {opt.label}
              </span>
              {active && (
                <div style={{
                  width: 18, height: 18, borderRadius: 9,
                  background: opt.color, color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Check size={11} strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Notes */}
      <label style={{
        display: "block", fontSize: 12, fontWeight: 600,
        color: COLORS.textSecondary, marginBottom: 6,
      }}>
        Notes <span style={{ fontSize: 10, color: COLORS.textPlaceholder, fontWeight: 500 }}>(optionnel)</span>
      </label>
      <textarea
        rows={3}
        placeholder="Instructions spéciales, remarques..."
        value={draft.notes}
        onChange={(e) => updateField("notes", e.target.value)}
        style={{
          ...inputBase,
          resize: "vertical",
          minHeight: 80,
        }}
        onFocus={applyFocus}
        onBlur={(e) => applyBlur(e)}
      />

      {/* Summary preview */}
      <div style={{
        marginTop: 20,
        background: COLORS.bg,
        borderRadius: 14,
        border: `1px solid ${COLORS.borderLight}`,
        overflow: "hidden",
      }}>
        <div style={{
          padding: "10px 16px",
          background: COLORS.surfaceAlt,
          fontSize: 11, fontWeight: 700, color: COLORS.textMuted,
          textTransform: "uppercase", letterSpacing: 0.6,
        }}>
          Récapitulatif
        </div>
        <div style={{ padding: 16 }}>
          {/* Client */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12.5, color: COLORS.textMuted }}>Client</span>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.text }}>
              {draft.client || "—"}
            </span>
          </div>
          {/* Phone */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12.5, color: COLORS.textMuted }}>Téléphone</span>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.text }}>
              {draft.phone || "—"}
            </span>
          </div>
          {/* Address */}
          {draft.address && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12.5, color: COLORS.textMuted }}>Livraison</span>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: COLORS.text }}>
                {draft.address}
              </span>
            </div>
          )}
          {/* Articles */}
          <div style={{
            borderTop: `1px dashed ${COLORS.borderLight}`,
            paddingTop: 8, marginTop: 4, marginBottom: 8,
          }}>
            {draft.items.filter((it) => it.name).map((it, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between",
                fontSize: 12.5, marginBottom: 4,
              }}>
                <span style={{ color: COLORS.textSecondary }}>
                  {it.name} {Number(it.qty) > 1 ? `x${it.qty}` : ""}
                </span>
                <span style={{ fontWeight: 600, color: COLORS.text }}>
                  {(Number(it.qty) || 0) * (Number(it.price) || 0) > 0
                    ? formatCurrency((Number(it.qty) || 0) * (Number(it.price) || 0))
                    : "—"}
                </span>
              </div>
            ))}
          </div>
          {/* Payment */}
          {draft.payment && (
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12.5, color: COLORS.textMuted }}>Paiement</span>
              <span style={{
                fontSize: 11.5, fontWeight: 600,
                padding: "3px 10px", borderRadius: 6,
                background: PAYMENT_OPTIONS.find((p) => p.value === draft.payment)?.bg,
                color: PAYMENT_OPTIONS.find((p) => p.value === draft.payment)?.color,
              }}>
                {PAYMENT_METHODS[draft.payment]}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Form ───
export default function NewOrderForm({ onSubmit, onCancel, isPro, maxItems, onUpgrade, existingOrders, isMobile }) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState(createBlankOrder());
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errors, setErrors] = useState({});

  const clients = useMemo(() => {
    if (!existingOrders) return [];
    const map = new Map();
    existingOrders.forEach((o) => {
      const key = o.client.toLowerCase();
      if (!map.has(key)) {
        map.set(key, { name: o.client, phone: o.phone, email: o.email || "" });
      }
    });
    return Array.from(map.values());
  }, [existingOrders]);

  const filteredClients = useMemo(() => {
    if (!draft.client || draft.client.length < 2) return [];
    const q = draft.client.toLowerCase();
    return clients.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 5);
  }, [draft.client, clients]);

  const updateField = (field, value) => setDraft((prev) => ({ ...prev, [field]: value }));

  const addItem = () => {
    if (!isPro && draft.items.length >= maxItems) return;
    setDraft((prev) => ({ ...prev, items: [...prev.items, { name: "", qty: 1, price: "" }] }));
  };

  const updateItem = (idx, field, value) =>
    setDraft((prev) => ({
      ...prev,
      items: prev.items.map((it, i) => (i === idx ? { ...it, [field]: value } : it)),
    }));

  const removeItem = (idx) => setDraft((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));

  const clearError = (key) => setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });

  const total = getOrderTotal(draft.items);

  // Validate current step, return true if valid
  const validateStep = (s) => {
    const newErrors = {};
    if (s === 0) {
      if (!draft.client.trim()) newErrors.client = true;
      if (!draft.phone.trim()) newErrors.phone = true;
    } else if (s === 1) {
      draft.items.forEach((item, i) => {
        if (!item.name.trim()) newErrors[`item_name_${i}`] = true;
        if (!Number(item.price)) newErrors[`item_price_${i}`] = true;
        if (!Number(item.qty)) newErrors[`item_qty_${i}`] = true;
      });
    } else if (s === 2) {
      if (!draft.payment) newErrors.payment = true;
    }
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }
  };

  const goPrev = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = () => {
    if (!validateStep(2)) return;
    const normalized = {
      ...draft,
      items: draft.items.map((it) => ({
        ...it,
        qty: Number(it.qty) || 1,
        price: Number(it.price) || 0,
      })),
    };
    onSubmit(normalized);
    setDraft(createBlankOrder());
    setErrors({});
    setStep(0);
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      {/* Step indicator */}
      <StepIndicator current={step} steps={STEPS} isMobile={isMobile} />

      {/* Step content */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {step === 0 && (
          <StepClient
            draft={draft}
            updateField={updateField}
            errors={errors}
            clearError={clearError}
            showSuggestions={showSuggestions}
            setShowSuggestions={setShowSuggestions}
            filteredClients={filteredClients}
            setDraft={setDraft}
            isMobile={isMobile}
          />
        )}
        {step === 1 && (
          <StepArticles
            draft={draft}
            updateItem={updateItem}
            addItem={addItem}
            removeItem={removeItem}
            errors={errors}
            clearError={clearError}
            isPro={isPro}
            maxItems={maxItems}
            onUpgrade={onUpgrade}
            isMobile={isMobile}
          />
        )}
        {step === 2 && (
          <StepPayment
            draft={draft}
            updateField={updateField}
            errors={errors}
            clearError={clearError}
            isMobile={isMobile}
          />
        )}
      </div>

      {/* ─── Bottom bar: total + navigation ─── */}
      <div style={{
        marginTop: 24,
        borderTop: `1px solid ${COLORS.borderLight}`,
        paddingTop: 18,
      }}>
        {/* Total */}
        <div style={{
          background: total > 0
            ? `linear-gradient(135deg, ${COLORS.accent}08, ${COLORS.accentSubtle})`
            : COLORS.bg,
          padding: "14px 18px", borderRadius: 14, marginBottom: 16,
          border: `1.5px solid ${total > 0 ? COLORS.accent + "30" : COLORS.borderLight}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          transition: "all 0.3s ease",
        }}>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: COLORS.textMuted }}>
              Total estimé
            </div>
            <div style={{ fontSize: 11, color: COLORS.textPlaceholder, marginTop: 1 }}>
              {draft.items.filter((i) => i.name).length} article{draft.items.filter((i) => i.name).length !== 1 ? "s" : ""}
              {draft.payment && (
                <span style={{ color: COLORS.accent, fontWeight: 600 }}>
                  {" "}· {PAYMENT_METHODS[draft.payment]}
                </span>
              )}
            </div>
          </div>
          <span style={{
            fontSize: total > 0 ? 26 : 20, fontWeight: 800,
            color: total > 0 ? COLORS.accent : COLORS.textPlaceholder,
            letterSpacing: -0.8, transition: "all 0.3s ease",
          }}>
            {formatCurrency(total)}
          </span>
        </div>

        {/* Navigation */}
        <div style={{
          display: "flex", gap: 10,
          justifyContent: step === 0 ? "flex-end" : "space-between",
        }}>
          {step > 0 && (
            <button
              onClick={goPrev}
              style={{
                background: COLORS.surface, color: COLORS.textSecondary,
                padding: "12px 20px", borderRadius: 12, fontSize: 13.5,
                fontWeight: 600, cursor: "pointer",
                border: `1.5px solid ${COLORS.border}`,
                display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.15s ease",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = COLORS.bg;
                e.currentTarget.style.borderColor = COLORS.textPlaceholder;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = COLORS.surface;
                e.currentTarget.style.borderColor = COLORS.border;
              }}
            >
              <ChevronLeft size={16} />
              Retour
            </button>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={onCancel}
              style={{
                background: "transparent", color: COLORS.textMuted,
                padding: "12px 18px", borderRadius: 12, fontSize: 13.5,
                fontWeight: 600, cursor: "pointer", border: "none",
                transition: "all 0.15s ease",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.text; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.textMuted; }}
            >
              Annuler
            </button>
            <button
              onClick={isLastStep ? handleSubmit : goNext}
              style={{
                background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
                color: "#fff",
                padding: "12px 24px", borderRadius: 12, fontSize: 13.5,
                fontWeight: 700, letterSpacing: -0.2,
                boxShadow: SHADOWS.accent,
                cursor: "pointer",
                border: "none", display: "flex", alignItems: "center", gap: 7,
                transition: "all 0.2s ease",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = SHADOWS.accentLg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = SHADOWS.accent;
              }}
            >
              {isLastStep ? (
                <>
                  <Check size={16} strokeWidth={2.5} />
                  Créer la commande
                </>
              ) : (
                <>
                  Suivant
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
