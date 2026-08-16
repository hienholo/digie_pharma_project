// ── Types API LAHFIA (alignés sur le MCD backend réel) ───────────────────────

export interface LivreurAPI {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  statut: "EN_ATTENTE_VALIDATION" | "ACTIF" | "SUSPENDU";
  disponibiliteStatut: "DISPONIBLE" | "EN_COURSE" | "HORS_LIGNE";
  latitude?: number;
  longitude?: number;
  createdAt?: string;
}

export interface MedecinAPI {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  specialite: string;
  statut: "EN_ATTENTE_VALIDATION" | "ACTIF" | "SUSPENDU";
  adresseCabinet?: string;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
}

export interface LigneOrdonnanceAPI {
  id: string;
  medicament: MedicamentAPI;
  quantite: number;
  posologie?: string;
  duree?: string;
  instructions?: string;
}

export interface OrdonnanceNumeriqueAPI {
  id: string;
  source: "MEDECIN";
  statut: "NUMERIQUE";
  createdAt: string;
  lignes: LigneOrdonnanceAPI[];
}

export interface RendezVousAPI {
  id: string;
  statut: "EN_ATTENTE" | "CONFIRME" | "COMPLETE" | "ANNULE";
  dateRdv: string;
  heure: string;
  motif?: string;
  createdAt: string;
  patientId: string;
  patientPrenom: string;
  patientNom: string;
  patientTelephone: string;
  medecinId: string;
  medecinPrenom: string;
  medecinNom: string;
  medecinSpecialite: string;
  medecinAdresse?: string;
}

export interface CreateRendezVousPayload {
  patientId: string;
  medecinId: string;
  dateRdv: string;
  heure: string;
  motif?: string;
}

export interface CreateOrdonnanceNumeriquePayload {
  medecinId: string;
  patientId: string;
  lignes: {
    medicamentId: string;
    quantite: number;
    posologie?: string;
    duree?: string;
    instructions?: string;
  }[];
}

export interface PatientAPI {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
  rythmeCardiaque?: number;
  tensionSystolique?: number;
  tensionDiastolique?: number;
  poids?: number;
  glycemie?: number;
}

export interface RappelAPI {
  id: string;
  patientId: string;
  medicamentNom: string;
  dose?: string;
  heure: string;
  recurrent: boolean;
  dateRappel?: string;
  pris: boolean;
}

export interface PharmacieAPI {
  id: string;
  nom: string;
  adresse: string;
  latitude: number;
  longitude: number;
  livraisonActive: boolean;
  email?: string;
  telephone?: string;
  distanceKm?: number;
}

// Medicament.nomCommercial / nomGenerique / dosage / forme
export interface MedicamentAPI {
  id: string;
  nomCommercial: string;
  nomGenerique?: string;
  dosage: string;
  forme: string;
}

// Médicament OCR-détecté sur une ordonnance photo (flux upload patient).
export interface OrdonnanceMedicamentAPI {
  id: string;
  medicament: MedicamentAPI;
  quantite: string;
  corrigeManuellement: boolean;
}

export interface OrdonnanceAPI {
  id: string;
  imageUrl?: string;
  // UPLOAD : photo/scan soumis par le patient (OCR) — MEDECIN : rédigée par un médecin.
  source: "UPLOAD" | "MEDECIN";
  statut: "EN_ATTENTE_OCR" | "ANALYSEE" | "CORRIGEE" | "NUMERIQUE";
  createdAt: string;
  medicamentsOcr: OrdonnanceMedicamentAPI[];
  // Lignes rédigées par le médecin (posologie/durée/instructions) — vide pour source=UPLOAD.
  lignes: LigneOrdonnanceAPI[];
  // Coordonnées du médecin auteur — présentes seulement si source=MEDECIN.
  medecinNom?: string;
  medecinPrenom?: string;
  medecinSpecialite?: string;
  medecinNumeroOrdre?: string;
}

export interface DemandeAPI {
  id: string;
  patientId: string;
  type: "MEDICAMENT" | "ORDONNANCE";
  statut: "EN_COURS" | "REPONSE_RECUE" | "VALIDEE" | "ANNULEE";
  medicamentRecherche?: string;
  ordonnanceId?: string;
  createdAt: string;
}

// Réponse d'une pharmacie à une demande (vue côté patient)
export interface DemandeReponseAPI {
  id: string;
  demandeId?: string;
  pharmacieId?: string;
  pharmacieNom?: string;
  pharmacieAdresse?: string;
  pharmacieTelephone?: string;
  reponse: "DISPONIBLE" | "NON_DISPONIBLE" | "PARTIEL" | null;
  detailPartiel?: string;
  prix?: number;
  reponduAt?: string;
}

// Demande en attente côté pharmacie (DTO aplati)
export interface DemandeEnAttenteAPI {
  reponseId: string;
  demandeId: string;
  patientPrenom: string;
  patientNom: string;
  patientTelephone: string;
  type: "MEDICAMENT" | "ORDONNANCE";
  medicamentRecherche?: string;
  ordonnanceId?: string;
  ordonnanceImageUrl?: string;
  medicamentNoms: string[];
  createdAt: string;
}

export interface CommandeAPI {
  id: string;
  statut: "EN_PREPARATION" | "PRETE" | "EN_LIVRAISON" | "TERMINEE" | "ANNULEE";
  modeObtention: "LIVRAISON" | "RETRAIT";
  modePaiement: "A_LA_LIVRAISON" | "EN_LIGNE";
  createdAt: string;
}

// Commande enrichie avec infos patient (côté pharmacie)
export interface CommandePharmacieAPI {
  id: string;
  statut: "EN_PREPARATION" | "PRETE" | "EN_LIVRAISON" | "TERMINEE" | "ANNULEE";
  modeObtention: "LIVRAISON" | "RETRAIT";
  modePaiement?: string;
  createdAt: string;
  patientPrenom: string;
  patientNom: string;
  medicamentNoms: string[];
}

// Vue enrichie d'une commande pour l'écran "Mes commandes" côté patient (liste + timeline détaillée)
export interface CommandePatientAPI {
  id: string;
  statut: "EN_PREPARATION" | "PRETE" | "EN_LIVRAISON" | "TERMINEE" | "ANNULEE";
  modeObtention: "LIVRAISON" | "RETRAIT";
  modePaiement?: "A_LA_LIVRAISON" | "EN_LIGNE";
  createdAt: string;
  preteAt?: string;
  pharmacieNom: string;
  pharmacieAdresse: string;
  medicamentNoms: string[];
  demandeCreatedAt: string;
  nbPharmaciesContactees: number;
  reponseConfirmeeAt?: string;
  reponseType?: "DISPONIBLE" | "PARTIEL" | "NON_DISPONIBLE";
  prix?: number;
  livraisonId?: string;
  livraisonStatut?: "EN_ATTENTE_LIVREUR" | "ASSIGNEE" | "EN_COURS" | "LIVREE" | "ECHEC";
  livraisonAssigneeAt?: string;
  livraisonPriseEnChargeAt?: string;
  livraisonLivreeAt?: string;
  livreurNom?: string;
  livreurPrenom?: string;
  livreurTelephone?: string;
  livreurLatitude?: number;
  livreurLongitude?: number;
  livreurTypeVehicule?: "MOTO" | "VOITURE" | "VELO" | "TRICYCLE";
  livreurNoteMoyenne?: number;
  evaluationNote?: number;
}

export interface LivraisonAPI {
  id: string;
  commandeId?: string;
  livreurId?: string;
  livreurNom?: string;
  livreurPrenom?: string;
  livreurTelephone?: string;
  statut: "EN_ATTENTE_LIVREUR" | "ASSIGNEE" | "EN_COURS" | "LIVREE" | "ECHEC";
  adresseLivraison?: string;
  livreurLatitude?: number;
  livreurLongitude?: number;
  assigneeAt?: string;
  priseEnChargeAt?: string;
  livreeAt?: string;
  createdAt?: string;
}

export interface NotificationAPI {
  id: string;
  destinataireId: string;
  typeEvenement: string;
  message: string;
  lue: boolean;
  createdAt: string;
}

// ── Payloads ──────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
  role: "PATIENT" | "MEDECIN" | "PHARMACIE" | "LIVREUR";
}

export interface LoginResponse {
  id: string;
  role: string;
  nom: string;
  prenom: string | null;
}

export interface AdminStatsAPI {
  totalPatients: number;
  totalPharmacies: number;
  pharmaciesLivraisonActive: number;
  totalLivreurs: number;
  livreursActifs: number;
  livreursEnAttente: number;
  livreursSuspendus: number;
  totalMedecins: number;
  medecinsActifs: number;
  medecinsEnAttente: number;
  medecinsSuspendus: number;
  totalDemandes: number;
  totalCommandes: number;
  totalLivraisons: number;
}

export interface CreatePatientPayload {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  password: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateDemandePayload {
  patientId: string;
  type: "MEDICAMENT" | "ORDONNANCE";
  ordonnanceId?: string;
  rayonKm?: number;
  medicamentRecherche?: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateCommandePayload {
  demandeId: string;
  pharmacieId: string;
  modeObtention: "LIVRAISON" | "RETRAIT";
  modePaiement: "A_LA_LIVRAISON" | "WAVE" | "ORANGE_MONEY" | "MTN_MONEY" | "EN_LIGNE";
  medicamentIds: string[];
}
