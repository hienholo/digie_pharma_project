// ── Types API LAHFIA (alignés sur le MCD backend réel) ───────────────────────

// Patient backend : { id, nom, prenom, telephone (requis), email, latitude?, longitude? }
export interface PatientAPI {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  latitude?: number;
  longitude?: number;
}

// Pharmacie backend : { id, nom, adresse, latitude, longitude, email?, telephone?, livraisonActive }
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

export interface MedicamentAPI {
  id: string;
  nom: string;
  forme: string;
  dosage: string;
  instructions?: string;
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
  type: "LIVRAISON" | "A_LA_LIVRAISON";
  statut: "EN_COURS" | "ANALYSEE" | "ANNULEE";
  ordonnanceId?: string;
  createdAt: string;
}

export interface DemandeReponseAPI {
  id: string;
  demandeId: string;
  pharmacieId: string;
  pharmacieNom: string;
  reponse: "ACCEPTEE" | "PARTIELLE" | "REFUSEE";
  detailPartiel?: string;
  prixTotal: number;
  createdAt: string;
}

export interface CommandeAPI {
  id: string;
  pharmacieId: string;
  demandeId: string;
  statut: "EN_PREPARATION" | "COMMANDE_PRETE" | "EN_LIVRAISON" | "LIVREE" | "TERMINEE";
  modeObtention: "LIVRAISON" | "RETRAIT";
  modePaiement: "ESPECES" | "CARTE";
  createdAt: string;
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

// Notification backend : { id, destinataireId, typeDestinataire, typeEvenement, message, lue, createdAt }
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

// POST /patients → { nom, prenom, telephone (requis), email, password }
export interface CreatePatientPayload {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  password: string;
  latitude?: number;
  longitude?: number;
}

// POST /demandes → { patientId, type, ordonnanceId?, rayonKm? }
export interface CreateDemandePayload {
  patientId: string;
  type: "LIVRAISON" | "A_LA_LIVRAISON";
  ordonnanceId?: string;
  rayonKm?: number;
}

// POST /commandes → { demandeId, pharmacieId, modeObtention, modePaiement, medicamentIds }
export interface CreateCommandePayload {
  demandeId: string;
  pharmacieId: string;
  modeObtention: "LIVRAISON" | "RETRAIT";
  modePaiement: "ESPECES" | "CARTE";
  medicamentIds: string[];
}
