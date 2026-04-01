import { COLORS, SHADOWS } from "../../constants/theme";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children, isMobile }) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(26,22,18,0.5)",
        backdropFilter: "blur(12px) saturate(150%)",
        WebkitBackdropFilter: "blur(12px) saturate(150%)",
        display: "flex",
        alignItems: isMobile ? "flex-end" : "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: isMobile ? 0 : 20,
        animation: "fadeIn 0.15s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: COLORS.surface,
          borderRadius: isMobile ? "24px 24px 0 0" : 22,
          padding: isMobile ? "20px 20px 28px" : "32px 36px",
          width: "100%",
          maxWidth: isMobile ? "100%" : 640,
          maxHeight: isMobile ? "92vh" : "88vh",
          overflow: "auto",
          boxShadow: SHADOWS.elevated,
          animation: isMobile
            ? "slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            : "scaleIn 0.2s ease",
        }}
      >
        {isMobile && (
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: COLORS.border,
              margin: "0 auto 16px",
            }}
          />
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 28,
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 700, color: COLORS.text, letterSpacing: -0.3 }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: COLORS.surfaceAlt,
              width: 34,
              height: 34,
              borderRadius: 10,
              color: COLORS.textMuted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = COLORS.dangerLight;
              e.currentTarget.style.color = COLORS.danger;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = COLORS.surfaceAlt;
              e.currentTarget.style.color = COLORS.textMuted;
            }}
          >
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
