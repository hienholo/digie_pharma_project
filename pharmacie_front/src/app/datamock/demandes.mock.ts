// Entités Demande et DemandePharmacieReponse — MCD LAHFIA

export type Demande_Type = "LIVRAISON" | "A_LA_LIVRAISON";
export type Demande_Statut = "DEMANDE_ENVOYEE" | "REPONSE_RECUE" | "ANNULEE";
export type DemandePharmacieReponse_Reponse = "PARTIEL" | "ACCEPTEE" | "REFUSEE";

export interface Demande {
  id: string;
  patientId: string;
  ordonnanceId?: string;
  type: Demande_Type;
  statut: Demande_Statut;
  adresseLivraison: string;
  medicaments: string[];
  createdAt: string;
}

export interface DemandePharmacieReponse {
  id: string;
  demandeId: string;
  pharmacieId: string;
  reponse: DemandePharmacieReponse_Reponse;
  detailPartiel?: string;
  prixTotal: number;
  reponduAt: string;
}

export const mockDemandes: Demande[] = [
  {
    id: "dem-001",
    patientId: "pat-001",
    ordonnanceId: "ord-001",
    type: "LIVRAISON",
    statut: "REPONSE_RECUE",
    adresseLivraison: "Résidence Les Palmiers, Bâtiment C, Apt 12, Cocody, Abidjan",
    medicaments: ["Doliprane 1000mg", "Vitamine D3"],
    createdAt: "2026-05-03T08:10:00Z",
  },
  {
    id: "dem-002",
    patientId: "pat-002",
    ordonnanceId: "ord-002",
    type: "A_LA_LIVRAISON",
    statut: "DEMANDE_ENVOYEE",
    adresseLivraison: "Cité Sicogi, Tour B, Apt 34, Yopougon, Abidjan",
    medicaments: ["Amoxicilline 500mg", "Paracétamol 500mg"],
    createdAt: "2026-05-10T10:00:00Z",
  },
  {
    id: "dem-003",
    patientId: "pat-003",
    type: "LIVRAISON",
    statut: "ANNULEE",
    adresseLivraison: "Villa 15, Rue des Jardins, Marcory, Abidjan",
    medicaments: ["Aspirine 500mg", "Vitamine C 500mg"],
    createdAt: "2026-05-12T13:00:00Z",
  },
];

// Réponse de pha-001 (Pharmacie du Plateau) à dem-001 — disponibilité complète
export const mockReponses: DemandePharmacieReponse[] = [
  {
    id: "rep-001",
    demandeId: "dem-001",
    pharmacieId: "pha-001",
    reponse: "ACCEPTEE",
    prixTotal: 870,
    reponduAt: "2026-05-03T08:35:00Z",
  },
];
