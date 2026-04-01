import { useState } from "react";
import { COLORS, SHADOWS, RADIUS, FONT } from "../../constants/theme";
import useMediaQuery from "../../hooks/useMediaQuery";
import {
  ShoppingBag,
  BarChart3,
  MessageCircle,
  FileText,
  Shield,
  ArrowRight,
  Check,
  ChevronRight,
  Star,
  Zap,
  Users,
  Menu,
  X,
} from "lucide-react";

const FEATURES = [
  {
    Icon: ShoppingBag,
    title: "Gestion des commandes",
    desc: "Créez, suivez et gérez toutes vos commandes en un clic. Statuts en temps réel, recherche instantanée.",
    color: COLORS.accent,
    bg: COLORS.accentLight,
  },
  {
    Icon: BarChart3,
    title: "Tableau de bord intelligent",
    desc: "Visualisez vos KPIs : revenus, commandes en attente, panier moyen. Tout en un coup d'œil.",
    color: COLORS.blue,
    bg: COLORS.blueLight,
  },
  {
    Icon: MessageCircle,
    title: "WhatsApp automatique",
    desc: "Envoyez des confirmations et rappels à vos clients directement via WhatsApp.",
    color: COLORS.success,
    bg: COLORS.successLight,
  },
  {
    Icon: FileText,
    title: "Factures PDF",
    desc: "Générez des factures professionnelles en un clic avec vos informations et votre logo.",
    color: COLORS.warning,
    bg: COLORS.warningLight,
  },
  {
    Icon: Shield,
    title: "Données sécurisées",
    desc: "Vos données sont stockées de manière sécurisée. Accédez-y partout, à tout moment.",
    color: COLORS.danger,
    bg: COLORS.dangerLight,
  },
];

const TESTIMONIALS = [
  {
    name: "Fatou Diallo",
    role: "Graphiste freelance, Dakar",
    text: "SamaCommande m'a permis de passer de 5 à 20 clients par mois sans me perdre. Je ne pourrais plus m'en passer !",
  },
  {
    name: "Moussa Ndiaye",
    role: "Gérant, Ndiaye Enterprise",
    text: "L'envoi WhatsApp automatique a changé ma relation client. Mes clients adorent recevoir les confirmations instantanément.",
  },
  {
    name: "Aïssatou Ba",
    role: "Vidéaste, Saint-Louis",
    text: "Les factures PDF et le tableau de bord me font gagner 2h par jour. Un outil indispensable.",
  },
];

export default function LandingPage({ onLogin, onStart }) {
  const { isMobile, isTablet } = useMediaQuery();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      style={{
        fontFamily: FONT.family,
        color: COLORS.text,
        background: COLORS.bg,
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      {/* ─── Navbar ─── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(247, 245, 242, 0.85)",
          backdropFilter: "blur(16px) saturate(180%)",
          WebkitBackdropFilter: "blur(16px) saturate(180%)",
          borderBottom: `1px solid ${COLORS.borderLight}`,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: isMobile ? "14px 20px" : "14px 40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 11,
                background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 16,
                fontWeight: 800,
                boxShadow: SHADOWS.accent,
              }}
            >
              S
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.4 }}>
              Sama<span style={{ color: COLORS.accent }}>Commande</span>
            </span>
          </div>

          {isMobile ? (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ color: COLORS.text, padding: 4 }}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <a
                href="#features"
                style={{
                  padding: "8px 16px",
                  fontSize: 14,
                  fontWeight: 500,
                  color: COLORS.textSecondary,
                  textDecoration: "none",
                  borderRadius: RADIUS.sm,
                }}
              >
                Fonctionnalités
              </a>
              <a
                href="#pricing"
                style={{
                  padding: "8px 16px",
                  fontSize: 14,
                  fontWeight: 500,
                  color: COLORS.textSecondary,
                  textDecoration: "none",
                  borderRadius: RADIUS.sm,
                }}
              >
                Tarifs
              </a>
              <a
                href="#testimonials"
                style={{
                  padding: "8px 16px",
                  fontSize: 14,
                  fontWeight: 500,
                  color: COLORS.textSecondary,
                  textDecoration: "none",
                  borderRadius: RADIUS.sm,
                }}
              >
                Témoignages
              </a>
              <button
                onClick={onLogin}
                style={{
                  padding: "8px 20px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: COLORS.accent,
                  borderRadius: RADIUS.sm,
                  border: `1.5px solid ${COLORS.accent}`,
                  background: "transparent",
                  marginLeft: 8,
                }}
              >
                Connexion
              </button>
              <button
                onClick={onStart}
                style={{
                  padding: "9px 22px",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#fff",
                  borderRadius: RADIUS.sm,
                  background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
                  boxShadow: SHADOWS.accent,
                }}
              >
                Commencer gratuit
              </button>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {isMobile && mobileMenuOpen && (
          <div
            style={{
              padding: "12px 20px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              borderTop: `1px solid ${COLORS.borderLight}`,
              animation: "fadeInUp 0.2s ease",
            }}
          >
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: "10px 12px",
                fontSize: 14,
                fontWeight: 500,
                color: COLORS.textSecondary,
                textDecoration: "none",
                borderRadius: RADIUS.sm,
              }}
            >
              Fonctionnalités
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: "10px 12px",
                fontSize: 14,
                fontWeight: 500,
                color: COLORS.textSecondary,
                textDecoration: "none",
                borderRadius: RADIUS.sm,
              }}
            >
              Tarifs
            </a>
            <a
              href="#testimonials"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: "10px 12px",
                fontSize: 14,
                fontWeight: 500,
                color: COLORS.textSecondary,
                textDecoration: "none",
                borderRadius: RADIUS.sm,
              }}
            >
              Témoignages
            </a>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button
                onClick={onLogin}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  fontSize: 14,
                  fontWeight: 600,
                  color: COLORS.accent,
                  borderRadius: RADIUS.sm,
                  border: `1.5px solid ${COLORS.accent}`,
                  background: "transparent",
                }}
              >
                Connexion
              </button>
              <button
                onClick={onStart}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#fff",
                  borderRadius: RADIUS.sm,
                  background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
                  boxShadow: SHADOWS.accent,
                }}
              >
                Commencer
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ─── Hero ─── */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: isMobile ? "60px 20px 48px" : isTablet ? "80px 40px 60px" : "100px 40px 80px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 16px 6px 8px",
            borderRadius: RADIUS.pill,
            background: COLORS.accentLight,
            border: `1px solid ${COLORS.accentSubtle}`,
            fontSize: 13,
            fontWeight: 600,
            color: COLORS.accent,
            marginBottom: isMobile ? 24 : 32,
            animation: "fadeInUp 0.5s ease",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 24,
              height: 24,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
              color: "#fff",
            }}
          >
            <Zap size={12} />
          </span>
          Nouveau — Gestion simplifiée
        </div>

        <h1
          style={{
            fontSize: isMobile ? 32 : isTablet ? 44 : 56,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: -1.5,
            color: COLORS.text,
            marginBottom: isMobile ? 16 : 24,
            animation: "fadeInUp 0.5s ease 0.1s both",
          }}
        >
          Gérez vos commandes
          <br />
          <span
            style={{
              background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            simplement et efficacement
          </span>
        </h1>

        <p
          style={{
            fontSize: isMobile ? 16 : 19,
            lineHeight: 1.6,
            color: COLORS.textSecondary,
            maxWidth: 620,
            margin: "0 auto",
            marginBottom: isMobile ? 32 : 40,
            animation: "fadeInUp 0.5s ease 0.2s both",
          }}
        >
          L'outil tout-en-un pour les entrepreneurs sénégalais. Commandes, factures, WhatsApp, analytics
          et IA — tout ce dont vous avez besoin pour faire grandir votre activité.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: 12,
            justifyContent: "center",
            alignItems: "center",
            animation: "fadeInUp 0.5s ease 0.3s both",
          }}
        >
          <button
            onClick={onStart}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: isMobile ? "14px 28px" : "14px 32px",
              fontSize: 16,
              fontWeight: 700,
              color: "#fff",
              borderRadius: RADIUS.lg,
              background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
              boxShadow: SHADOWS.accentLg,
              width: isMobile ? "100%" : "auto",
              justifyContent: "center",
            }}
          >
            Commencer gratuitement
            <ArrowRight size={18} />
          </button>
          <button
            onClick={onLogin}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: isMobile ? "14px 28px" : "14px 32px",
              fontSize: 16,
              fontWeight: 600,
              color: COLORS.textSecondary,
              borderRadius: RADIUS.lg,
              background: COLORS.surface,
              border: `1.5px solid ${COLORS.border}`,
              boxShadow: SHADOWS.sm,
              width: isMobile ? "100%" : "auto",
              justifyContent: "center",
            }}
          >
            J'ai déjà un compte
          </button>
        </div>

        {/* Trust indicators */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: isMobile ? 16 : 32,
            marginTop: isMobile ? 32 : 48,
            flexWrap: "wrap",
            animation: "fadeInUp 0.5s ease 0.4s both",
          }}
        >
          {[
            { icon: <Users size={16} />, text: "500+ entrepreneurs" },
            { icon: <Star size={16} />, text: "4.9/5 satisfaction" },
            { icon: <Shield size={16} />, text: "Données sécurisées" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 500,
                color: COLORS.textMuted,
              }}
            >
              <span style={{ color: COLORS.accent, display: "flex" }}>{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>
      </section>

      {/* ─── Dashboard Preview ─── */}
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: isMobile ? "0 20px 60px" : "0 40px 80px",
        }}
      >
        <div
          style={{
            borderRadius: isMobile ? RADIUS.lg : RADIUS.xxl,
            border: `1px solid ${COLORS.border}`,
            boxShadow: SHADOWS.xl,
            overflow: "hidden",
            background: COLORS.surface,
            position: "relative",
          }}
        >
          {/* Fake browser bar */}
          <div
            style={{
              padding: "12px 16px",
              background: COLORS.surfaceAlt,
              borderBottom: `1px solid ${COLORS.borderLight}`,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", gap: 6 }}>
              {["#FF5F57", "#FEBC2E", "#28C840"].map((c, i) => (
                <div
                  key={i}
                  style={{ width: 10, height: 10, borderRadius: 5, background: c }}
                />
              ))}
            </div>
            <div
              style={{
                flex: 1,
                maxWidth: 360,
                margin: "0 auto",
                height: 28,
                borderRadius: 8,
                background: COLORS.surface,
                border: `1px solid ${COLORS.borderLight}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                color: COLORS.textMuted,
              }}
            >
              samacommande.app
            </div>
          </div>
          {/* Dashboard mockup content */}
          <div style={{ padding: isMobile ? 16 : 32 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : isTablet
                  ? "1fr 1fr"
                  : "1fr 1fr 1fr 1fr",
                gap: 12,
                marginBottom: 16,
              }}
            >
              {[
                { label: "Revenus du mois", value: "2 450 000 F", change: "+12%", color: COLORS.accent },
                { label: "Commandes en attente", value: "8", change: "3 urgentes", color: COLORS.warning },
                { label: "Commandes totales", value: "47", change: "+5 ce mois", color: COLORS.blue },
                { label: "Panier moyen", value: "520 000 F", change: "+8%", color: COLORS.success },
              ].map((card, i) => (
                <div
                  key={i}
                  style={{
                    padding: "16px 18px",
                    borderRadius: RADIUS.lg,
                    border: `1px solid ${COLORS.borderLight}`,
                    background: COLORS.surface,
                  }}
                >
                  <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 500, marginBottom: 6 }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.text, letterSpacing: -0.5 }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: card.color, marginTop: 4 }}>
                    {card.change}
                  </div>
                </div>
              ))}
            </div>
            {/* Fake chart area */}
            <div
              style={{
                height: isMobile ? 100 : 140,
                borderRadius: RADIUS.lg,
                background: `linear-gradient(135deg, ${COLORS.accentLight}, ${COLORS.blueLight})`,
                border: `1px solid ${COLORS.borderLight}`,
                display: "flex",
                alignItems: "flex-end",
                padding: "0 20px 16px",
                gap: isMobile ? 6 : 12,
              }}
            >
              {[35, 42, 28, 65, 50, 72, 60, 85, 45, 90, 78, 95].map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${h}%`,
                    borderRadius: "4px 4px 0 0",
                    background: `linear-gradient(to top, ${COLORS.accent}88, ${COLORS.accent})`,
                    opacity: 0.7 + i * 0.025,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section
        id="features"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: isMobile ? "48px 20px" : "80px 40px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: isMobile ? 40 : 56 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 14px",
              borderRadius: RADIUS.pill,
              background: COLORS.blueLight,
              fontSize: 12,
              fontWeight: 600,
              color: COLORS.blue,
              marginBottom: 16,
            }}
          >
            <Zap size={12} />
            Fonctionnalités
          </div>
          <h2
            style={{
              fontSize: isMobile ? 26 : 36,
              fontWeight: 800,
              letterSpacing: -0.8,
              marginBottom: 12,
            }}
          >
            Tout pour gérer votre activité
          </h2>
          <p
            style={{
              fontSize: isMobile ? 15 : 17,
              color: COLORS.textSecondary,
              maxWidth: 500,
              margin: "0 auto",
              lineHeight: 1.5,
            }}
          >
            Des outils pensés pour les entrepreneurs qui veulent se concentrer sur leur métier.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "1fr 1fr 1fr",
            gap: isMobile ? 16 : 20,
          }}
        >
          {FEATURES.map((f, i) => (
            <div
              key={i}
              style={{
                padding: isMobile ? "24px 20px" : "28px 24px",
                borderRadius: RADIUS.xl,
                background: COLORS.surface,
                border: `1px solid ${COLORS.borderLight}`,
                boxShadow: SHADOWS.sm,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = SHADOWS.lg;
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = SHADOWS.sm;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 13,
                  background: f.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: f.color,
                  marginBottom: 16,
                }}
              >
                <f.Icon size={20} strokeWidth={1.8} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: COLORS.textSecondary, lineHeight: 1.55 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section
        id="pricing"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: isMobile ? "48px 20px" : "80px 40px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: isMobile ? 40 : 56 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 14px",
              borderRadius: RADIUS.pill,
              background: COLORS.successLight,
              fontSize: 12,
              fontWeight: 600,
              color: COLORS.success,
              marginBottom: 16,
            }}
          >
            <Star size={12} />
            Tarifs
          </div>
          <h2
            style={{
              fontSize: isMobile ? 26 : 36,
              fontWeight: 800,
              letterSpacing: -0.8,
              marginBottom: 12,
            }}
          >
            Simple et transparent
          </h2>
          <p
            style={{
              fontSize: isMobile ? 15 : 17,
              color: COLORS.textSecondary,
              maxWidth: 460,
              margin: "0 auto",
            }}
          >
            Commencez gratuitement, passez Pro quand vous êtes prêt.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: 20,
            maxWidth: 780,
            margin: "0 auto",
          }}
        >
          {/* Starter */}
          <div
            style={{
              padding: isMobile ? "28px 24px" : "32px 28px",
              borderRadius: RADIUS.xxl,
              background: COLORS.surface,
              border: `1.5px solid ${COLORS.border}`,
              boxShadow: SHADOWS.sm,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.textMuted, marginBottom: 4 }}>
              Starter
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
              <span style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>Gratuit</span>
            </div>
            <p style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 24 }}>
              Pour démarrer et tester la plateforme
            </p>
            <button
              onClick={onStart}
              style={{
                width: "100%",
                padding: "12px 0",
                fontSize: 14,
                fontWeight: 600,
                borderRadius: RADIUS.md,
                background: COLORS.surfaceAlt,
                color: COLORS.text,
                border: `1.5px solid ${COLORS.border}`,
                marginBottom: 24,
              }}
            >
              Commencer gratuitement
            </button>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "Jusqu'à 10 commandes",
                "3 articles max par commande",
                "KPIs du tableau de bord",
                "Recherche et filtres",
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: COLORS.textSecondary }}>
                  <Check size={15} style={{ color: COLORS.success, flexShrink: 0 }} />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Pro */}
          <div
            style={{
              padding: isMobile ? "28px 24px" : "32px 28px",
              borderRadius: RADIUS.xxl,
              background: COLORS.surface,
              border: `2px solid ${COLORS.accent}`,
              boxShadow: SHADOWS.accentLg,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -12,
                right: 20,
                padding: "4px 14px",
                borderRadius: RADIUS.pill,
                background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.3,
              }}
            >
              Populaire
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.accent, marginBottom: 4 }}>
              Pro
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
              <span style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>5 000 F</span>
              <span style={{ fontSize: 14, color: COLORS.textMuted, fontWeight: 500 }}>/ mois</span>
            </div>
            <p style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 24 }}>
              Pour les pros qui veulent tout maîtriser
            </p>
            <button
              onClick={onStart}
              style={{
                width: "100%",
                padding: "12px 0",
                fontSize: 14,
                fontWeight: 700,
                borderRadius: RADIUS.md,
                background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
                color: "#fff",
                boxShadow: SHADOWS.accent,
                marginBottom: 24,
              }}
            >
              Essayer Pro
            </button>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "Commandes illimitées",
                "Articles illimités",
                "WhatsApp automatique",
                "Graphiques avancés",
                "Factures PDF",
                "Export CSV",
                "Support prioritaire",
              ].map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: COLORS.textSecondary }}>
                  <Check size={15} style={{ color: COLORS.accent, flexShrink: 0 }} />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section
        id="testimonials"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: isMobile ? "48px 20px" : "80px 40px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: isMobile ? 40 : 56 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 14px",
              borderRadius: RADIUS.pill,
              background: COLORS.warningLight,
              fontSize: 12,
              fontWeight: 600,
              color: COLORS.warning,
              marginBottom: 16,
            }}
          >
            <Users size={12} />
            Témoignages
          </div>
          <h2
            style={{
              fontSize: isMobile ? 26 : 36,
              fontWeight: 800,
              letterSpacing: -0.8,
              marginBottom: 12,
            }}
          >
            Ils nous font confiance
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr" : "1fr 1fr 1fr",
            gap: 20,
          }}
        >
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              style={{
                padding: "24px",
                borderRadius: RADIUS.xl,
                background: COLORS.surface,
                border: `1px solid ${COLORS.borderLight}`,
                boxShadow: SHADOWS.sm,
              }}
            >
              <div style={{ display: "flex", gap: 3, marginBottom: 14 }}>
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={14} fill={COLORS.warning} color={COLORS.warning} />
                ))}
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: COLORS.textSecondary,
                  lineHeight: 1.6,
                  marginBottom: 18,
                  fontStyle: "italic",
                }}
              >
                "{t.text}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: `linear-gradient(135deg, ${COLORS.accentLight}, ${COLORS.accentSubtle})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: COLORS.accent,
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {t.name[0]}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: isMobile ? "48px 20px" : "80px 40px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: isMobile ? "40px 24px" : "64px 48px",
            borderRadius: RADIUS.xxl,
            background: `linear-gradient(135deg, ${COLORS.text} 0%, #2D2520 100%)`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "radial-gradient(ellipse at 30% 20%, rgba(212,98,43,0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(212,98,43,0.1) 0%, transparent 50%)",
              pointerEvents: "none",
            }}
          />
          <h2
            style={{
              fontSize: isMobile ? 26 : 36,
              fontWeight: 800,
              color: "#fff",
              letterSpacing: -0.8,
              marginBottom: 12,
              position: "relative",
            }}
          >
            Prêt à simplifier votre gestion ?
          </h2>
          <p
            style={{
              fontSize: isMobile ? 15 : 17,
              color: "rgba(255,255,255,0.65)",
              maxWidth: 460,
              margin: "0 auto",
              marginBottom: 28,
              position: "relative",
            }}
          >
            Rejoignez des centaines d'entrepreneurs qui gèrent leurs commandes plus efficacement.
          </p>
          <button
            onClick={onStart}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 32px",
              fontSize: 16,
              fontWeight: 700,
              color: COLORS.text,
              borderRadius: RADIUS.lg,
              background: "#fff",
              boxShadow: SHADOWS.lg,
              position: "relative",
            }}
          >
            Commencer maintenant
            <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: isMobile ? "32px 20px" : "40px 40px",
          borderTop: `1px solid ${COLORS.borderLight}`,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            S
          </div>
          <span style={{ fontSize: 14, fontWeight: 600 }}>
            Sama<span style={{ color: COLORS.accent }}>Commande</span>
          </span>
        </div>
        <div style={{ fontSize: 13, color: COLORS.textMuted }}>
          © 2026 SamaCommande. Fait avec passion à Dakar.
        </div>
      </footer>
    </div>
  );
}
