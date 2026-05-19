// Format UI — compatible DeliveryDashboard
export type Delivery = {
  id: string;
  orderId: string;
  pharmacy: string;
  pharmacyAddress: string;
  customerName: string;
  customerAddress: string;
  items: string[];
  status: "assigned" | "picked-up" | "delivering" | "delivered";
  assignedAt: Date;
};

export const mockDeliveries: Delivery[] = [
  {
    id: "lv-001",
    orderId: "cmd-001",
    pharmacy: "Pharmacie du Plateau",
    pharmacyAddress: "23 Boulevard de la République, Plateau, Abidjan",
    customerName: "Konan Kouassi",
    customerAddress: "Résidence Les Palmiers, Bâtiment C, Apt 12, Cocody, Abidjan",
    items: ["Doliprane 1000mg", "Vitamine D3"],
    status: "delivered",
    assignedAt: new Date("2026-05-03T10:00:00Z"),
  },
  {
    id: "lv-002",
    orderId: "cmd-002",
    pharmacy: "Pharmacie de l'Espérance",
    pharmacyAddress: "Cité Sicogi, Bloc B, Yopougon, Abidjan",
    customerName: "Adjoua Bamba",
    customerAddress: "Cité Sicogi, Tour B, Apt 34, Yopougon, Abidjan",
    items: ["Amoxicilline 500mg", "Paracétamol 500mg"],
    status: "delivering",
    assignedAt: new Date("2026-05-10T11:30:00Z"),
  },
];
