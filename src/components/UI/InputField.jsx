import { COLORS } from "../../constants/theme";

export default function InputField({ label, ...props }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {label && (
        <label
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 600,
            color: COLORS.textSecondary,
            marginBottom: 7,
            letterSpacing: -0.1,
          }}
        >
          {label}
        </label>
      )}
      <input
        {...props}
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
          ...(props.style || {}),
        }}
        onFocus={(e) => {
          e.target.style.borderColor = COLORS.accent;
          e.target.style.boxShadow = `0 0 0 3px ${COLORS.accentSubtle}`;
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.target.style.borderColor = COLORS.border;
          e.target.style.boxShadow = "none";
          props.onBlur?.(e);
        }}
      />
    </div>
  );
}
