// Entité Livraison — MCD LAHFIA

export type Livraison_Statut =
  | "EN_ATTENTE_LIVREUR"
  | "ASSIGNEE"
  | "EN_COURS"
  | "LIVREE"
  | "ECHEC";

export interface Livraison {
  id: string;
  commandeId: string;
  livreurId?: string;
  statut: Livraison_Statut;
  assigneeAt?: string;
  priseEnChargeAt?: string;
  livreeAt?: string;
  noteLivraison?: string;
  latitude?: number;
  longitude?: number;
}

export const mockLivraisons: Livraison[] = [
  {
    id: "lv-001",
    commandeId: "cmd-001",
    livreurId: "livr-001",
    statut: "LIVREE",
    assigneeAt: "2026-05-03T10:00:00Z",
    priseEnChargeAt: "2026-05-03T10:20:00Z",
    livreeAt: "2026-05-03T11:05:00Z",
    noteLivraison: "Livraison effectuée sans incident. Client présent.",
    latitude: 5.3553,
    longitude: -3.9988,
  },
  {
    id: "lv-002",
    commandeId: "cmd-002",
    livreurId: "livr-002",
    statut: "EN_COURS",
    assigneeAt: "2026-05-10T11:30:00Z",
    priseEnChargeAt: "2026-05-10T11:55:00Z",
    latitude: 5.3333,
    longitude: -4.0833,
  },
];
