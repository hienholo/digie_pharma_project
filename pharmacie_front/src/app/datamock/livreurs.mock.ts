// Entité Livreur — MCD LAHFIA

export type Livreur_TypeAffiliation = "PARTENAIRE" | "INDEPENDANT";
export type Livreur_DisponibiliteStatut = "DISPONIBLE" | "NON_DISPONIBLE" | "EN_COURSE";
export type Livreur_Statut = "ACTIF" | "SUSPENDU" | "EN_ATTENTE_VALIDATION";

export interface Livreur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  numeroIdentite: string;
  typeAffiliation: Livreur_TypeAffiliation;
  disponibiliteStatut: Livreur_DisponibiliteStatut;
  statut: Livreur_Statut;
  latitude: number;
  longitude: number;
}

export const mockLivreurs: Livreur[] = [
  {
    id: "livr-001",
    nom: "Traoré",
    prenom: "Souleymane",
    email: "souleymane.traore@lahfia.ci",
    telephone: "+225 07 78 91 23 45",
    numeroIdentite: "CI19870012345678",
    typeAffiliation: "PARTENAIRE",
    disponibiliteStatut: "DISPONIBLE",
    statut: "ACTIF",
    latitude: 5.3450,
    longitude: -4.0050,
  },
  {
    id: "livr-002",
    nom: "Koné",
    prenom: "Jean-Baptiste",
    email: "jeanbaptiste.kone@lahfia.ci",
    telephone: "+225 05 45 67 89 01",
    numeroIdentite: "CI19920098765432",
    typeAffiliation: "INDEPENDANT",
    disponibiliteStatut: "EN_COURSE",
    statut: "ACTIF",
    latitude: 5.3333,
    longitude: -4.0833,
  },
];
