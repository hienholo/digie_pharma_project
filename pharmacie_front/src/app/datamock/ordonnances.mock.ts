// Entités Ordonnance et OrdonnanceMedicament — MCD LAHFIA

export type Ordonnance_Source = "UPLOAD" | "NUMERIQUE";
export type Ordonnance_Statut = "EN_ATTENTE_OCR" | "ANALYSEE" | "CORRIGEE";

export interface Ordonnance {
  id: string;
  patientId: string;
  source: Ordonnance_Source;
  statut: Ordonnance_Statut;
  imageUrl: string;
  corrigeManuellement: boolean;
  createdAt: string;
}

export interface OrdonnanceMedicament {
  ordonnanceId: string;
  medicamentId: string;
  posologie: string;
  duree: string;
  quantite: string;
}

export const mockOrdonnances: Ordonnance[] = [
  {
    id: "ord-001",
    patientId: "pat-001",
    source: "UPLOAD",
    statut: "ANALYSEE",
    imageUrl: "https://via.placeholder.com/600x800?text=Ordonnance+Konan",
    corrigeManuellement: false,
    createdAt: "2026-05-03T08:00:00Z",
  },
  {
    id: "ord-002",
    patientId: "pat-002",
    source: "NUMERIQUE",
    statut: "CORRIGEE",
    imageUrl: "https://via.placeholder.com/600x800?text=Ordonnance+Adjoua",
    corrigeManuellement: true,
    createdAt: "2026-05-10T09:30:00Z",
  },
];

export const mockOrdonnanceMedicaments: OrdonnanceMedicament[] = [
  // ord-001 : Doliprane + Vitamine D3
  {
    ordonnanceId: "ord-001",
    medicamentId: "mdc-001",
    posologie: "1 comprimé matin et soir",
    duree: "7 jours",
    quantite: "14",
  },
  {
    ordonnanceId: "ord-001",
    medicamentId: "mdc-003",
    posologie: "1 comprimé le matin",
    duree: "30 jours",
    quantite: "30",
  },
  // ord-002 : Amoxicilline + Paracétamol 500mg
  {
    ordonnanceId: "ord-002",
    medicamentId: "mdc-002",
    posologie: "1 gélule 3 fois par jour",
    duree: "7 jours",
    quantite: "21",
  },
  {
    ordonnanceId: "ord-002",
    medicamentId: "mdc-005",
    posologie: "1 comprimé toutes les 6 heures si douleur",
    duree: "5 jours",
    quantite: "20",
  },
];
