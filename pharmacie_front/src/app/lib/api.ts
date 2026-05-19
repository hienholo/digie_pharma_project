import type {
  CreatePatientPayload, CreateDemandePayload, CreateCommandePayload,
  PatientAPI, PharmacieAPI, OrdonnanceAPI,
  DemandeAPI, DemandeReponseAPI, CommandeAPI, LivraisonAPI, NotificationAPI,
  LoginResponse,
} from "./types";

const BASE = "http://localhost:3000/api/v1";

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
    const msg = await res.text().catch(() => `Erreur ${res.status}`);
    throw new Error(msg || `Erreur ${res.status}`);
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
// POST /demandes → { patientId, type, ordonnanceId?, rayonKm? }

export const demandesApi = {
  getByPatient: (patientId: string) =>
    http<DemandeAPI[]>(`/demandes/patient/${patientId}`),

  getReponses: (demandeId: string) =>
    http<DemandeReponseAPI[]>(`/demandes/${demandeId}/reponses`),

  create: (payload: CreateDemandePayload) =>
    http<DemandeAPI>("/demandes", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// ── Commandes ─────────────────────────────────────────────────────────────────
// POST /commandes → { demandeId, pharmacieId, modeObtention, modePaiement, medicamentIds }

export const commandesApi = {
  getById: (id: string) =>
    http<CommandeAPI>(`/commandes/${id}`),

  getByPharmacie: (pharmacieId: string) =>
    http<CommandeAPI[]>(`/commandes/pharmacie/${pharmacieId}`),

  create: (payload: CreateCommandePayload) =>
    http<CommandeAPI>("/commandes", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// ── Livraisons ────────────────────────────────────────────────────────────────

export const livraisonsApi = {
  getByCommande: (commandeId: string) =>
    http<LivraisonAPI>(`/livraisons/commande/${commandeId}`),

  getActiveByLivreur: (livreurId: string) =>
    http<LivraisonAPI>(`/livraisons/livreur/${livreurId}/active`),

  prendreEnCharge: (id: string) =>
    http<LivraisonAPI>(`/livraisons/${id}/prendre-en-charge`, { method: "PATCH" }),

  confirmer: (id: string) =>
    http<LivraisonAPI>(`/livraisons/${id}/confirmer`, { method: "PATCH" }),
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
