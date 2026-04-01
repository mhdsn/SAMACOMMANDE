import { ORDER_STATUS } from "../../constants/status";
import { Clock, CircleCheck, PackageCheck, XCircle } from "lucide-react";

const STATUS_ICONS = { Clock, CircleCheck, PackageCheck, XCircle };

export default function Badge({ status }) {
  const config = ORDER_STATUS[status];
  if (!config) return null;

  const Icon = STATUS_ICONS[config.icon];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "4px 10px",
        borderRadius: 100,
        fontSize: 11,
        fontWeight: 600,
        color: config.color,
        background: config.bg,
        lineHeight: "16px",
        letterSpacing: -0.1,
        border: `1px solid ${config.color}20`,
      }}
    >
      {Icon && <Icon size={12} strokeWidth={2.2} />}
      {config.label}
    </span>
  );
}
