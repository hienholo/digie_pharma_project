// Entités Medecin et DisponibiliteMedecin — MCD LAHFIA

export type Medecin_Specialite =
  | "GENERALISTE"
  | "CARDIOLOGUE"
  | "DERMATOLOGUE"
  | "GYNECOLOGUE"
  | "NEUROLOGUE"
  | "OPHTALMOLOGUE"
  | "ORL"
  | "PEDIATRE"
  | "PNEUMOLOGUE"
  | "AUTRE";

export type Medecin_Statut = "ACTIF" | "SUSPENDU" | "EN_ATTENTE_VALIDATION";

export type DayOfWeek =
  | "LUNDI"
  | "MARDI"
  | "MERCREDI"
  | "JEUDI"
  | "VENDREDI"
  | "SAMEDI"
  | "DIMANCHE";

export interface Medecin {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  specialite: Medecin_Specialite;
  numeroOrdre: string;
  adresseCabinet: string;
  statut: Medecin_Statut;
  latitude: number;
  longitude: number;
}

export interface DisponibiliteMedecin {
  id: string;
  medecinId: string;
  jourSemaine: DayOfWeek;
  heureDebut: string;
  heureFin: string;
  actif: boolean;
}

export const mockMedecins: Medecin[] = [
  {
    id: "med-001",
    nom: "Konan",
    prenom: "Brou",
    email: "brou.konan@lahfia.ci",
    telephone: "+225 27 22 63 44 55",
    specialite: "GENERALISTE",
    numeroOrdre: "CI-MED-12345",
    adresseCabinet: "23 Boulevard de la République, Plateau, Abidjan",
    statut: "ACTIF",
    latitude: 5.3196,
    longitude: -4.0167,
  },
  {
    id: "med-002",
    nom: "Diomandé",
    prenom: "Marie-Claire",
    email: "mclaire.diomande@lahfia.ci",
    telephone: "+225 27 22 54 88 99",
    specialite: "CARDIOLOGUE",
    numeroOrdre: "CI-MED-67890",
    adresseCabinet: "15 Rue des Jardins, Cocody, Abidjan",
    statut: "ACTIF",
    latitude: 5.3553,
    longitude: -3.9988,
  },
  {
    id: "med-003",
    nom: "Yapo",
    prenom: "Koffi",
    email: "koffi.yapo@lahfia.ci",
    telephone: "+225 27 22 93 21 47",
    specialite: "DERMATOLOGUE",
    numeroOrdre: "CI-MED-11223",
    adresseCabinet: "8 Avenue Chardy, Plateau, Abidjan",
    statut: "ACTIF",
    latitude: 5.3220,
    longitude: -4.0120,
  },
  {
    id: "med-004",
    nom: "Coulibaly",
    prenom: "Aya",
    email: "aya.coulibaly@lahfia.ci",
    telephone: "+225 27 22 77 65 43",
    specialite: "PEDIATRE",
    numeroOrdre: "CI-MED-44556",
    adresseCabinet: "Cité Anador, Bâtiment Médical, Abobo, Abidjan",
    statut: "ACTIF",
    latitude: 5.4000,
    longitude: -4.0167,
  },
];

// Disponibilités de med-001 : Lun / Mer / Ven 08:00-17:00
export const mockDisponibilites: DisponibiliteMedecin[] = [
  {
    id: "dispo-001",
    medecinId: "med-001",
    jourSemaine: "LUNDI",
    heureDebut: "08:00",
    heureFin: "17:00",
    actif: true,
  },
  {
    id: "dispo-002",
    medecinId: "med-001",
    jourSemaine: "MERCREDI",
    heureDebut: "08:00",
    heureFin: "17:00",
    actif: true,
  },
  {
    id: "dispo-003",
    medecinId: "med-001",
    jourSemaine: "VENDREDI",
    heureDebut: "08:00",
    heureFin: "17:00",
    actif: true,
  },
];
