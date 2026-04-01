import { COLORS } from "./theme";

export const ORDER_STATUS = {
  pending: {
    label: "En attente",
    color: COLORS.warning,
    bg: COLORS.warningLight,
    icon: "Clock",
    step: 0,
    next: ["confirmed", "cancelled"],
    actionLabel: "Mettre en attente",
  },
  confirmed: {
    label: "Confirmée",
    color: COLORS.blue,
    bg: COLORS.blueLight,
    icon: "CircleCheck",
    step: 1,
    next: ["completed", "cancelled"],
    actionLabel: "Confirmer",
  },
  completed: {
    label: "Terminée",
    color: COLORS.success,
    bg: COLORS.successLight,
    icon: "PackageCheck",
    step: 2,
    next: [],
    actionLabel: "Terminer",
  },
  cancelled: {
    label: "Annulée",
    color: COLORS.danger,
    bg: COLORS.dangerLight,
    icon: "XCircle",
    step: -1,
    next: ["pending"],
    actionLabel: "Annuler",
  },
};

// Linear progression steps (excluding cancelled)
export const STATUS_STEPS = ["pending", "confirmed", "completed"];

export const MONTHS_FR = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc",
];
