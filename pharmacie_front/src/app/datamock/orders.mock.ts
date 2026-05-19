// Format UI — compatible PatientSpace
export interface MockOrder {
  id: string;
  date: string;
  pharmacy: string;
  items: string[];
  total: number;
  status: string;
  statusColor: string;
}

export const mockOrders: MockOrder[] = [
  {
    id: "cmd-001",
    date: "3 mai 2026",
    pharmacy: "Pharmacie du Plateau",
    items: ["Doliprane 1000mg", "Vitamine D3"],
    total: 870,
    status: "Livré",
    statusColor: "#10B981",
  },
  {
    id: "cmd-002",
    date: "10 mai 2026",
    pharmacy: "Pharmacie de l'Espérance",
    items: ["Amoxicilline 500mg", "Paracétamol 500mg"],
    total: 990,
    status: "Prête au retrait",
    statusColor: "#2563EB",
  },
];
