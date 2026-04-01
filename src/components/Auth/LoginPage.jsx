import { useState } from "react";
import { COLORS, SHADOWS, RADIUS, FONT } from "../../constants/theme";
import useMediaQuery from "../../hooks/useMediaQuery";
import { supabase } from "../../services/supabase";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader } from "lucide-react";

export default function LoginPage({ onBack, onLogin }) {
  const { isMobile } = useMediaQuery();
  const [mode, setMode] = useState("login"); // "login" | "register" | "forgot"
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  });

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.email.trim()) {
      setError("Veuillez entrer votre email.");
      return;
    }

    // ── Forgot password ──
    if (mode === "forgot") {
      setLoading(true);
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        form.email,
        { redirectTo: window.location.origin }
      );
      setLoading(false);

      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess("Un lien de réinitialisation a été envoyé à votre email.");
      }
      return;
    }

    if (!form.password) {
      setError("Veuillez entrer votre mot de passe.");
      return;
    }

    // ── Register ──
    if (mode === "register") {
      if (!form.name.trim()) {
        setError("Veuillez entrer votre nom.");
        return;
      }
      if (form.password.length < 6) {
        setError("Le mot de passe doit contenir au moins 6 caractères.");
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError("Les mots de passe ne correspondent pas.");
        return;
      }

      setLoading(true);
      const { error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.name },
        },
      });
      setLoading(false);

      if (signUpError) {
        setError(signUpError.message);
      } else {
        setSuccess("Compte créé ! Vérifiez votre email pour confirmer votre inscription.");
      }
      return;
    }

    // ── Login ──
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    setLoading(false);

    if (signInError) {
      if (signInError.message.includes("Invalid login credentials")) {
        setError("Email ou mot de passe incorrect.");
      } else if (signInError.message.includes("Email not confirmed")) {
        setError("Veuillez confirmer votre email avant de vous connecter.");
      } else {
        setError(signInError.message);
      }
    }
    // onLogin will be triggered by onAuthStateChange in App.jsx
  };

  const titles = {
    login: "Connexion",
    register: "Créer un compte",
    forgot: "Mot de passe oublié",
  };

  const subtitles = {
    login: "Accédez à votre espace de gestion",
    register: "Commencez à gérer vos commandes",
    forgot: "Recevez un lien de réinitialisation",
  };

  const inputStyle = (focused) => ({
    width: "100%",
    padding: "12px 14px 12px 42px",
    fontSize: 14,
    fontWeight: 500,
    borderRadius: RADIUS.md,
    border: `1.5px solid ${focused ? COLORS.accent : COLORS.border}`,
    background: COLORS.surface,
    color: COLORS.text,
    outline: "none",
    transition: "border-color 0.2s ease",
  });

  const iconWrapStyle = {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    color: COLORS.textPlaceholder,
    display: "flex",
    pointerEvents: "none",
  };

  return (
    <div
      style={{
        fontFamily: FONT.family,
        minHeight: "100vh",
        background: COLORS.bg,
        backgroundImage:
          "radial-gradient(ellipse at 20% 50%, rgba(212,98,43,0.06) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(37,99,235,0.04) 0%, transparent 50%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobile ? "24px 16px" : "40px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          animation: "fadeInUp 0.4s ease",
        }}
      >
        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 500,
            color: COLORS.textMuted,
            marginBottom: 28,
            padding: "6px 0",
          }}
        >
          <ArrowLeft size={16} />
          Retour à l'accueil
        </button>

        {/* Card */}
        <div
          style={{
            padding: isMobile ? "32px 24px" : "40px 36px",
            borderRadius: RADIUS.xxl,
            background: COLORS.surface,
            border: `1px solid ${COLORS.borderLight}`,
            boxShadow: SHADOWS.elevated,
          }}
        >
          {/* Brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              justifyContent: "center",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 18,
                fontWeight: 800,
                boxShadow: SHADOWS.accent,
              }}
            >
              S
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.4 }}>
              Sama<span style={{ color: COLORS.accent }}>Commande</span>
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              textAlign: "center",
              fontSize: 22,
              fontWeight: 800,
              color: COLORS.text,
              marginBottom: 4,
              marginTop: 24,
              letterSpacing: -0.3,
            }}
          >
            {titles[mode]}
          </h1>
          <p
            style={{
              textAlign: "center",
              fontSize: 14,
              color: COLORS.textMuted,
              marginBottom: 28,
            }}
          >
            {subtitles[mode]}
          </p>

          {/* Error */}
          {error && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: RADIUS.sm,
                background: COLORS.dangerLight,
                color: COLORS.danger,
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 16,
                animation: "fadeIn 0.2s ease",
              }}
            >
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: RADIUS.sm,
                background: "#ecfdf5",
                color: "#065f46",
                fontSize: 13,
                fontWeight: 500,
                marginBottom: 16,
                animation: "fadeIn 0.2s ease",
              }}
            >
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Name (register only) */}
              {mode === "register" && (
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: COLORS.textSecondary,
                      marginBottom: 6,
                    }}
                  >
                    Nom complet
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={iconWrapStyle}>
                      <Mail size={16} />
                    </span>
                    <input
                      type="text"
                      placeholder="Fatou Diallo"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      style={inputStyle(false)}
                      onFocus={(e) => (e.target.style.borderColor = COLORS.accent)}
                      onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: COLORS.textSecondary,
                    marginBottom: 6,
                  }}
                >
                  Adresse email
                </label>
                <div style={{ position: "relative" }}>
                  <span style={iconWrapStyle}>
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    placeholder="vous@exemple.com"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    style={inputStyle(false)}
                    onFocus={(e) => (e.target.style.borderColor = COLORS.accent)}
                    onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
                  />
                </div>
              </div>

              {/* Password (not for forgot) */}
              {mode !== "forgot" && (
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: COLORS.textSecondary,
                      marginBottom: 6,
                    }}
                  >
                    Mot de passe
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={iconWrapStyle}>
                      <Lock size={16} />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      style={inputStyle(false)}
                      onFocus={(e) => (e.target.style.borderColor = COLORS.accent)}
                      onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: COLORS.textPlaceholder,
                        display: "flex",
                        padding: 2,
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm password (register only) */}
              {mode === "register" && (
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: COLORS.textSecondary,
                      marginBottom: 6,
                    }}
                  >
                    Confirmer le mot de passe
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={iconWrapStyle}>
                      <Lock size={16} />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={form.confirmPassword}
                      onChange={(e) => update("confirmPassword", e.target.value)}
                      style={inputStyle(false)}
                      onFocus={(e) => (e.target.style.borderColor = COLORS.accent)}
                      onBlur={(e) => (e.target.style.borderColor = COLORS.border)}
                    />
                  </div>
                </div>
              )}

              {/* Forgot password link */}
              {mode === "login" && (
                <div style={{ textAlign: "right", marginTop: -4 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setError("");
                      setSuccess("");
                    }}
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: COLORS.accent,
                    }}
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "13px 0",
                  fontSize: 15,
                  fontWeight: 700,
                  borderRadius: RADIUS.md,
                  background: loading
                    ? COLORS.textMuted
                    : `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
                  color: "#fff",
                  boxShadow: loading ? "none" : SHADOWS.accent,
                  marginTop: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading && (
                  <Loader
                    size={16}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                )}
                {mode === "login" && "Se connecter"}
                {mode === "register" && "Créer mon compte"}
                {mode === "forgot" && "Envoyer le lien"}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "24px 0",
            }}
          >
            <div style={{ flex: 1, height: 1, background: COLORS.borderLight }} />
            <span style={{ fontSize: 12, color: COLORS.textPlaceholder, fontWeight: 500 }}>ou</span>
            <div style={{ flex: 1, height: 1, background: COLORS.borderLight }} />
          </div>

          {/* Toggle mode */}
          <div style={{ textAlign: "center" }}>
            {mode === "login" && (
              <p style={{ fontSize: 14, color: COLORS.textMuted }}>
                Pas encore de compte ?{" "}
                <button
                  onClick={() => {
                    setMode("register");
                    setError("");
                    setSuccess("");
                  }}
                  style={{ color: COLORS.accent, fontWeight: 600, fontSize: 14 }}
                >
                  Créer un compte
                </button>
              </p>
            )}
            {mode === "register" && (
              <p style={{ fontSize: 14, color: COLORS.textMuted }}>
                Déjà un compte ?{" "}
                <button
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setSuccess("");
                  }}
                  style={{ color: COLORS.accent, fontWeight: 600, fontSize: 14 }}
                >
                  Se connecter
                </button>
              </p>
            )}
            {mode === "forgot" && (
              <p style={{ fontSize: 14, color: COLORS.textMuted }}>
                <button
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setSuccess("");
                  }}
                  style={{ color: COLORS.accent, fontWeight: 600, fontSize: 14 }}
                >
                  Retour à la connexion
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: COLORS.textPlaceholder,
            marginTop: 20,
          }}
        >
          En continuant, vous acceptez nos conditions d'utilisation.
        </p>
      </div>

      {/* Spin animation for loader */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
