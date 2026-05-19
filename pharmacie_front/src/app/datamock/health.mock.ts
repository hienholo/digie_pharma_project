import { Heart, Activity, CheckCircle2, AlertCircle } from "lucide-react";

export const mockVitals = [
  { label: "Rythme cardiaque", value: "74",   unit: "BPM",   icon: Heart,         color: "#EF4444", bg: "#FEE2E2", status: "Normal",      statusOk: true  },
  { label: "Tension artérielle", value: "12/8", unit: "cmHg", icon: Activity,      color: "#2563EB", bg: "#DBEAFE", status: "Normal",      statusOk: true  },
  { label: "Poids",              value: "72",   unit: "kg",   icon: CheckCircle2,  color: "#059669", bg: "#DCFCE7", status: "Stable",      statusOk: true  },
  { label: "Glycémie",           value: "0.95", unit: "g/L",  icon: AlertCircle,   color: "#D97706", bg: "#FEF3C7", status: "À surveiller", statusOk: false },
];

export const mockReminders = [
  { name: "Doliprane 1000mg",   dose: "1 comprimé", time: "08h00", taken: true  },
  { name: "Amoxicilline 500mg", dose: "1 gélule",   time: "12h00", taken: true  },
  { name: "Vitamine D3",        dose: "1 comprimé", time: "20h00", taken: false },
];

export const mockPrescriptions = [
  {
    id: "ORD-001",
    doctor: "Dr. Konan",
    date: "10 mai 2026",
    drugs: ["Doliprane 1000mg", "Amoxicilline 500mg"],
    expires: "10 juin 2026",
    active: true,
  },
  {
    id: "ORD-002",
    doctor: "Dr. Coulibaly",
    date: "2 avr. 2026",
    drugs: ["Vitamine D3"],
    expires: "2 mai 2026",
    active: false,
  },
];
