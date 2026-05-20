// ── Types API LAHFIA (alignés sur le MCD backend réel) ───────────────────────

export interface PatientAPI {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  latitude?: number;
  longitude?: number;
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

export interface OrdonnanceAPI {
  id: string;
  patientId: string;
  imageUrl: string;
  statut: "EN_ATTENTE_OCR" | "ANALYSEE" | "CORRIGEE";
  medicaments: string[];
  corrigeManuellement: boolean;
  createdAt: string;
}

export interface DemandeAPI {
  id: string;
  patientId: string;
  type: "MEDICAMENT" | "ORDONNANCE";
  statut: "EN_COURS" | "REPONSE_RECUE" | "VALIDEE" | "ANNULEE";
  ordonnanceId?: string;
  createdAt: string;
}

// Réponse d'une pharmacie à une demande (vue côté patient)
export interface DemandeReponseAPI {
  id: string;
  demandeId: string;
  pharmacieId: string;
  reponse: "DISPONIBLE" | "NON_DISPONIBLE" | "PARTIEL";
  detailPartiel?: string;
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
  ordonnanceId?: string;
  ordonnanceImageUrl?: string;
  medicamentNoms: string[];
  createdAt: string;
}

export interface CommandeAPI {
  id: string;
  statut: "EN_PREPARATION" | "PRETE" | "EN_LIVRAISON" | "TERMINEE" | "ANNULEE";
  modeObtention: "LIVRAISON" | "RETRAIT";
  modePaiement: "ESPECES" | "CARTE";
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

export interface LivraisonAPI {
  id: string;
  commandeId: string;
  livreurId?: string;
  statut: "EN_ATTENTE_LIVREUR" | "ASSIGNEE" | "EN_COURS" | "LIVREE" | "ECHEC";
  livreurLatitude?: number;
  livreurLongitude?: number;
  assigneeAt?: string;
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
}

export interface CreateCommandePayload {
  demandeId: string;
  pharmacieId: string;
  modeObtention: "LIVRAISON" | "RETRAIT";
  modePaiement: "ESPECES" | "CARTE";
  medicamentIds: string[];
}
