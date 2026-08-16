/// <reference types="vite/client" />
import type {
  CreatePatientPayload, CreateDemandePayload, CreateCommandePayload,
  CreateOrdonnanceNumeriquePayload, CreateRendezVousPayload,
  PatientAPI, PharmacieAPI, OrdonnanceAPI, MedicamentAPI,
  MedecinAPI, OrdonnanceNumeriqueAPI, RendezVousAPI,
  DemandeAPI, DemandeReponseAPI, DemandeEnAttenteAPI,
  CommandeAPI, CommandePharmacieAPI, CommandePatientAPI, LivraisonAPI, NotificationAPI,
  LoginResponse, RappelAPI, AdminStatsAPI, LivreurAPI,
} from "./types";

const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api/v1";

// ── Session (localStorage) ───────────────────────────────────────────────────

export const session = {
  getToken:   ()  => localStorage.getItem("lahfia_token") ?? "",
  setToken:   (t: string) => localStorage.setItem("lahfia_token", t),
  getUserId:  ()  => localStorage.getItem("lahfia_user_id") ?? "",
  setUserId:  (id: string) => localStorage.setItem("lahfia_user_id", id),
  getRole:    ()  => localStorage.getItem("lahfia_role") ?? "",
  setRole:    (r: string) => localStorage.setItem("lahfia_role", r),
  clear:      ()  => {
    localStorage.removeItem("lahfia_token");
    localStorage.removeItem("lahfia_user_id");
    localStorage.removeItem("lahfia_role");
  },
};

// ── Client HTTP de base ──────────────────────────────────────────────────────

async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = session.getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token && token !== "demo-token" ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    let msg = `Erreur ${res.status}`;
    try {
      const body = await res.json();
      msg = body.message ?? body.error ?? msg;
    } catch {
      msg = await res.text().catch(() => msg) || msg;
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

// ── Patients ──────────────────────────────────────────────────────────────────

export const patientsApi = {
  getById: (id: string) =>
    http<PatientAPI>(`/patients/${id}`),

  // GET /patients → liste complète, utilisé pour "login" par email (pas d'/auth/login)
  findAll: () =>
    http<PatientAPI[]>("/patients"),

  create: (payload: CreatePatientPayload) =>
    http<PatientAPI>("/patients", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateLocation: (id: string, lat: number, lng: number) =>
    http<void>(`/patients/${id}/localisation`, {
      method: "PATCH",
      body: JSON.stringify({ latitude: lat, longitude: lng }),
    }),

  updateMesures: (id: string, mesures: {
    rythmeCardiaque?: number;
    tensionSystolique?: number;
    tensionDiastolique?: number;
    poids?: number;
    glycemie?: number;
  }) =>
    http<PatientAPI>(`/patients/${id}/mesures`, {
      method: "PATCH",
      body: JSON.stringify(mesures),
    }),

  supprimer: (id: string) =>
    http<void>(`/patients/${id}`, { method: "DELETE" }),
};

// ── Auth ──────────────────────────────────────────────────────────────────────

export const authApi = {
  // ── Login (POST /auth/login avec email + password + role) ────────────────────
  login: (email: string, password: string, role: LoginResponse["role"]) =>
    http<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, role }),
    }),

  // ── Inscription ──────────────────────────────────────────────────────────────
  registerPatient: (payload: CreatePatientPayload) =>
    patientsApi.create(payload),

  registerMedecin: (payload: Record<string, unknown>) =>
    http<{ id: string }>("/medecins/inscription", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  registerPharmacie: (payload: Record<string, unknown>) =>
    http<PharmacieAPI>("/pharmacies", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  registerLivreur: (payload: Record<string, unknown>) =>
    http<{ id: string }>("/livreurs/inscription", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// ── Pharmacies ────────────────────────────────────────────────────────────────

export const pharmaciesApi = {
  list: () =>
    http<PharmacieAPI[]>("/pharmacies"),

  getById: (id: string) =>
    http<PharmacieAPI>(`/pharmacies/${id}`),

  nearby: (lat: number, lng: number, rayon = 5) =>
    http<PharmacieAPI[]>(`/pharmacies/proximite?lat=${lat}&lng=${lng}&rayon=${rayon}`),

  create: (payload: Omit<PharmacieAPI, "id" | "distanceKm">) =>
    http<PharmacieAPI>("/pharmacies", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  toggleLivraison: (id: string, actif: boolean) =>
    http<PharmacieAPI>(`/pharmacies/${id}/livraison`, {
      method: "PATCH",
      body: JSON.stringify({ actif }),
    }),

  supprimer: (id: string) =>
    http<void>(`/pharmacies/${id}`, { method: "DELETE" }),
};

// ── Ordonnances ───────────────────────────────────────────────────────────────

export const ordonnancesApi = {
  getByPatient: (patientId: string) =>
    http<OrdonnanceAPI[]>(`/ordonnances/patient/${patientId}`),

  soumettre: async (file: File): Promise<OrdonnanceAPI> => {
    const formData = new FormData();
    formData.append("image", file);
    const token = session.getToken();
    const res = await fetch(`${BASE}/ordonnances/soumettre`, {
      method: "POST",
      headers: token && token !== "demo-token" ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new Error(`Erreur ${res.status}`);
    return res.json();
  },

  corriger: (id: string, medicaments: string[]) =>
    http<OrdonnanceAPI>(`/ordonnances/${id}/corriger`, {
      method: "PUT",
      body: JSON.stringify({ medicaments }),
    }),
};

// ── Demandes ──────────────────────────────────────────────────────────────────

export const demandesApi = {
  getByPatient: (patientId: string) =>
    http<DemandeAPI[]>(`/demandes/patient/${patientId}`),

  getReponses: (demandeId: string) =>
    http<DemandeReponseAPI[]>(`/demandes/${demandeId}/reponses`),

  // Demandes en attente de réponse pour une pharmacie
  getEnAttenteParPharmacie: (pharmacieId: string) =>
    http<DemandeEnAttenteAPI[]>(`/demandes/pharmacie/${pharmacieId}/en-attente`),

  // La pharmacie répond : DISPONIBLE | NON_DISPONIBLE | PARTIEL
  repondre: (demandeId: string, pharmacieId: string, reponse: "DISPONIBLE" | "NON_DISPONIBLE" | "PARTIEL", detailPartiel?: string, prix?: number) =>
    http<DemandeReponseAPI>(`/demandes/${demandeId}/repondre`, {
      method: "POST",
      body: JSON.stringify({ pharmacieId, reponse, detailPartiel: detailPartiel ?? null, prix: prix ?? null }),
    }),

  create: (payload: CreateDemandePayload) =>
    http<DemandeAPI>("/demandes", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// ── Commandes ─────────────────────────────────────────────────────────────────

export const commandesApi = {
  getById: (id: string) =>
    http<CommandeAPI>(`/commandes/${id}`),

  getByPharmacie: (pharmacieId: string) =>
    http<CommandeAPI[]>(`/commandes/pharmacie/${pharmacieId}`),

  // Commandes enrichies avec infos patient (côté pharmacie)
  getByPharmacieDetail: (pharmacieId: string) =>
    http<CommandePharmacieAPI[]>(`/commandes/pharmacie/${pharmacieId}/detail`),

  // Commandes enrichies pour l'écran "Mes commandes" (côté patient)
  getByPatient: (patientId: string) =>
    http<CommandePatientAPI[]>(`/commandes/patient/${patientId}`),

  marquerPrete: (id: string) =>
    http<CommandeAPI>(`/commandes/${id}/prete`, { method: "PATCH" }),

  terminer: (id: string) =>
    http<CommandeAPI>(`/commandes/${id}/terminer`, { method: "PATCH" }),

  create: (payload: CreateCommandePayload) =>
    http<CommandeAPI>("/commandes", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// ── Médicaments ───────────────────────────────────────────────────────────────

export const medicamentsApi = {
  list: () =>
    http<MedicamentAPI[]>("/medicaments"),

  create: (payload: Omit<MedicamentAPI, "id">) =>
    http<MedicamentAPI>("/medicaments", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// ── Livraisons ────────────────────────────────────────────────────────────────

export const livraisonsApi = {
  getByCommande: (commandeId: string) =>
    http<LivraisonAPI>(`/livraisons/commande/${commandeId}`),

  getByLivreur: (livreurId: string) =>
    http<LivraisonAPI[]>(`/livraisons/livreur/${livreurId}`),

  getActiveByLivreur: (livreurId: string) =>
    http<LivraisonAPI[]>(`/livraisons/livreur/${livreurId}/active`),

  getEnAttente: () =>
    http<LivraisonAPI[]>(`/livraisons/en-attente`),

  seProposer: (id: string, livreurId: string) =>
    http<LivraisonAPI>(`/livraisons/${id}/assigner/${livreurId}`, { method: "PATCH" }),

  assignerAuto: (id: string) =>
    http<LivraisonAPI>(`/livraisons/${id}/assigner-auto`, { method: "PATCH" }),

  prendreEnCharge: (id: string, livreurId: string) =>
    http<LivraisonAPI>(`/livraisons/${id}/prendre-en-charge`, {
      method: "PATCH",
      body: JSON.stringify({ livreurId }),
    }),

  confirmer: (id: string, livreurId: string, note = "") =>
    http<LivraisonAPI>(`/livraisons/${id}/confirmer`, {
      method: "PATCH",
      body: JSON.stringify({ livreurId, note }),
    }),

  // Le patient note le livreur après une livraison terminée (une seule fois)
  evaluer: (id: string, patientId: string, note: number, commentaire?: string) =>
    http<{ id: string; note: number; commentaire?: string }>(`/livraisons/${id}/evaluer`, {
      method: "POST",
      body: JSON.stringify({ patientId, note, commentaire: commentaire ?? null }),
    }),
};

// ── Médecins ──────────────────────────────────────────────────────────────────

export const medecinsApi = {
  getById: (id: string) =>
    http<MedecinAPI>(`/medecins/${id}`),

  getAll: () =>
    http<MedecinAPI[]>("/medecins"),

  valider: (id: string) =>
    http<MedecinAPI>(`/medecins/${id}/valider`, { method: "PATCH" }),

  suspendre: (id: string) =>
    http<MedecinAPI>(`/medecins/${id}/suspendre`, { method: "PATCH" }),

  supprimer: (id: string) =>
    http<void>(`/medecins/${id}`, { method: "DELETE" }),
};

// ── Ordonnances numériques (médecin) ──────────────────────────────────────────

export const ordonnancesNumeriquesApi = {
  getByMedecin: (medecinId: string) =>
    http<OrdonnanceNumeriqueAPI[]>(`/ordonnances-numeriques/medecin/${medecinId}`),

  rediger: (payload: CreateOrdonnanceNumeriquePayload) =>
    http<OrdonnanceNumeriqueAPI>("/ordonnances-numeriques", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// ── Rendez-vous ───────────────────────────────────────────────────────────────

export const rendezVousApi = {
  getByMedecin: (medecinId: string) =>
    http<RendezVousAPI[]>(`/rendez-vous/medecin/${medecinId}`),

  getByPatient: (patientId: string) =>
    http<RendezVousAPI[]>(`/rendez-vous/patient/${patientId}`),

  creer: (payload: CreateRendezVousPayload) =>
    http<RendezVousAPI>("/rendez-vous", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  confirmer: (id: string) =>
    http<RendezVousAPI>(`/rendez-vous/${id}/confirmer`, { method: "PATCH" }),

  annuler: (id: string) =>
    http<RendezVousAPI>(`/rendez-vous/${id}/annuler`, { method: "PATCH" }),
};

// ── Livreurs ──────────────────────────────────────────────────────────────────

export const livreursApi = {
  getById: (id: string) =>
    http<LivreurAPI>(`/livreurs/${id}`),

  getAll: () =>
    http<LivreurAPI[]>("/livreurs"),

  changerDisponibilite: (id: string, statut: "DISPONIBLE" | "HORS_LIGNE", latitude?: number, longitude?: number) =>
    http<LivreurAPI>(`/livreurs/${id}/disponibilite`, {
      method: "PATCH",
      body: JSON.stringify({ statut, latitude: latitude ?? null, longitude: longitude ?? null }),
    }),

  valider: (id: string) =>
    http<LivreurAPI>(`/livreurs/${id}/valider`, { method: "PATCH" }),

  suspendre: (id: string) =>
    http<LivreurAPI>(`/livreurs/${id}/suspendre`, { method: "PATCH" }),

  supprimer: (id: string) =>
    http<void>(`/livreurs/${id}`, { method: "DELETE" }),
};

// ── Rappels médicaments ───────────────────────────────────────────────────────

export const rappelsApi = {
  getJour: (patientId: string) =>
    http<RappelAPI[]>(`/rappels/patient/${patientId}/jour`),

  getAll: (patientId: string) =>
    http<RappelAPI[]>(`/rappels/patient/${patientId}`),

  creer: (payload: {
    patientId: string;
    medicamentNom: string;
    dose?: string;
    heure: string;
    recurrent?: boolean;
    dateRappel?: string;
  }) =>
    http<RappelAPI>("/rappels", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  marquerPris: (id: string) =>
    http<RappelAPI>(`/rappels/${id}/marquer-pris`, { method: "PATCH" }),

  annulerPris: (id: string) =>
    http<RappelAPI>(`/rappels/${id}/annuler-pris`, { method: "PATCH" }),

  supprimer: (id: string) =>
    http<void>(`/rappels/${id}`, { method: "DELETE" }),
};

// ── Notifications ─────────────────────────────────────────────────────────────

export const notificationsApi = {
  getAll: (userId: string) =>
    http<NotificationAPI[]>(`/notifications/destinataire/${userId}`),

  getNonLues: (userId: string) =>
    http<NotificationAPI[]>(`/notifications/destinataire/${userId}/non-lues`),

  markRead: (id: string) =>
    http<void>(`/notifications/${id}/lire`, { method: "PATCH" }),

  markAllRead: (userId: string) =>
    http<void>(`/notifications/destinataire/${userId}/lire-tout`, { method: "PATCH" }),
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export const adminApi = {
  login: (email: string, password: string) =>
    authApi.login(email, password, "ADMIN"),

  stats: () =>
    http<AdminStatsAPI>("/admins/stats"),
};
