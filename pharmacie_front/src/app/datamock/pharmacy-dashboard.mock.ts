// Format UI — compatible PharmacyDashboard / RequestList / InventoryPanel
export type Request = {
  id: string;
  patientName: string;
  items: string[];
  address: string;
  type: "pickup" | "delivery";
  status: "pending" | "confirmed" | "rejected" | "completed";
  timestamp: Date;
  prescription?: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  price: number;
};

export const mockRequests: Request[] = [
  {
    id: "dem-001",
    patientName: "Konan Kouassi",
    items: ["Doliprane 1000mg", "Vitamine D3"],
    address: "Résidence Les Palmiers, Bâtiment C, Apt 12, Cocody, Abidjan",
    type: "delivery",
    status: "confirmed",
    timestamp: new Date("2026-05-03T09:15:00Z"),
    prescription: "https://via.placeholder.com/300x400",
  },
  {
    id: "dem-002",
    patientName: "Adjoua Bamba",
    items: ["Amoxicilline 500mg", "Paracétamol 500mg"],
    address: "Cité Sicogi, Tour B, Apt 34, Yopougon, Abidjan",
    type: "pickup",
    status: "pending",
    timestamp: new Date("2026-05-10T10:30:00Z"),
  },
  {
    id: "dem-003",
    patientName: "Yao Kouamé",
    items: ["Aspirine 500mg", "Vitamine C 500mg"],
    address: "Villa 15, Rue des Jardins, Marcory, Abidjan",
    type: "pickup",
    status: "rejected",
    timestamp: new Date("2026-05-12T14:00:00Z"),
  },
];

export const mockInventory: InventoryItem[] = [
  { id: "mdc-001", name: "Doliprane 1000mg",    stock: 45, minStock: 20, price: 1200 },
  { id: "mdc-002", name: "Amoxicilline 500mg",  stock: 12, minStock: 15, price: 4500 },
  { id: "mdc-003", name: "Vitamine D3",         stock: 30, minStock: 10, price: 3500 },
  { id: "mdc-004", name: "Aspirine 500mg",      stock: 67, minStock: 25, price: 800  },
  { id: "mdc-005", name: "Paracétamol 500mg",   stock: 89, minStock: 30, price: 900  },
  { id: "mdc-006", name: "Vitamine C 500mg",    stock: 5,  minStock: 10, price: 1500 },
];
