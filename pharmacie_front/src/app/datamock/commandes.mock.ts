// Entités Commande et CommandeMedicament — MCD LAHFIA

export type Commande_ModeObtention = "LIVRAISON" | "RETRAIT";
export type Commande_ModePaiement = "ESPECES" | "CARTE";
export type Commande_Statut =
  | "COMMANDE_VALIDEE"
  | "EN_PREPARATION"
  | "COMMANDE_PRETE"
  | "EN_LIVRAISON"
  | "LIVREE"
  | "RETRAIT_PRET"
  | "TERMINEE";

export interface Commande {
  id: string;
  patientId: string;
  pharmacieId: string;
  demandeId: string;
  modeObtention: Commande_ModeObtention;
  modePaiement: Commande_ModePaiement;
  statut: Commande_Statut;
  montantTotal: number;
  adresseLivraison?: string;
  createdAt: string;
}

export interface CommandeMedicament {
  commandeId: string;
  medicamentId: string;
  quantite: number;
  posologie: string;
}

export const mockCommandes: Commande[] = [
  {
    id: "cmd-001",
    patientId: "pat-001",
    pharmacieId: "pha-001",
    demandeId: "dem-001",
    modeObtention: "LIVRAISON",
    modePaiement: "ESPECES",
    statut: "LIVREE",
    montantTotal: 870,
    adresseLivraison: "Résidence Les Palmiers, Bâtiment C, Apt 12, Cocody, Abidjan",
    createdAt: "2026-05-03T08:45:00Z",
  },
  {
    id: "cmd-002",
    patientId: "pat-002",
    pharmacieId: "pha-002",
    demandeId: "dem-002",
    modeObtention: "RETRAIT",
    modePaiement: "CARTE",
    statut: "COMMANDE_PRETE",
    montantTotal: 990,
    createdAt: "2026-05-10T11:00:00Z",
  },
];

export const mockCommandeMedicaments: CommandeMedicament[] = [
  // cmd-001 : Doliprane 1000mg (14u) + Vitamine D3 (30u)
  {
    commandeId: "cmd-001",
    medicamentId: "mdc-001",
    quantite: 14,
    posologie: "1 comprimé matin et soir",
  },
  {
    commandeId: "cmd-001",
    medicamentId: "mdc-003",
    quantite: 30,
    posologie: "1 comprimé le matin",
  },
  // cmd-002 : Amoxicilline 500mg (21u) + Paracétamol 500mg (20u)
  {
    commandeId: "cmd-002",
    medicamentId: "mdc-002",
    quantite: 21,
    posologie: "1 gélule 3 fois par jour",
  },
  {
    commandeId: "cmd-002",
    medicamentId: "mdc-005",
    quantite: 20,
    posologie: "1 comprimé toutes les 6 heures si douleur",
  },
];
