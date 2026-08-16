import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  pharmaciesApi, ordonnancesApi, demandesApi, commandesApi,
  notificationsApi, patientsApi, livraisonsApi, rappelsApi,
} from "../lib/api";
import type { PharmacieAPI, NotificationAPI, CommandeAPI, CommandePatientAPI, PatientAPI, DemandeAPI, DemandeReponseAPI, OrdonnanceAPI, RappelAPI } from "../lib/types";
import { ocrMock } from "../datamock/ocr.mock";
import type { Notif } from "../datamock/notifications.mock";
import waveIcon from "../assets/img/wave.png";
import orangeMoneyIcon from "../assets/img/om.png";
import mtnMoneyIcon from "../assets/img/mtn.jpg";
import {
  Search,
  Camera,
  MapPin,
  Plus,
  Activity,
  Heart,
  Scale,
  Droplets,
  Smartphone,
  Package,
  Truck,
  Banknote,
  Check,
  ChevronLeft,
  Navigation2,
  Pill,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Upload,
  Edit3,
  X,
  AlertCircle,
  Info,
  ArrowRight,
  Phone,
  Bell,
  User,
  ClipboardList,
  ChevronRight,
  LogOut,
  Settings,
  Home,
  Shield,
  HelpCircle,
  Pencil,
  Stethoscope,
  FileText,
  Loader2,
  Download,
  Calendar,
  Send,
  Share2,
} from "lucide-react";
import type { Pharmacy } from "./PharmacyCard";
import { OrderStatus, type OrderStep } from "./OrderStatus";
import { PatientDoctorAppointments } from "./PatientDoctorAppointments";
import { PharmacyMap } from "./PharmacyMap";
import { MesCommandes } from "./MesCommandes";


// ── Types ────────────────────────────────────────────────────────────────────

interface OrderDisplay {
  id: string;
  pharmacy: string;
  items: string[];
  status: string;
  statusColor: string;
  date: string;
  total: string | number;
}

interface PrescriptionDisplay {
  id: string;
  doctor: string;
  date: string;
  expires: string;
  active: boolean;
  drugs: string[];
}

type PatientTab = "home" | "search" | "dashboard" | "profile" | "appointments";

type PatientStep =
  | "search"
  | "pharmacies"
  | "mode"
  | "validation"
  | "payment"
  | "tracking";

const STEP_LABELS: { key: PatientStep; label: string }[] = [
  { key: "search", label: "Recherche" },
  { key: "pharmacies", label: "Pharmacies" },
  { key: "mode", label: "Mode" },
  { key: "validation", label: "Résumé" },
  { key: "payment", label: "Paiement" },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function StepBar({ current }: { current: PatientStep }) {
  const idx = STEP_LABELS.findIndex((s) => s.key === current);
  if (idx === -1) return null;
  return (
    <div className="bg-white border-b border-gray-100 px-4 py-3">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          {STEP_LABELS.map((s, i) => {
            const done = i < idx;
            const active = i === idx;
            return (
              <div key={s.key} className="flex-1 flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: done
                        ? "#10B981"
                        : active
                          ? "#1A3072"
                          : "#E5E7EB",
                      color: done || active ? "white" : "#9CA3AF",
                    }}
                  >
                    {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span
                    className="text-xs hidden sm:block"
                    style={{
                      color: active ? "#1A3072" : done ? "#10B981" : "#9CA3AF",
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div
                    className="flex-1 h-0.5 mx-1 mt-[-14px] sm:mt-[-8px]"
                    style={{ backgroundColor: done ? "#10B981" : "#E5E7EB" }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Module 1 : Recherche ──────────────────────────────────────────────────────

// Communes/quartiers d'Abidjan + grandes villes de Côte d'Ivoire proposés pour le ciblage
// géographique — coordonnées approximatives des centres (le backend n'accepte que lat/lng,
// pas de nom de ville).
const VILLES_CI: Record<string, { lat: number; lng: number }> = {
  // Abidjan — communes et quartiers
  "Abobo": { lat: 5.4198, lng: -4.0147 },
  "Adjamé": { lat: 5.3667, lng: -4.0333 },
  "Angré": { lat: 5.3936, lng: -3.9852 },
  "Anyama": { lat: 5.4939, lng: -4.0511 },
  "Attécoubé": { lat: 5.3333, lng: -4.0500 },
  "Bingerville": { lat: 5.3557, lng: -3.8917 },
  "Cocody": { lat: 5.3599, lng: -3.9757 },
  "Deux-Plateaux": { lat: 5.3654, lng: -4.0083 },
  "Koumassi": { lat: 5.2947, lng: -3.9508 },
  "Marcory": { lat: 5.2900, lng: -3.9950 },
  "Plateau": { lat: 5.3200, lng: -4.0200 },
  "Port-Bouët": { lat: 5.2500, lng: -3.9333 },
  "Riviera": { lat: 5.3306, lng: -3.9364 },
  "Songon": { lat: 5.3167, lng: -4.2833 },
  "Treichville": { lat: 5.2924, lng: -4.0083 },
  "Yopougon": { lat: 5.3450, lng: -4.0850 },
  // Autres grandes villes de Côte d'Ivoire
  "Aboisso": { lat: 5.4703, lng: -3.2072 },
  "Abengourou": { lat: 6.7297, lng: -3.4964 },
  "Adzopé": { lat: 6.1042, lng: -3.8628 },
  "Agboville": { lat: 5.9276, lng: -4.2143 },
  "Bonoua": { lat: 5.2735, lng: -3.6013 },
  "Bouaflé": { lat: 6.9950, lng: -5.7439 },
  "Bouaké": { lat: 7.6906, lng: -5.0300 },
  "Bondoukou": { lat: 8.0402, lng: -2.8000 },
  "Dabou": { lat: 5.3197, lng: -4.3777 },
  "Daloa": { lat: 6.8770, lng: -6.4502 },
  "Dimbokro": { lat: 6.6486, lng: -4.7061 },
  "Divo": { lat: 5.8372, lng: -5.3572 },
  "Ferkessédougou": { lat: 9.5975, lng: -5.1928 },
  "Gagnoa": { lat: 6.1319, lng: -5.9506 },
  "Grand-Bassam": { lat: 5.2118, lng: -3.7380 },
  "Issia": { lat: 6.4939, lng: -6.5850 },
  "Katiola": { lat: 8.1389, lng: -5.1017 },
  "Korhogo": { lat: 9.4580, lng: -5.6296 },
  "Man": { lat: 7.4125, lng: -7.5537 },
  "Odienné": { lat: 9.5093, lng: -7.5644 },
  "San-Pédro": { lat: 4.7485, lng: -6.6363 },
  "Sassandra": { lat: 4.9500, lng: -6.0833 },
  "Séguéla": { lat: 7.9614, lng: -6.6731 },
  "Soubré": { lat: 5.7847, lng: -6.5931 },
  "Tabou": { lat: 4.4231, lng: -7.3528 },
  "Toumodi": { lat: 6.5561, lng: -5.0169 },
  "Touba": { lat: 8.2833, lng: -7.6833 },
  "Yamoussoukro": { lat: 6.8276, lng: -5.2893 },
};
const RAYONS_KM = [1, 2, 5, 10, 20];

// Comparaison insensible aux accents/majuscules pour l'auto-complétion des communes.
function normaliser(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export interface SearchZone {
  commune?: string;
  rayonKm: number;
  useCurrentLocation: boolean;
}

// GET /pharmacies/proximite trie déjà par distance côté serveur mais ne renvoie pas la valeur
// calculée dans le JSON — on la recalcule donc côté client à partir du point de référence
// (position du patient ou centre de la commune) et des lat/lng de la pharmacie, déjà présents.
function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

// Affichage "ville" dans le header : le backend ne fait pas de géocodage inverse, donc on
// approxime en cherchant la ville/commune connue la plus proche de la position réelle du
// patient. Au-delà de 100 km (hors couverture connue) ou sans position, repli sur "Abidjan".
function nearestCommune(loc: { lat: number; lng: number } | null): string {
  if (!loc) return "Abidjan";
  let best: string | null = null;
  let bestDist = Infinity;
  for (const [nom, coords] of Object.entries(VILLES_CI)) {
    const d = haversineKm(loc, coords);
    if (d < bestDist) { bestDist = d; best = nom; }
  }
  return best && bestDist <= 100 ? best : "Abidjan";
}

// Convertit une pharmacie backend en carte affichable, avec distance recalculée depuis `from`.
function toPharmacyCard(p: PharmacieAPI, from?: { lat: number; lng: number }): Pharmacy {
  return {
    id: p.id,
    name: p.nom,
    address: p.adresse,
    distanceKm: from ? haversineKm(from, { lat: p.latitude, lng: p.longitude }) : (p.distanceKm ?? undefined),
    open: true,
    delivery: p.livraisonActive,
    pickup: true,
    available: "unknown",
  };
}

function SearchModule({
  onSearch,
  onPrescription,
  nearbyPharmacies,
  onSelectPharmacy,
  onShowMap,
  onGoHome,
  recentSearches,
}: {
  onSearch: (q: string, zone?: SearchZone) => void;
  onPrescription: () => void;
  nearbyPharmacies: Pharmacy[];
  onSelectPharmacy: (p: Pharmacy, q?: string) => void;
  onShowMap: () => void;
  onGoHome: () => void;
  recentSearches: string[];
}) {
  const [q, setQ] = useState("");
  const [commune, setCommune] = useState<string | null>(null);
  const [communeQuery, setCommuneQuery] = useState("");
  const [communeFocused, setCommuneFocused] = useState(false);
  const [rayon, setRayon] = useState(5);
  const [useLocation, setUseLocation] = useState(false);
  const [zoneLoading, setZoneLoading] = useState(false);
  const [zoneError, setZoneError] = useState<string | null>(null);
  // null = liste par défaut (nearbyPharmacies) ; sinon résultat d'une recherche explicite par zone.
  const [zoneResults, setZoneResults] = useState<Pharmacy[] | null>(null);
  const [zoneLabel, setZoneLabel] = useState<string | null>(null);

  const zone = (): SearchZone => ({ commune: commune ?? undefined, rayonKm: rayon, useCurrentLocation: useLocation });

  // Suggestions d'auto-complétion : toutes les villes/communes si le champ est vide et
  // focus, sinon celles dont le nom contient la saisie (insensible accents/majuscules).
  const communeSuggestions = useMemo(() => {
    const toutesLesVilles = Object.keys(VILLES_CI);
    const requete = normaliser(communeQuery.trim());
    const filtrees = requete
      ? toutesLesVilles.filter((v) => normaliser(v).includes(requete))
      : toutesLesVilles;
    return filtrees.slice(0, 8);
  }, [communeQuery]);

  const selectCommune = (nom: string) => {
    setCommune(nom);
    setCommuneQuery(nom);
    setUseLocation(false);
    setCommuneFocused(false);
  };

  const clearCommune = () => {
    setCommune(null);
    setCommuneQuery("");
  };

  // ── Option 1 : Ma position actuelle ──────────────────────────────────────
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      setZoneError("Géolocalisation non disponible sur cet appareil.");
      return;
    }
    setZoneLoading(true);
    setZoneError(null);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setUseLocation(true);
        clearCommune();
        try {
          const from = { lat: coords.latitude, lng: coords.longitude };
          const data = await pharmaciesApi.nearby(coords.latitude, coords.longitude);
          setZoneResults(data.map((p) => toPharmacyCard(p, from)));
          setZoneLabel("Autour de votre position");
        } catch {
          setZoneError("Impossible de récupérer les pharmacies à proximité.");
        } finally {
          setZoneLoading(false);
        }
      },
      () => {
        setZoneError("Localisation refusée ou indisponible.");
        setZoneLoading(false);
      },
    );
  };

  // ── Option 2 : commune/ville + rayon ─────────────────────────────────────
  const handleZoneSearch = async () => {
    if (!commune) return;
    const coords = VILLES_CI[commune];
    setUseLocation(false);
    setZoneLoading(true);
    setZoneError(null);
    try {
      const data = await pharmaciesApi.nearby(coords.lat, coords.lng, rayon);
      setZoneResults(data.map((p) => toPharmacyCard(p, coords)));
      setZoneLabel(`${commune} · ${rayon} km`);
    } catch {
      setZoneError("Impossible de récupérer les pharmacies dans cette zone.");
    } finally {
      setZoneLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (q.trim()) onSearch(q.trim(), zone());
  };

  const resultsList = zoneResults ?? nearbyPharmacies;
  const sortedResults = [...resultsList].sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));

  return (
    <div className="flex flex-col pb-6 bg-white min-h-full">

      {/* ── Header sobre ── */}
      <div className="px-4 pt-5 pb-4 flex items-center gap-3 border-b border-gray-100">
        <button onClick={onGoHome} className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100">
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h2 className="text-lg font-bold text-gray-900">Rechercher un médicament</h2>
      </div>

      <form onSubmit={handleSubmit} className="px-5 pt-5 space-y-5">
        {/* Search bar */}
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un médicament…"
            className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
          />
          {q ? (
            <button type="button" onClick={() => setQ("")}>
              <X className="w-4 h-4 text-gray-400" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onPrescription}
              className="flex items-center gap-1.5 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-xl shrink-0"
            >
              <Camera className="w-3.5 h-3.5" />
              Ordonnance
            </button>
          )}
        </div>

        {/* Zone de recherche */}
        <div className="space-y-4">
          <p className="text-sm font-bold text-gray-900">Trouver une pharmacie disponible</p>

          {/* Option 1 : Ma position actuelle */}
          <button
            type="button"
            onClick={handleUseLocation}
            disabled={zoneLoading}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition disabled:opacity-70"
            style={{
              borderColor: useLocation ? "#1A3072" : "#E5E7EB",
              backgroundColor: useLocation ? "#EEF1F8" : "#F9FAFB",
            }}
          >
            {zoneLoading && useLocation ? (
              <Loader2 className="w-4 h-4 shrink-0 animate-spin" style={{ color: "#1A3072" }} />
            ) : (
              <MapPin className="w-4 h-4 shrink-0" style={{ color: useLocation ? "#1A3072" : "#6B7280" }} />
            )}
            <span className="flex-1 text-left text-sm font-medium text-gray-800">
              {zoneLoading && useLocation ? "Localisation…" : "Ma position actuelle"}
            </span>
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: useLocation ? "#1A3072" : "#F3F4F6" }}>
              <Navigation2 className="w-3.5 h-3.5" style={{ color: useLocation ? "white" : "#6B7280" }} />
            </div>
          </button>

          {/* Option 2 : commune + rayon — toujours visibles, pas de menu déroulant */}
          <div className="rounded-2xl border border-gray-200 p-4">
            <p className="text-xs font-semibold text-gray-500 mb-3">
              Ou rechercher dans une autre zone
            </p>

            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Commune ou ville
            </p>
            <div className="relative mb-3">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  value={communeQuery}
                  onChange={(e) => { setCommuneQuery(e.target.value); setCommune(null); }}
                  onFocus={() => setCommuneFocused(true)}
                  onBlur={() => setCommuneFocused(false)}
                  placeholder="Rechercher une commune ou une ville…"
                  className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400 min-w-0"
                />
                {communeQuery && (
                  <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={clearCommune}>
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>

              {/* Auto-proposition : toute la liste au focus, filtrée en tapant */}
              {communeFocused && communeSuggestions.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                  {communeSuggestions.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectCommune(c)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-gray-50 transition"
                    >
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className={commune === c ? "font-semibold" : "text-gray-700"} style={commune === c ? { color: "#1A3072" } : {}}>
                        {c}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {communeFocused && communeQuery && communeSuggestions.length === 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2.5 text-xs text-gray-400">
                  Aucune ville trouvée pour « {communeQuery} »
                </div>
              )}
            </div>

            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Rayon de recherche</p>
            <div className="flex gap-2 mb-3">
              {RAYONS_KM.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRayon(r)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold border transition"
                  style={{
                    backgroundColor: rayon === r ? "#EEF1F8" : "white",
                    color: rayon === r ? "#1A3072" : "#374151",
                    borderColor: rayon === r ? "#1A3072" : "#E5E7EB",
                  }}
                >
                  {r} km
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleZoneSearch}
              disabled={!commune || zoneLoading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50"
              style={{ backgroundColor: commune ? "#1A3072" : "#E5E7EB", color: commune ? "white" : "#9CA3AF" }}
            >
              {zoneLoading && !useLocation ? "Recherche…" : "Lancer la recherche"}
            </button>
          </div>

          {zoneError && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 text-xs text-red-600">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {zoneError}
            </div>
          )}
        </div>

        {/* Recherche par nom de médicament (optionnelle) : diffuse une demande aux pharmacies de la zone */}
        <div>
          <button
            type="submit"
            disabled={!q.trim()}
            className="w-full py-3.5 rounded-2xl text-white font-bold text-sm disabled:opacity-50 transition"
            style={{ backgroundColor: "#10B981" }}
          >
            Rechercher ce médicament auprès des pharmacies
          </button>
        </div>
      </form>

      {/* ── Recherches récentes ── */}
      {recentSearches.length > 0 && (
        <div className="px-5 pt-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Récents
          </p>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((s) => (
              <button
                key={s}
                onClick={() => onSearch(s)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:border-blue-300 hover:text-blue-600 transition"
              >
                <Clock className="w-3 h-3 text-gray-400" />
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Pharmacies proches ── */}
      <div className="px-5 pt-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-gray-900">{zoneLabel ?? "Pharmacies proches"}</p>
          <button onClick={onShowMap} className="text-xs font-semibold text-blue-600">Voir la carte →</button>
        </div>
        {zoneLoading && (
          <div className="flex items-center gap-2 text-xs text-gray-400 py-3">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Recherche des pharmacies…
          </div>
        )}
        {!zoneLoading && sortedResults.length === 0 && (
          <p className="text-xs text-gray-400 py-3">Aucune pharmacie trouvée dans cette zone.</p>
        )}
        <div className="space-y-3">
          {sortedResults.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelectPharmacy(p, q.trim() || undefined)}
              className="w-full flex items-center gap-3 bg-white rounded-2xl p-4 text-left border border-gray-100 hover:border-blue-200 hover:shadow-sm transition"
            >
              {/* Avatar */}
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-base"
                style={{ backgroundColor: p.open ? "#1A3072" : "#9CA3AF" }}
              >
                {p.name.charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                  <span className="text-xs text-gray-500 truncate">{p.address}</span>
                  {(p.distanceKm ?? 0) > 0 && (
                    <>
                      <span className="text-gray-300 shrink-0">·</span>
                      <span className="text-xs text-gray-500 shrink-0">{p.distanceKm!.toFixed(1)} km</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={
                      p.open
                        ? { backgroundColor: "#ECFDF5", color: "#059669" }
                        : { backgroundColor: "#F3F4F6", color: "#9CA3AF" }
                    }
                  >
                    {p.open ? "● Ouverte" : "● Fermée"}
                  </span>
                  {p.delivery && p.open && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-600">
                      🚴 Livraison
                    </span>
                  )}
                  {p.available === "in-stock" && p.open && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-green-50 text-green-700">
                      En stock
                    </span>
                  )}
                  {p.available === "partial" && p.open && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-700">
                      Partiel
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* ── Ordonnance CTA ── */}
      <div className="px-5 pt-5">
        <button
          onClick={onPrescription}
          className="w-full flex items-center gap-4 rounded-2xl p-4 text-left border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50/40 transition"
          style={{ backgroundColor: "#EEF1F8" }}
        >
          <div className="w-11 h-11 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
            <Camera className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-blue-900">Envoyer une ordonnance</p>
            <p className="text-xs text-blue-500 mt-0.5">Photo ou import · Analyse OCR automatique</p>
          </div>
          <ArrowRight className="w-4 h-4 text-blue-400 shrink-0" />
        </button>
      </div>
    </div>
  );
}

// ── Module 2 : Ordonnance (modal overlay) ───────────────────────────────────

function PrescriptionModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (items: string[]) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [items, setItems] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  const [scanning, setScanning] = useState(false);

  if (!open) return null;

  const handleFile = (f: File) => {
    const url = URL.createObjectURL(f);
    setPreview(url);
    setScanning(true);
    setTimeout(() => {
      setItems(ocrMock);
      setScanning(false);
    }, 1400);
  };

  const close = () => {
    setPreview(null);
    setItems([]);
    setEditing(false);
    onClose();
  };

  const updateItem = (i: number, v: string) => {
    const next = [...items];
    next[i] = v;
    setItems(next);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="font-semibold">Envoyer mon ordonnance</h3>
          <button onClick={close} className="p-1.5 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!preview ? (
            <label className="block border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <div
                className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-3"
                style={{ backgroundColor: "#EEF1F8" }}
              >
                <Camera className="w-7 h-7" style={{ color: "#1A3072" }} />
              </div>
              <p className="text-gray-700 font-medium">Prenez une photo ou importez</p>
              <p className="text-sm text-gray-400 mt-1">PNG / JPG · Analyse OCR automatique</p>
              <div className="mt-4 flex justify-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm">
                  <Camera className="w-4 h-4" /> Photo
                </span>
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm">
                  <Upload className="w-4 h-4" /> Importer
                </span>
              </div>
            </label>
          ) : (
            <>
              <div className="rounded-2xl overflow-hidden border border-gray-200 relative">
                <img src={preview} alt="Ordonnance" className="w-full max-h-56 object-cover" />
                {scanning && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="bg-white px-4 py-2 rounded-xl text-sm animate-pulse">
                      Analyse OCR en cours…
                    </div>
                  </div>
                )}
              </div>
              {!scanning && items.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 font-medium">
                      {items.length} médicament(s) détecté(s)
                    </span>
                    <button
                      onClick={() => setEditing(!editing)}
                      className="flex items-center gap-1 text-sm text-blue-600"
                    >
                      <Edit3 className="w-4 h-4" />
                      {editing ? "Terminer" : "Corriger"}
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {items.map((it, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2"
                      >
                        <Check className="w-4 h-4 shrink-0 text-green-500" />
                        {editing ? (
                          <input
                            value={it}
                            onChange={(e) => updateItem(i, e.target.value)}
                            className="flex-1 bg-transparent outline-none text-sm"
                          />
                        ) : (
                          <span className="text-sm text-gray-700">{it}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => onConfirm(items)}
                    className="mt-4 w-full py-3 rounded-xl text-white text-sm font-medium"
                    style={{ backgroundColor: "#1A3072" }}
                  >
                    Rechercher ces médicaments
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Module 3+4 : Pharmacies disponibles + réponses ──────────────────────────

const availConfig = {
  "in-stock": {
    label: "Disponible",
    color: "#10B981",
    bg: "#F0FDF4",
    icon: CheckCircle2,
  },
  partial: {
    label: "Partiel",
    color: "#F47920",
    bg: "#FFF3E6",
    icon: Info,
  },
  unknown: {
    label: "Non confirmé",
    color: "#6B7280",
    bg: "#F9FAFB",
    icon: AlertCircle,
  },
};

// Estimation simple du temps de trajet à partir de la distance (≈ 25 km/h en ville)
function estimerTempsMin(distanceKm: number): number {
  return Math.max(3, Math.round((distanceKm / 25) * 60));
}

function PharmaciesModule({
  query,
  items,
  pharmacies,
  onSelect,
  onBack,
  onShowMap,
  cityLabel,
}: {
  query: string;
  items: string[];
  pharmacies: Pharmacy[];
  onSelect: (p: Pharmacy) => void;
  onBack: () => void;
  onShowMap: () => void;
  cityLabel: string;
}) {
  const [filter, setFilter] = useState<"all" | "in-stock" | "partial">("all");

  const filtered = useMemo(() => {
    if (filter === "all") return pharmacies;
    return pharmacies.filter((p) => p.available === filter);
  }, [pharmacies, filter]);

  const counts = useMemo(
    () => ({
      all: pharmacies.length,
      "in-stock": pharmacies.filter((p) => p.available === "in-stock").length,
      partial: pharmacies.filter((p) => p.available === "partial").length,
    }),
    [pharmacies],
  );

  return (
    <div className="flex flex-col pb-6">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-blue-600 font-medium mb-3"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour
        </button>
        <h2 className="text-lg font-bold text-gray-900">
          {query ? `Résultats pour "${query}"` : "Pharmacies disponibles"}
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">{pharmacies.length} pharmacies · {cityLabel}</p>

        {/* Searched items */}
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {items.map((it) => (
              <span
                key={it}
                className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
              >
                <Pill className="w-3 h-3" />
                {it}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 px-5 pb-4 overflow-x-auto">
        {(["all", "in-stock", "partial"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition"
            style={{
              backgroundColor: filter === f ? "#1A3072" : "#F3F4F6",
              color: filter === f ? "white" : "#374151",
            }}
          >
            {f === "all" ? `Tous (${counts.all})` : f === "in-stock" ? `Disponibles (${counts["in-stock"]})` : `Partiels (${counts.partial})`}
          </button>
        ))}
      </div>

      {/* Pharmacy cards */}
      <div className="space-y-3 px-5">
        {filtered.map((p) => {
          const avail = availConfig[p.available];
          const AvailIcon = avail.icon;
          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 truncate">{p.name}</h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium`}
                      style={{ backgroundColor: avail.bg, color: avail.color }}
                    >
                      <AvailIcon className="w-3 h-3" />
                      {avail.label}
                    </span>
                    {p.open ? (
                      <span className="text-xs text-green-600">● Ouverte</span>
                    ) : (
                      <span className="text-xs text-gray-400">● Fermée</span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="truncate">{p.address}</span>
                    {(p.distanceKm ?? 0) > 0 && (
                      <>
                        <span className="mx-1 shrink-0">·</span>
                        <span className="shrink-0">{p.distanceKm!.toFixed(1)} km</span>
                        <span className="mx-1 shrink-0">·</span>
                        <span className="shrink-0 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {estimerTempsMin(p.distanceKm!)} min
                        </span>
                      </>
                    )}
                  </div>
                  {p.delivery && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                      <Truck className="w-3.5 h-3.5" />
                      Livraison disponible
                    </div>
                  )}
                  {p.prix != null && (
                    <p className="mt-2 text-sm font-bold" style={{ color: "#1A3072" }}>
                      {p.prix.toLocaleString("fr-FR")} FCFA
                    </p>
                  )}
                </div>
              </div>

              {/* Availability response banner */}
              {p.available === "partial" && (
                <div className="mt-3 flex items-start gap-2 bg-amber-50 rounded-xl p-3 text-sm text-amber-700">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  Certains médicaments ne sont pas disponibles. La pharmacie peut
                  vous proposer une alternative.
                </div>
              )}
              {p.available === "unknown" && (
                <div className="mt-3 flex items-start gap-2 bg-gray-50 rounded-xl p-3 text-sm text-gray-500">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  Disponibilité à confirmer directement avec la pharmacie.
                </div>
              )}

              {/* Action button */}
              <button
                disabled={!p.open}
                onClick={() => onSelect(p)}
                className="mt-3 w-full py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: p.open ? "#1A3072" : "#E5E7EB",
                  color: p.open ? "white" : "#9CA3AF",
                }}
              >
                {p.open ? "Choisir cette pharmacie →" : "Pharmacie fermée"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Voir sur la carte */}
      <div className="px-5 pt-2">
        <button
          onClick={onShowMap}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-bold text-sm transition"
          style={{ backgroundColor: "#1A3072" }}
        >
          <MapPin className="w-4 h-4" />
          Voir sur la carte
        </button>
      </div>
    </div>
  );
}

// ── Module 5 : Mode d'obtention ───────────────────────────────────────────────

function ModeModule({
  pharmacy,
  onSelect,
  onBack,
}: {
  pharmacy: Pharmacy;
  onSelect: (mode: "pickup" | "delivery") => void;
  onBack: () => void;
}) {
  const [selected, setSelected] = useState<"pickup" | "delivery" | null>(null);

  return (
    <div className="flex flex-col gap-4 px-5 py-5 pb-6">
      <div>
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-blue-600 font-medium mb-3">
          <ChevronLeft className="w-4 h-4" />
          Retour
        </button>
        <h2 className="text-lg font-bold text-gray-900">Mode d'obtention</h2>
        <p className="text-sm text-gray-500 mt-0.5">{pharmacy.name}</p>
      </div>

      <div className="space-y-3">
        {/* Retrait */}
        {pharmacy.pickup && (
          <button
            onClick={() => setSelected("pickup")}
            className="w-full flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition"
            style={{
              borderColor: selected === "pickup" ? "#1A3072" : "#E5E7EB",
              backgroundColor: selected === "pickup" ? "#EEF1F8" : "white",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: selected === "pickup" ? "#D6DCF0" : "#F3F4F6",
              }}
            >
              <Package
                className="w-6 h-6"
                style={{ color: selected === "pickup" ? "#1A3072" : "#6B7280" }}
              />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Retrait en pharmacie</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Venez chercher votre commande directement · Gratuit
              </p>
              <div className="mt-2 flex items-center gap-1 text-sm text-blue-600">
                <Clock className="w-3.5 h-3.5" />
                Prêt à la demande
              </div>
            </div>
            {selected === "pickup" && (
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
            )}
          </button>
        )}

        {/* Livraison */}
        {pharmacy.delivery && (
          <button
            onClick={() => setSelected("delivery")}
            className="w-full flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition"
            style={{
              borderColor: selected === "delivery" ? "#1A3072" : "#E5E7EB",
              backgroundColor: selected === "delivery" ? "#EEF1F8" : "white",
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: selected === "delivery" ? "#D6DCF0" : "#F3F4F6",
              }}
            >
              <Truck
                className="w-6 h-6"
                style={{ color: selected === "delivery" ? "#1A3072" : "#6B7280" }}
              />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Livraison à domicile</p>
              <p className="text-sm text-gray-500 mt-0.5">
                Livré chez vous · +300 FCFA de frais
              </p>
              <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
                <Clock className="w-3.5 h-3.5" />
                Livraison à domicile
              </div>
            </div>
            {selected === "delivery" && (
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
            )}
          </button>
        )}
      </div>

      <button
        disabled={!selected}
        onClick={() => selected && onSelect(selected)}
        className="w-full py-3 rounded-xl text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: "#1A3072" }}
      >
        Continuer →
      </button>
    </div>
  );
}

// ── Module 6 : Validation de la commande ─────────────────────────────────────

function ValidationModule({
  pharmacy,
  mode,
  items,
  onConfirm,
  onBack,
}: {
  pharmacy: Pharmacy;
  mode: "pickup" | "delivery";
  items: string[];
  onConfirm: (address: string) => void;
  onBack: () => void;
}) {
  const [address, setAddress] = useState("");

  const displayItems = items.length ? items : ["Médicament"];
  const fee = mode === "delivery" ? 300 : 0;

  return (
    <div className="flex flex-col gap-4 px-5 py-5 pb-6">
      <div>
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-blue-600 font-medium mb-3">
          <ChevronLeft className="w-4 h-4" />
          Retour
        </button>
        <h2 className="text-lg font-bold text-gray-900">Résumé de la commande</h2>
      </div>

      {/* Pharmacy info */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2">
        <p className="text-xs text-gray-400 uppercase tracking-wide">Pharmacie</p>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#EEF1F8" }}
          >
            <MapPin className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{pharmacy.name}</p>
            <p className="text-sm text-gray-500">{pharmacy.address}</p>
          </div>
        </div>
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: mode === "delivery" ? "#EEF1F8" : "#F0FDF4",
            color: mode === "delivery" ? "#1A3072" : "#059669",
          }}
        >
          {mode === "delivery" ? (
            <><Truck className="w-3.5 h-3.5" /> Livraison à domicile</>
          ) : (
            <><Package className="w-3.5 h-3.5" /> Retrait en pharmacie</>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-700">
            Articles ({displayItems.length})
          </p>
        </div>
        <ul className="divide-y divide-gray-50">
          {displayItems.map((it, i) => (
            <li key={i} className="flex items-center gap-2 px-4 py-3 text-sm">
              <Pill className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-gray-700">{it}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Delivery address */}
      {mode === "delivery" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Adresse de livraison
          </label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Rue, quartier, wilaya..."
            className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-blue-400 text-sm"
          />
        </div>
      )}

      {/* Total */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Médicaments</span>
          <span className="italic text-gray-400">Prix en pharmacie</span>
        </div>
        {mode === "delivery" && (
          <div className="flex justify-between text-sm text-gray-500 pt-2 border-t border-gray-100">
            <span>Frais de livraison</span>
            <span className="font-semibold text-gray-900">300 FCFA</span>
          </div>
        )}
      </div>

      <button
        disabled={mode === "delivery" && !address.trim()}
        onClick={() => onConfirm(address)}
        className="w-full py-3 rounded-xl text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: "#1A3072" }}
      >
        Valider la commande →
      </button>
    </div>
  );
}

// ── Module 7 : Paiement ───────────────────────────────────────────────────────

type PayMethod = "cash" | "WAVE" | "ORANGE_MONEY" | "MTN_MONEY";

const MOBILE_MONEY_METHODS: { key: PayMethod; label: string; icon: string }[] = [
  { key: "WAVE",         label: "Wave",             icon: waveIcon },
  { key: "ORANGE_MONEY", label: "Orange Money",     icon: orangeMoneyIcon },
  { key: "MTN_MONEY",    label: "MTN Mobile Money", icon: mtnMoneyIcon },
];

function PaymentModule({
  items,
  mode,
  onPay,
  onBack,
}: {
  items: string[];
  mode: "pickup" | "delivery";
  onPay: (method: PayMethod) => void;
  onBack: () => void;
}) {
  const [payMethod, setPayMethod] = useState<PayMethod>("cash");
  const [phone, setPhone] = useState("");

  const fee = mode === "delivery" ? 300 : 0;
  const isMobileMoney = payMethod !== "cash";
  const selectedProvider = MOBILE_MONEY_METHODS.find((m) => m.key === payMethod);

  return (
    <div className="flex flex-col gap-4 px-5 py-5 pb-6">
      <div>
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-blue-600 font-medium mb-3">
          <ChevronLeft className="w-4 h-4" />
          Retour
        </button>
        <h2 className="text-lg font-bold text-gray-900">Paiement</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {fee > 0 ? "Règle les frais de livraison avec le moyen de ton choix" : "Choisis ton moyen de paiement"}
        </p>
      </div>

      <div className="space-y-3">
        {/* Espèces */}
        <button
          onClick={() => setPayMethod("cash")}
          className="w-full flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition"
          style={{
            borderColor: payMethod === "cash" ? "#1A3072" : "#E5E7EB",
            backgroundColor: payMethod === "cash" ? "#EEF1F8" : "white",
          }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: payMethod === "cash" ? "#D6DCF0" : "#F3F4F6" }}
          >
            <Banknote
              className="w-6 h-6"
              style={{ color: payMethod === "cash" ? "#1A3072" : "#6B7280" }}
            />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">
              {mode === "delivery" ? "Espèces à la livraison" : "Espèces en pharmacie"}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              Payez en espèces directement {mode === "delivery" ? "au livreur" : "à la pharmacie"}
            </p>
          </div>
          {payMethod === "cash" && (
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
          )}
        </button>

        {/* Mobile money : Wave, Orange Money, MTN */}
        {MOBILE_MONEY_METHODS.map((m) => {
          const active = payMethod === m.key;
          return (
            <button
              key={m.key}
              onClick={() => setPayMethod(m.key)}
              className="w-full flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition"
              style={{
                borderColor: active ? "#1A3072" : "#E5E7EB",
                backgroundColor: active ? "#EEF1F8" : "white",
              }}
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                <img src={m.icon} alt={m.label} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{m.label}</p>
                <p className="text-sm text-gray-500 mt-0.5">Paiement mobile money</p>
              </div>
              {active && <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Numéro mobile money */}
      {isMobileMoney && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">
            Numéro {selectedProvider?.label}
          </p>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s]/g, ""))}
            placeholder="+225 07 00 00 00 00"
            className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-blue-400 text-sm"
          />
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
            Vous recevrez une demande de confirmation sur votre téléphone
          </div>
        </div>
      )}

      {/* Order total */}
      <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Médicaments</span>
          <span className="italic text-gray-400">À régler en pharmacie</span>
        </div>
        {fee > 0 && (
          <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-200">
            <span>Frais de livraison</span>
            <span style={{ color: "#1A3072" }}>{fee} FCFA</span>
          </div>
        )}
      </div>

      <button
        onClick={() => onPay(payMethod)}
        disabled={isMobileMoney && !phone.trim()}
        className="w-full py-3 rounded-xl text-white font-medium disabled:opacity-50 transition"
        style={{ backgroundColor: "#1A3072" }}
      >
        {payMethod === "cash"
          ? mode === "delivery"
            ? "Confirmer — Payer à la livraison"
            : "Confirmer — Payer au retrait"
          : `Payer avec ${selectedProvider?.label} →`}
      </button>

      {/* Phone contact */}
      <div className="text-center">
        <a
          href="tel:+22527000000"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <Phone className="w-4 h-4" />
          Besoin d'aide ? Appelez-nous
        </a>
      </div>
    </div>
  );
}

// ── Module : Suivi de commande ────────────────────────────────────────────────

function TrackingModule({
  orderStep,
  orderMode,
  items,
  pharmacy,
  onNewOrder,
}: {
  orderStep: OrderStep;
  orderMode: "pickup" | "delivery";
  items: string[];
  pharmacy: Pharmacy | null;
  onNewOrder: () => void;
}) {
  const displayItems = items.length ? items : ["Médicament (article)"];

  return (
    <div className="flex flex-col gap-4 px-5 py-5 pb-6">
      <div className="text-center py-4">
        <div
          className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3"
          style={{ backgroundColor: "#F0FDF4" }}
        >
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="font-bold text-gray-900 text-xl">Commande confirmée !</h2>
        <p className="text-gray-500 mt-1 text-sm">
          Votre commande a été transmise à la pharmacie.
        </p>
      </div>

      <OrderStatus current={orderStep} mode={orderMode} />

      {pharmacy && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
            Pharmacie
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{pharmacy.name}</p>
              <p className="text-sm text-gray-500">{pharmacy.address}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-700">Votre commande</p>
        </div>
        <ul className="divide-y divide-gray-50">
          {displayItems.map((it, i) => (
            <li key={i} className="px-4 py-3 text-sm text-gray-700 flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500 shrink-0" />
              {it}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-2 bg-blue-50 rounded-2xl p-4 text-sm text-blue-700">
        <ShieldCheck className="w-5 h-5 shrink-0" />
        Vos données médicales sont transmises de manière sécurisée aux pharmacies partenaires uniquement.
      </div>

      <button
        onClick={onNewOrder}
        className="w-full py-3 rounded-xl text-white font-medium"
        style={{ backgroundColor: "#1A3072" }}
      >
        Nouvelle recherche
      </button>
    </div>
  );
}

// ── Notifications page ────────────────────────────────────────────────────────

const notifIconConfig = {
  order: { bg: "#EEF1F8", color: "#1A3072", Icon: ClipboardList },
  pharmacy: { bg: "#F0FDF4", color: "#059669", Icon: MapPin },
  promo: { bg: "#FFF3E6", color: "#D4680F", Icon: Pill },
  system: { bg: "#FFF3E6", color: "#D4680F", Icon: Bell },
};

function NotificationsPage({
  notifications,
  onMarkAllRead,
}: {
  notifications: Notif[];
  onMarkAllRead: () => void;
}) {
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900 text-lg">Notifications</h2>
          {unread > 0 && (
            <p className="text-sm text-gray-500">{unread} non lue(s)</p>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Tout marquer lu
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
          <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucune notification pour l'instant.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const cfg = notifIconConfig[n.icon];
            const { Icon } = cfg;
            return (
              <div
                key={n.id}
                className="bg-white rounded-2xl border p-4 flex items-start gap-3 transition"
                style={{
                  borderColor: n.read ? "#F3F4F6" : "#B8C5E5",
                  backgroundColor: n.read ? "white" : "#EEF1F8",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: cfg.bg }}
                >
                  <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className="text-sm font-semibold text-gray-900"
                      style={{ fontWeight: n.read ? 500 : 700 }}
                    >
                      {n.title}
                    </p>
                    {!n.read && (
                      <span
                        className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                        style={{ backgroundColor: "#1A3072" }}
                      />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5 leading-snug">{n.body}</p>
                  <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Profile page ──────────────────────────────────────────────────────────────

function ProfilePage({ onLogout, userId, orders }: { onLogout: () => void; userId: string; orders: OrderDisplay[] }) {
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [editing, setEditing] = useState(false);
  const [patientData, setPatientData] = useState<PatientAPI | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!userId) return;
    patientsApi.getById(userId).then((p) => {
      setPatientData(p);
      setName(`${p.prenom} ${p.nom}`);
      setPhone(p.telephone);
    }).catch(() => {});
  }, [userId]);

  return (
    <div className="flex flex-col gap-4 px-5 py-5 pb-6">
      {/* Avatar & identity */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shrink-0"
            style={{
              background: "linear-gradient(135deg, #1A3072 0%, #1A3072 100%)",
            }}
          >
            {name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-lg font-bold text-gray-900 border-b border-blue-300 outline-none bg-transparent"
              />
            ) : (
              <p className="text-lg font-bold text-gray-900 truncate">{name}</p>
            )}
            <p className="text-sm text-gray-500 mt-0.5">{patientData?.email ?? ""}</p>
            {patientData?.createdAt && (
              <span className="inline-flex items-center gap-1 mt-1 text-xs text-green-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Membre depuis {new Date(patientData.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
              </span>
            )}
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Coordonnées */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Coordonnées
          </p>
        </div>
        <div className="divide-y divide-gray-50">
          <div className="flex items-center gap-3 px-4 py-3">
            <Phone className="w-4 h-4 text-gray-400 shrink-0" />
            {editing ? (
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 text-sm text-gray-800 outline-none border-b border-blue-300 bg-transparent"
              />
            ) : (
              <span className="text-sm text-gray-800">{phone}</span>
            )}
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
            {editing ? (
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="flex-1 text-sm text-gray-800 outline-none border-b border-blue-300 bg-transparent"
              />
            ) : (
              <span className="text-sm text-gray-800">{address}</span>
            )}
          </div>
        </div>
        {editing && (
          <div className="px-4 pb-3">
            <button
              onClick={() => setEditing(false)}
              className="w-full py-2 rounded-xl text-white text-sm"
              style={{ backgroundColor: "#1A3072" }}
            >
              Enregistrer
            </button>
          </div>
        )}
      </div>

      {/* Historique commandes */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Historique des commandes
          </p>
          <span className="text-xs text-gray-400">{orders.length} commande(s)</span>
        </div>
        <div className="divide-y divide-gray-50">
          {orders.length === 0 ? (
            <div className="px-4 py-4 text-center">
              <p className="text-sm text-gray-400">Aucune commande pour le moment.</p>
            </div>
          ) : (
            orders.map((o) => (
              <div key={o.id} className="px-4 py-3 flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#EEF1F8" }}
                >
                  <ClipboardList className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {o.pharmacy}
                    </p>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                      style={{
                        backgroundColor: o.statusColor + "18",
                        color: o.statusColor,
                      }}
                    >
                      {o.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {o.items.join(", ")}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400">{o.date}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Préférences */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Préférences
          </p>
        </div>
        <div className="divide-y divide-gray-50">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-800">Notifications</span>
            </div>
            <button
              onClick={() => setNotifEnabled(!notifEnabled)}
              className="relative w-10 h-6 rounded-full transition-colors"
              style={{ backgroundColor: notifEnabled ? "#1A3072" : "#D1D5DB" }}
            >
              <span
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                style={{ left: notifEnabled ? "22px" : "2px" }}
              />
            </button>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Navigation2 className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-800">Géolocalisation</span>
            </div>
            <button
              onClick={() => setLocationEnabled(!locationEnabled)}
              className="relative w-10 h-6 rounded-full transition-colors"
              style={{ backgroundColor: locationEnabled ? "#1A3072" : "#D1D5DB" }}
            >
              <span
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
                style={{ left: locationEnabled ? "22px" : "2px" }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Menu actions */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {[
          { icon: Shield, label: "Confidentialité & données", color: "#6B7280" },
          { icon: HelpCircle, label: "Aide & support", color: "#6B7280" },
          { icon: Settings, label: "Paramètres du compte", color: "#6B7280" },
        ].map(({ icon: Icon, label, color }) => (
          <button
            key={label}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 border-gray-50 text-left"
          >
            <div className="flex items-center gap-3">
              <Icon className="w-4 h-4" style={{ color }} />
              <span className="text-sm text-gray-800">{label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 transition"
      >
        <LogOut className="w-4 h-4" />
        <span className="text-sm font-medium">Déconnexion</span>
      </button>
    </div>
  );
}

// ── Home tab ─────────────────────────────────────────────────────────────────

function HomeTab({
  onGoSearch,
  onPrescription,
  onGoCommandes,
}: {
  onGoSearch: () => void;
  onPrescription: () => void;
  onGoCommandes: () => void;
}) {
  return (
    <div className="px-4 pb-6 space-y-4 pt-4">
      {/* Welcome card */}
      <div
        className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1A3072 0%, #1A3072 60%, #10B981 120%)" }}
      >
        <div className="relative z-10">
          <p className="text-sm text-white/80">Bonjour 👋</p>
          <h2 className="text-xl font-bold mt-0.5">Comment puis-je vous aider ?</h2>
          <p className="text-xs text-white/70 mt-1">Trouvez vos médicaments rapidement</p>
        </div>
        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute -right-2 top-10 w-14 h-14 rounded-full bg-white/10" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onGoSearch}
          className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 border border-gray-100 hover:border-blue-200 transition"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#EEF1F8" }}
          >
            <Search className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-xs font-medium text-gray-700 text-center">Chercher un médicament</span>
        </button>
        <button
          onClick={onPrescription}
          className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 border border-gray-100 hover:border-blue-200 transition"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#F0FDF4" }}
          >
            <Camera className="w-5 h-5 text-green-600" />
          </div>
          <span className="text-xs font-medium text-gray-700 text-center">Envoyer ordonnance</span>
        </button>
        <button
          onClick={onGoSearch}
          className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 border border-gray-100 hover:border-blue-200 transition"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#FFF3E6" }}
          >
            <MapPin className="w-5 h-5 text-orange-500" />
          </div>
          <span className="text-xs font-medium text-gray-700 text-center">Pharmacies proches</span>
        </button>
        <button
          onClick={onGoCommandes}
          className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 border border-gray-100 hover:border-blue-200 transition"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "#FFF3E6" }}
          >
            <ClipboardList className="w-5 h-5" style={{ color: "#F47920" }} />
          </div>
          <span className="text-xs font-medium text-gray-700 text-center">Mes commandes</span>
        </button>
      </div>

      {/* Security banner */}
      <div
        className="flex items-center gap-3 rounded-2xl p-4"
        style={{ backgroundColor: "#F0FDF4" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: "#DCFCE7" }}
        >
          <ShieldCheck className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-green-900">Données sécurisées</p>
          <p className="text-xs text-green-700">Vos informations médicales sont protégées</p>
        </div>
      </div>
    </div>
  );
}

// ── Détail d'une ordonnance (vue patient) ────────────────────────────────────

const SPECIALITE_LABELS: Record<string, string> = {
  GENERALISTE: "Médecin généraliste",
  CARDIOLOGUE: "Cardiologue",
  DERMATOLOGUE: "Dermatologue",
  PEDIATRE: "Pédiatre",
  GYNECOLOGUE: "Gynécologue",
  NEUROLOGUE: "Neurologue",
  OPHTALMOLOGUE: "Ophtalmologue",
  ORL: "ORL",
  PNEUMOLOGUE: "Pneumologue",
  AUTRE: "Médecin",
};

const MED_CARD_COLORS = ["#1A3072", "#059669", "#F47920", "#7C3AED", "#DC2626"];

function OrdonnanceDetailModal({
  ordonnance,
  patientName,
  onClose,
  onOrderFromOrdonnance,
}: {
  ordonnance: OrdonnanceAPI;
  patientName: string;
  onClose: () => void;
  onOrderFromOrdonnance?: (drugs: string[], ordonnanceId: string) => void;
}) {
  const isMedecin = ordonnance.source === "MEDECIN";
  const dateLabel = new Date(ordonnance.createdAt).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
  });
  const specialiteLabel = ordonnance.medecinSpecialite
    ? (SPECIALITE_LABELS[ordonnance.medecinSpecialite] ?? ordonnance.medecinSpecialite)
    : null;
  const drugNames = isMedecin
    ? ordonnance.lignes.map((l) => l.medicament.nomCommercial)
    : ordonnance.medicamentsOcr.map((m) => m.medicament.nomCommercial);

  const handleShare = async () => {
    const text = `Ordonnance du ${dateLabel}` + (isMedecin ? ` — Dr. ${ordonnance.medecinPrenom} ${ordonnance.medecinNom}` : "");
    if (navigator.share) {
      try { await navigator.share({ title: "Mon ordonnance", text }); } catch { /* annulé par l'utilisateur */ }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        alert("Résumé de l'ordonnance copié dans le presse-papiers.");
      } catch { /* presse-papiers indisponible */ }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 shrink-0">
        <button onClick={onClose} className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100">
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h2 className="text-base font-bold text-gray-900">Mon ordonnance</h2>
        <button onClick={() => window.print()} title="Télécharger / imprimer" className="p-1.5 -mr-1.5 rounded-full hover:bg-gray-100">
          <Download className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-5">
        {/* Patient + statut */}
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-white font-bold"
            style={{ backgroundColor: "#1A3072" }}
          >
            {patientName.charAt(0) || "P"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 truncate">{patientName || "Patient"}</p>
            <p className="text-xs text-gray-400 mt-0.5">Ordonnance du {dateLabel}</p>
          </div>
          {isMedecin && (
            <span
              className="text-xs font-semibold px-3 py-1 rounded-full shrink-0"
              style={{ backgroundColor: "#DCFCE7", color: "#059669" }}
            >
              Valide
            </span>
          )}
        </div>

        {/* Médicaments prescrits */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Médicaments prescrits
          </p>
          <div className="space-y-3">
            {isMedecin ? (
              ordonnance.lignes.map((l, i) => (
                <div key={l.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
                      style={{ backgroundColor: MED_CARD_COLORS[i % MED_CARD_COLORS.length] }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900">
                        {l.medicament.nomCommercial} {l.medicament.dosage}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{l.medicament.forme}</p>
                      <div className="mt-2.5 space-y-1.5 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <Package className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          {l.quantite} {l.medicament.forme.toLowerCase()}(s)
                        </p>
                        {l.posologie && (
                          <p className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            {l.posologie}
                          </p>
                        )}
                        {l.duree && (
                          <p className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            Durée : {l.duree}
                          </p>
                        )}
                        {l.instructions && (
                          <p className="flex items-center gap-2">
                            <Info className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            {l.instructions}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : ordonnance.medicamentsOcr.length > 0 ? (
              ordonnance.medicamentsOcr.map((m, i) => (
                <div key={m.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
                    style={{ backgroundColor: MED_CARD_COLORS[i % MED_CARD_COLORS.length] }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {m.medicament.nomCommercial} {m.medicament.dosage}
                    </p>
                    <p className="text-xs text-gray-400">{m.quantite}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                {ordonnance.statut === "EN_ATTENTE_OCR" ? "Analyse en cours…" : "Aucun médicament détecté."}
              </p>
            )}
          </div>
        </div>

        {/* Important */}
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-amber-50 text-amber-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            <strong>Important :</strong> Respectez la posologie et la durée prescrites. En cas
            d'effets indésirables, consultez votre médecin.
          </p>
        </div>

        {/* Médecin */}
        {isMedecin && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-gray-100">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#EEF1F8" }}
            >
              <Stethoscope className="w-5 h-5" style={{ color: "#1A3072" }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                Dr. {ordonnance.medecinPrenom} {ordonnance.medecinNom}
              </p>
              {specialiteLabel && <p className="text-xs text-gray-400">{specialiteLabel}</p>}
              {ordonnance.medecinNumeroOrdre && (
                <p className="text-[11px] text-gray-400">N° Ordre : {ordonnance.medecinNumeroOrdre}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 py-4 border-t border-gray-100 space-y-2 shrink-0">
        {onOrderFromOrdonnance && drugNames.length > 0 && (
          <button
            onClick={() => { onOrderFromOrdonnance(drugNames, ordonnance.id); onClose(); }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-white font-semibold text-sm transition active:scale-[0.98]"
            style={{ backgroundColor: "#059669" }}
          >
            <Send className="w-4 h-4" />
            Envoyer à la pharmacie
          </button>
        )}
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition"
        >
          <Share2 className="w-4 h-4" />
          Partager l'ordonnance
        </button>
      </div>
    </div>
  );
}

// ── Suivi (dashboard) tab ─────────────────────────────────────────────────────

function SuiviTab({ prescriptions, rawOrdonnances, patientName, patientData, rappels, onOrderFromOrdonnance, onToggleRappel, onAddRappel, onDeleteRappel, onUpdateMesures }: {
  prescriptions: PrescriptionDisplay[];
  rawOrdonnances: OrdonnanceAPI[];
  patientName: string;
  patientData: PatientAPI | null;
  rappels: RappelAPI[];
  onOrderFromOrdonnance?: (drugs: string[], ordonnanceId: string) => void;
  onToggleRappel: (r: RappelAPI) => void;
  onAddRappel: (medicamentNom: string, dose: string, heure: string) => void;
  onDeleteRappel: (id: string) => void;
  onUpdateMesures: (m: { rythmeCardiaque?: number; tensionSystolique?: number; tensionDiastolique?: number; poids?: number; glycemie?: number }) => Promise<void>;
}) {
  const [selectedOrdonnanceId, setSelectedOrdonnanceId] = useState<string | null>(null);
  const [editMesures, setEditMesures] = useState(false);
  const [mRC, setMRC] = useState("");
  const [mSys, setMSys] = useState("");
  const [mDia, setMDia] = useState("");
  const [mPoids, setMPoids] = useState("");
  const [mGly, setMGly] = useState("");
  const [showAddRappel, setShowAddRappel] = useState(false);
  const [newMed, setNewMed] = useState("");
  const [newDose, setNewDose] = useState("");
  const [newHeure, setNewHeure] = useState("08:00");

  const openEditMesures = () => {
    setMRC(patientData?.rythmeCardiaque?.toString() ?? "");
    setMSys(patientData?.tensionSystolique?.toString() ?? "");
    setMDia(patientData?.tensionDiastolique?.toString() ?? "");
    setMPoids(patientData?.poids?.toString() ?? "");
    setMGly(patientData?.glycemie?.toString() ?? "");
    setEditMesures(true);
  };

  const saveMesures = async () => {
    await onUpdateMesures({
      rythmeCardiaque: mRC ? parseInt(mRC) : undefined,
      tensionSystolique: mSys ? parseInt(mSys) : undefined,
      tensionDiastolique: mDia ? parseInt(mDia) : undefined,
      poids: mPoids ? parseFloat(mPoids) : undefined,
      glycemie: mGly ? parseFloat(mGly) : undefined,
    });
    setEditMesures(false);
  };

  type VitalRow = { label: string; value: string; unit: string; icon: React.ElementType; color: string; bg: string; status: string; statusOk: boolean };
  const vitals: VitalRow[] = [
    {
      label: "Rythme cardiaque",
      value: patientData?.rythmeCardiaque ? String(patientData.rythmeCardiaque) : "—",
      unit: "BPM",
      icon: Heart,
      color: "#EF4444", bg: "#FEE2E2",
      status: !patientData?.rythmeCardiaque ? "Non renseigné" : (patientData.rythmeCardiaque >= 60 && patientData.rythmeCardiaque <= 100 ? "Normal" : "À surveiller"),
      statusOk: !!patientData?.rythmeCardiaque && patientData.rythmeCardiaque >= 60 && patientData.rythmeCardiaque <= 100,
    },
    {
      label: "Tension artérielle",
      value: (patientData?.tensionSystolique && patientData?.tensionDiastolique)
        ? `${patientData.tensionSystolique}/${patientData.tensionDiastolique}` : "—",
      unit: "cmHg",
      icon: Activity,
      color: "#2563EB", bg: "#DBEAFE",
      status: !patientData?.tensionSystolique ? "Non renseigné" : (patientData.tensionSystolique >= 90 && patientData.tensionSystolique <= 140 ? "Normal" : "À surveiller"),
      statusOk: !!patientData?.tensionSystolique && patientData.tensionSystolique >= 90 && patientData.tensionSystolique <= 140,
    },
    {
      label: "Poids",
      value: patientData?.poids ? String(patientData.poids) : "—",
      unit: "kg",
      icon: Scale,
      color: "#059669", bg: "#DCFCE7",
      status: !patientData?.poids ? "Non renseigné" : "Stable",
      statusOk: !!patientData?.poids,
    },
    {
      label: "Glycémie",
      value: patientData?.glycemie ? String(patientData.glycemie) : "—",
      unit: "g/L",
      icon: Droplets,
      color: "#D97706", bg: "#FEF3C7",
      status: !patientData?.glycemie ? "Non renseigné" : (patientData.glycemie >= 0.7 && patientData.glycemie <= 1.1 ? "Normal" : "À surveiller"),
      statusOk: !!patientData?.glycemie && patientData.glycemie >= 0.7 && patientData.glycemie <= 1.1,
    },
  ];

  const prisCnt = rappels.filter((r) => r.pris).length;

  return (
    <div className="px-4 pb-6 pt-4 space-y-5">

      {/* ── Hero ── */}
      <div
        className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #122660 0%, #1A3072 60%, #1A3072 100%)" }}
      >
        <div className="relative z-10">
          <p className="text-xs text-blue-200 mb-1">Tableau de bord santé</p>
          <h2 className="text-xl font-bold">{patientName || "Mon espace"}</h2>
          <div className="flex items-center gap-2 mt-3">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-medium">
              <CheckCircle2 className="w-3 h-3" /> Dossier à jour
            </span>
            {rappels.length > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-medium">
                <Pill className="w-3 h-3" /> {rappels.length} rappel(s) aujourd'hui
              </span>
            )}
          </div>
        </div>
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
        <div className="absolute -right-2 top-12 w-16 h-16 rounded-full bg-white/10" />
      </div>

      {/* ── Mesures de santé ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Dernières mesures</p>
          <button onClick={openEditMesures} className="flex items-center gap-1 text-xs text-blue-600 font-semibold">
            <Pencil className="w-3 h-3" /> Modifier
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {vitals.map(({ label, value, unit, icon: Icon, color, bg, status, statusOk }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                </div>
                <span className="text-[11px] text-gray-500 leading-tight">{label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900">{value}</span>
                <span className="text-xs text-gray-400">{unit}</span>
              </div>
              <p className="text-xs mt-1 font-medium" style={{ color: value === "—" ? "#9CA3AF" : statusOk ? "#059669" : "#D4680F" }}>
                {value === "—" ? status : (statusOk ? "✓ " : "⚠ ") + status}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modal édition mesures ── */}
      {editMesures && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Mes mesures de santé</h3>
              <button onClick={() => setEditMesures(false)} className="p-1.5 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Rythme cardiaque (BPM)", val: mRC, set: setMRC, placeholder: "ex: 74" },
                { label: "Poids (kg)", val: mPoids, set: setMPoids, placeholder: "ex: 70" },
                { label: "Tension systolique", val: mSys, set: setMSys, placeholder: "ex: 12" },
                { label: "Tension diastolique", val: mDia, set: setMDia, placeholder: "ex: 8" },
                { label: "Glycémie (g/L)", val: mGly, set: setMGly, placeholder: "ex: 0.95" },
              ].map(({ label, val, set, placeholder }) => (
                <div key={label} className="col-span-1 flex flex-col gap-1">
                  <label className="text-[11px] text-gray-500 font-medium">{label}</label>
                  <input
                    type="number"
                    step="any"
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-blue-400 text-sm"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={saveMesures}
              className="w-full py-3 rounded-xl text-white font-medium"
              style={{ backgroundColor: "#1A3072" }}
            >
              Enregistrer
            </button>
          </div>
        </div>
      )}

      {/* ── Rappels médicaments ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Rappels du jour</p>
          <div className="flex items-center gap-3">
            {rappels.length > 0 && (
              <span className="text-xs font-semibold text-blue-600">{prisCnt}/{rappels.length} pris</span>
            )}
            <button
              onClick={() => setShowAddRappel(true)}
              className="flex items-center gap-1 text-xs text-blue-600 font-semibold"
            >
              <Plus className="w-3 h-3" /> Ajouter
            </button>
          </div>
        </div>

        {rappels.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <Pill className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Aucun rappel pour aujourd'hui.</p>
            <button
              onClick={() => setShowAddRappel(true)}
              className="mt-3 text-xs text-blue-600 font-semibold"
            >
              + Ajouter un rappel
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {rappels.map((r) => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                <button
                  onClick={() => onToggleRappel(r)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition"
                  style={{ backgroundColor: r.pris ? "#DCFCE7" : "#EEF1F8" }}
                >
                  <Pill className="w-4 h-4" style={{ color: r.pris ? "#059669" : "#1A3072" }} />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{r.medicamentNom}</p>
                  {r.dose && <p className="text-xs text-gray-400 mt-0.5">{r.dose}</p>}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-xs font-bold text-gray-700">{r.heure}</span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={r.pris
                      ? { backgroundColor: "#DCFCE7", color: "#059669" }
                      : { backgroundColor: "#EEF1F8", color: "#1A3072" }
                    }
                  >
                    {r.pris ? "Pris ✓" : "À prendre"}
                  </span>
                </div>
                <button
                  onClick={() => onDeleteRappel(r.id)}
                  className="p-1 rounded-full hover:bg-gray-100 ml-1"
                >
                  <X className="w-3.5 h-3.5 text-gray-300" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ajout rappel ── */}
      {showAddRappel && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Nouveau rappel</h3>
              <button onClick={() => setShowAddRappel(false)} className="p-1.5 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Médicament</label>
                <input
                  value={newMed}
                  onChange={(e) => setNewMed(e.target.value)}
                  placeholder="ex: Doliprane 1000mg"
                  className="mt-1 w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-blue-400 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Dose (optionnel)</label>
                <input
                  value={newDose}
                  onChange={(e) => setNewDose(e.target.value)}
                  placeholder="ex: 1 comprimé"
                  className="mt-1 w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-blue-400 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Heure</label>
                <input
                  type="time"
                  value={newHeure}
                  onChange={(e) => setNewHeure(e.target.value)}
                  className="mt-1 w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-blue-400 text-sm"
                />
              </div>
            </div>
            <button
              disabled={!newMed.trim()}
              onClick={async () => {
                await onAddRappel(newMed, newDose, newHeure);
                setNewMed(""); setNewDose(""); setNewHeure("08:00");
                setShowAddRappel(false);
              }}
              className="w-full py-3 rounded-xl text-white font-medium disabled:opacity-50"
              style={{ backgroundColor: "#1A3072" }}
            >
              Enregistrer
            </button>
          </div>
        </div>
      )}

      {/* ── Ordonnances ── */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          Mes ordonnances
        </p>
        <div className="space-y-3">
          {prescriptions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
              <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Aucune ordonnance enregistrée.</p>
            </div>
          ) : (
            prescriptions.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedOrdonnanceId(p.id)}
                className="bg-white rounded-2xl border border-gray-100 p-4 cursor-pointer hover:border-blue-200 hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: p.active ? "#EEF1F8" : "#F3F4F6" }}
                    >
                      <FileText className="w-5 h-5" style={{ color: p.active ? "#1A3072" : "#9CA3AF" }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{p.doctor}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Émise le {p.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className="text-[10px] px-2.5 py-1 rounded-full font-semibold"
                      style={p.active
                        ? { backgroundColor: "#DCFCE7", color: "#059669" }
                        : { backgroundColor: "#F3F4F6", color: "#9CA3AF" }
                      }
                    >
                      {p.active ? "Active" : "En attente"}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
                {onOrderFromOrdonnance && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onOrderFromOrdonnance(p.drugs ?? [], p.id); }}
                    className="mt-3 w-full py-2 rounded-xl text-white text-xs font-semibold"
                    style={{ backgroundColor: "#1A3072" }}
                  >
                    Commander cette ordonnance
                  </button>
                )}
                {(p.drugs?.length ?? 0) > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {p.drugs!.map((d) => (
                      <span key={d} className="text-[11px] px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 font-medium border border-gray-100">
                        {d}
                      </span>
                    ))}
                  </div>
                )}
                {p.expires !== "–" && (
                  <p className="text-[11px] text-gray-400 mt-2">Expire le {p.expires}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Détail ordonnance ── */}
      {selectedOrdonnanceId && (() => {
        const ordonnance = rawOrdonnances.find((o) => o.id === selectedOrdonnanceId);
        if (!ordonnance) return null;
        return (
          <OrdonnanceDetailModal
            ordonnance={ordonnance}
            patientName={patientName}
            onClose={() => setSelectedOrdonnanceId(null)}
            onOrderFromOrdonnance={onOrderFromOrdonnance}
          />
        );
      })()}

    </div>
  );
}

// ── Bottom navigation bar ─────────────────────────────────────────────────────

function BottomNav({
  tab,
  unreadCount,
  onTab,
}: {
  tab: PatientTab;
  unreadCount: number;
  onTab: (t: PatientTab) => void;
}) {
  const tabs: { key: PatientTab; icon: any; label: string }[] = [
    { key: "home", icon: Home, label: "Accueil" },
    { key: "search", icon: Search, label: "Recherche" },
    { key: "appointments", icon: Stethoscope, label: "RDV" },
    { key: "dashboard", icon: ClipboardList, label: "Tableau de bord" },
    { key: "profile", icon: User, label: "Profil" },
  ];

  return (
    <>
      {/* Mobile / tablet bottom nav */}
      <nav className="shrink-0 bg-white border-t border-gray-200 lg:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.map(({ key, icon: Icon, label }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => onTab(key)}
                className="flex flex-col items-center gap-1 flex-1 py-1 relative"
              >
                <div className="relative">
                  <Icon
                    className="w-6 h-6 transition-colors"
                    style={{ color: active ? "#1A3072" : "#9CA3AF" }}
                  />
                </div>
                <span
                  className="text-[10px] font-medium transition-colors"
                  style={{ color: active ? "#1A3072" : "#9CA3AF" }}
                >
                  {label}
                </span>
                {active && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                    style={{ backgroundColor: "#1A3072" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar nav — rendered outside the flex-col via a portal-like sibling, handled in PatientSpace */}
    </>
  );
}

function SidebarNav({
  tab,
  unreadCount,
  onTab,
  onLogout,
}: {
  tab: PatientTab;
  unreadCount: number;
  onTab: (t: PatientTab) => void;
  onLogout: () => void;
}) {
  const tabs: { key: PatientTab; icon: any; label: string }[] = [
    { key: "home", icon: Home, label: "Accueil" },
    { key: "search", icon: Search, label: "Recherche" },
    { key: "appointments", icon: Stethoscope, label: "RDV Médecin" },
    { key: "dashboard", icon: ClipboardList, label: "Tableau de bord" },
    { key: "profile", icon: User, label: "Mon profil" },
  ];

  return (
    <aside
      className="hidden lg:flex flex-col shrink-0 border-r border-gray-200 bg-white"
      style={{ width: 240 }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-xs"
            style={{ backgroundColor: "#1A3072" }}
          >
            DP
          </div>
          <div>
            <p className="font-bold text-base" style={{ color: "#1A3072" }}>Digie-Pharma</p>
            <p className="text-xs text-gray-400">Espace Patient</p>
          </div>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {tabs.map(({ key, icon: Icon, label }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              onClick={() => onTab(key)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left"
              style={{
                backgroundColor: active ? "#EEF1F8" : "transparent",
                color: active ? "#1A3072" : "#4B5563",
              }}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{label}</span>
              {key === "profile" && unreadCount > 0 && (
                <span
                  className="ml-auto w-5 h-5 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: "#EF4444", fontSize: "10px" }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout at bottom */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}


// ── Main PatientSpace ─────────────────────────────────────────────────────────

type Props = { onLogout: () => void; userId: string };

export function PatientSpace({ onLogout, userId }: Props) {
  const [tab, setTab] = useState<PatientTab>("home");
  const [notifOpen, setNotifOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [commandesOpen, setCommandesOpen] = useState(false);
  const [patientCommandes, setPatientCommandes] = useState<CommandePatientAPI[]>([]);
  const [step, setStep] = useState<PatientStep>("search");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<string[]>([]);
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [mode, setMode] = useState<"pickup" | "delivery" | null>(null);
  const [orderStep, setOrderStep] = useState<OrderStep | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [pharmaciesApi_, setPharmaciesApi] = useState<PharmacieAPI[]>([]);
  const [commande, setCommande] = useState<CommandeAPI | null>(null);
  const [demandeId, setDemandeId] = useState<string | null>(null);
  const [commandePharmacyMap, setCommandePharmacyMap] = useState<Record<string, string>>({});
  const [apiDemandes, setApiDemandes] = useState<DemandeAPI[]>([]);
  const [demandeReponses, setDemandeReponses] = useState<Record<string, DemandeReponseAPI[]>>({});
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [apiOrdonnances, setApiOrdonnances] = useState<OrdonnanceAPI[]>([]);
  const [patientName, setPatientName] = useState("");
  const [patientData, setPatientData] = useState<PatientAPI | null>(null);
  const [rappels, setRappels] = useState<RappelAPI[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState("");

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Dérive un titre lisible depuis typeEvenement
  const titreFromType = (type: string): string => {
    const map: Record<string, string> = {
      COMMANDE_PRETE: "Commande prête",
      REPONSE_PHARMACIE: "Réponse de pharmacie",
      LIVRAISON_TERMINEE: "Commande livrée",
      NOUVELLE_DEMANDE: "Nouvelle demande",
      COMMANDE_VALIDEE: "Commande validée",
    };
    return map[type] ?? "Notification";
  };

  const iconFromType = (type: string): Notif["icon"] => {
    if (type.includes("COMMANDE") || type.includes("LIVRAISON")) return "order";
    if (type.includes("PHARMACIE") || type.includes("DEMANDE")) return "pharmacy";
    return "system";
  };

  // ── Chargement des notifications réelles ─────────────────────────────────
  const loadNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const data: NotificationAPI[] = await notificationsApi.getAll(userId);
      setNotifications(
        data.map((n) => ({
          id: n.id,
          title: titreFromType(n.typeEvenement),
          body: n.message,
          time: new Date(n.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
          read: n.lue,
          icon: iconFromType(n.typeEvenement),
        }))
      );
    } catch {
      // En cas d'erreur on garde les notifications mock
    }
  }, [userId]);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  // ── Chargement + rafraîchissement des demandes et de leurs réponses ──────
  // Une réponse de pharmacie peut arriver pendant que le patient est déjà sur l'app :
  // sans ce sondage, "Mes demandes" restait figé sur l'état du chargement initial.
  const loadDemandes = useCallback(() => {
    if (!userId) return;
    demandesApi.getByPatient(userId).then((demandes) => {
      setApiDemandes(demandes);
      demandes.forEach((d) => {
        demandesApi.getReponses(d.id)
          .then((r) => setDemandeReponses((prev) => ({ ...prev, [d.id]: r })))
          .catch(() => {});
      });
    }).catch(() => {});
    commandesApi.getByPatient(userId).then(setPatientCommandes).catch(() => {});
  }, [userId]);

  useEffect(() => {
    loadDemandes();
    const interval = setInterval(loadDemandes, 15000);
    return () => clearInterval(interval);
  }, [loadDemandes]);

  // ── Chargement données patient connecté ──────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    patientsApi.getById(userId).then((p) => {
      setPatientData(p);
      setPatientName(`${p.prenom} ${p.nom}`);
    }).catch(() => {});
    rappelsApi.getJour(userId).then(setRappels).catch(() => {});
    ordonnancesApi.getByPatient(userId).then(setApiOrdonnances).catch(() => {});
  }, [userId]);

  // ── Chargement des pharmacies inscrites (géoloc → nearby, sinon toutes) ─
  useEffect(() => {
    const loadAll = () => pharmaciesApi.list().then(setPharmaciesApi).catch(() => {});

    if (!navigator.geolocation) { loadAll(); return; }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setUserLocation({ lat: coords.latitude, lng: coords.longitude });
        try {
          const data = await pharmaciesApi.nearby(coords.latitude, coords.longitude);
          setPharmaciesApi(data.length > 0 ? data : await pharmaciesApi.list());
        } catch { loadAll(); }
      },
      () => loadAll()
    );
  }, []);

  // Conversion PharmacieAPI → Pharmacy (type local du composant) — distance recalculée côté
  // client (voir toPharmacyCard) car le backend ne la renvoie pas dans le JSON, seulement
  // triée en SQL. Sans position connue, on retombe sur l'ordre déjà trié par le serveur.
  const apiPharmacies: Pharmacy[] = pharmaciesApi_
    .map((p) => toPharmacyCard(p, userLocation ?? undefined))
    .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));

  // Pharmacies ayant réellement répondu (avec prix) à la demande en cours — préférées à la
  // liste générique "à proximité" dès qu'elles existent, pour que la commande créée ensuite
  // soit bien rattachée à une réponse réelle (et donc à son prix).
  const respondedPharmacies: Pharmacy[] = demandeId
    ? (demandeReponses[demandeId] ?? [])
        .filter((r) => r.reponse === "DISPONIBLE" || r.reponse === "PARTIEL")
        .map((r) => {
          const full = pharmaciesApi_.find((p) => p.id === r.pharmacieId);
          return {
            id: r.pharmacieId ?? r.id,
            name: r.pharmacieNom ?? full?.nom ?? "Pharmacie",
            address: r.pharmacieAdresse ?? full?.adresse ?? "",
            distanceKm: full && userLocation ? haversineKm(userLocation, { lat: full.latitude, lng: full.longitude }) : undefined,
            open: true,
            delivery: full?.livraisonActive ?? false,
            pickup: true,
            available: r.reponse === "DISPONIBLE" ? ("in-stock" as const) : ("partial" as const),
            prix: r.prix,
          };
        })
        .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
    : [];

  // Conversion DemandeAPI → OrderDisplay
  const demandeStatutLabel: Record<string, string> = {
    EN_COURS: "En cours", ANALYSEE: "Analysée", ANNULEE: "Annulée",
  };
  const demandeStatutColor: Record<string, string> = {
    EN_COURS: "#1A3072", ANALYSEE: "#10B981", ANNULEE: "#EF4444",
  };
  const apiOrderDisplays: OrderDisplay[] = apiDemandes.map((d) => ({
    id: d.id,
    pharmacy: commandePharmacyMap[d.id] ?? "—",
    items: d.ordonnanceId ? ["Ordonnance"] : ["Médicament"],
    status: demandeStatutLabel[d.statut] ?? d.statut,
    statusColor: demandeStatutColor[d.statut] ?? "#6B7280",
    date: new Date(d.createdAt).toLocaleDateString("fr-FR"),
    total: "–",
  }));

  // Bouton "localisation" du header : commune connue la plus proche de la position réelle
  // du patient (fallback "Abidjan" tant que la géoloc n'est pas encore connue).
  const currentCityLabel = useMemo(() => nearestCommune(userLocation), [userLocation]);

  // "Récents" (SearchModule) : vrais termes recherchés par CE patient, déduits de ses demandes
  // (medicamentRecherche), les plus récentes en premier, sans doublon. Remplace l'ancienne
  // liste statique codée en dur.
  const recentSearches = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    const parDateDesc = [...apiDemandes].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    for (const d of parDateDesc) {
      const terme = d.medicamentRecherche?.trim();
      if (terme && !seen.has(terme)) {
        seen.add(terme);
        out.push(terme);
      }
      if (out.length >= 5) break;
    }
    return out;
  }, [apiDemandes]);

  // Conversion OrdonnanceAPI → PrescriptionDisplay (résumé pour la carte de liste ; le détail
  // complet — posologie, durée, instructions par médicament — vient de `apiOrdonnances` brut,
  // consulté au clic sur la carte).
  const apiPresDisplays: PrescriptionDisplay[] = apiOrdonnances.map((o) => ({
    id: o.id,
    doctor: o.medecinNom ? `Dr. ${o.medecinPrenom ?? ""} ${o.medecinNom}`.trim() : "Ordonnance envoyée",
    date: new Date(o.createdAt).toLocaleDateString("fr-FR"),
    expires: "–",
    active: o.statut !== "EN_ATTENTE_OCR",
    drugs: o.source === "MEDECIN"
      ? o.lignes.map((l) => l.medicament.nomCommercial)
      : o.medicamentsOcr.map((m) => m.medicament.nomCommercial),
  }));

  // Whether we're in the middle of the checkout flow (not home search, not tracking)
  const inCheckout =
    tab === "search" &&
    step !== "search" &&
    step !== "tracking";

  const handleToggleRappel = async (rappel: RappelAPI) => {
    try {
      const updated = rappel.pris
        ? await rappelsApi.annulerPris(rappel.id)
        : await rappelsApi.marquerPris(rappel.id);
      setRappels((prev) => prev.map((r) => r.id === updated.id ? updated : r));
    } catch { /* silently ignore */ }
  };

  const handleAddRappel = async (medicamentNom: string, dose: string, heure: string) => {
    if (!userId || !medicamentNom.trim() || !heure) return;
    try {
      const r = await rappelsApi.creer({ patientId: userId, medicamentNom: medicamentNom.trim(), dose: dose.trim() || undefined, heure, recurrent: true });
      setRappels((prev) => [...prev, r].sort((a, b) => a.heure.localeCompare(b.heure)));
    } catch { /* silently ignore */ }
  };

  const handleDeleteRappel = async (id: string) => {
    try {
      await rappelsApi.supprimer(id);
      setRappels((prev) => prev.filter((r) => r.id !== id));
    } catch { /* silently ignore */ }
  };

  const handleUpdateMesures = async (mesures: Parameters<typeof patientsApi.updateMesures>[1]) => {
    if (!userId) return;
    try {
      const updated = await patientsApi.updateMesures(userId, mesures);
      setPatientData(updated);
    } catch { /* silently ignore */ }
  };

  const handleSearch = async (q: string, zone?: SearchZone) => {
    setQuery(q);
    setItems(q ? [q] : []);
    setDemandeId(null);
    if (userId && q) {
      // Zone explicite (commune choisie ou position actuelle activée dans le module de recherche),
      // sinon la position déjà connue du patient en fallback.
      const communeCoords = zone?.commune ? VILLES_CI[zone.commune] : null;
      const coords = communeCoords ?? (zone?.useCurrentLocation ? userLocation : null) ?? userLocation;
      try {
        const d = await demandesApi.create({
          patientId: userId,
          type: "MEDICAMENT",
          medicamentRecherche: q,
          latitude: coords?.lat,
          longitude: coords?.lng,
          rayonKm: zone?.rayonKm,
        });
        setDemandeId(d.id);
        // Rafraîchir la liste des demandes et charger les réponses
        demandesApi.getByPatient(userId).then((demandes) => {
          setApiDemandes(demandes);
          demandes.forEach((dem) => {
            demandesApi.getReponses(dem.id)
              .then((r) => setDemandeReponses((prev) => ({ ...prev, [dem.id]: r })))
              .catch(() => {});
          });
        }).catch(() => {});
      } catch {}
    }
    setStep("pharmacies");
  };

  const handlePrescriptionConfirm = async (detected: string[], ordonnanceId?: string) => {
    setItems(detected);
    setQuery(detected[0] ?? "ordonnance");
    setPrescriptionOpen(false);
    // Créer la demande avec l'ordonnance
    if (userId) {
      try {
        const d = await demandesApi.create({
          patientId: userId,
          type: "ORDONNANCE",
          ordonnanceId,
        });
        setDemandeId(d.id);
      } catch { /* on continue sans demandeId */ }
    }
    setStep("pharmacies");
  };

  // q : nom du médicament tapé avant la sélection directe d'une pharmacie proche (facultatif —
  // le patient peut choisir une pharmacie sans avoir rien recherché, cf. flux position/commune).
  const handleSelectPharmacy = (p: Pharmacy, q?: string) => {
    if (q) {
      setQuery(q);
      setItems([q]);
    }
    setSelectedPharmacy(p);
    setStep("mode");
  };

  const handleSelectMode = (m: "pickup" | "delivery") => {
    setMode(m);
    setStep("validation");
  };

  const handleValidation = (address: string) => {
    setDeliveryAddress(address);
    setStep("payment");
  };

  const handlePay = async (method: PayMethod) => {
    setOrderStep("confirmed");
    setStep("tracking");

    let commandeId: string | null = null;
    let isDelivery = mode === "delivery";

    if (userId && selectedPharmacy) {
      try {
        let dId = demandeId;
        if (!dId) {
          const d = await demandesApi.create({ patientId: userId, type: "MEDICAMENT" });
          dId = d.id;
          setDemandeId(dId);
        }
        const c = await commandesApi.create({
          demandeId: dId,
          pharmacieId: selectedPharmacy.id,
          modeObtention: isDelivery ? "LIVRAISON" : "RETRAIT",
          modePaiement: method === "cash" ? "A_LA_LIVRAISON" : method,
          medicamentIds: [],
        });
        setCommande(c);
        commandeId = c.id;
        setCommandePharmacyMap((prev) => ({ ...prev, [dId!]: selectedPharmacy.name }));
        demandesApi.getByPatient(userId).then(setApiDemandes).catch(() => {});
        commandesApi.getByPatient(userId).then(setPatientCommandes).catch(() => {});
      } catch { /* commande échouée, on reste en "confirmed" */ }
    }

    setOrderStep("preparing");

    // Polling réel si livraison, sinon simple progression commande
    if (commandeId && isDelivery) {
      const mapStatut = (statut: string): OrderStep => {
        if (statut === "EN_ATTENTE_LIVREUR") return "preparing";
        if (statut === "ASSIGNEE")           return "ready";
        if (statut === "EN_COURS")           return "delivering";
        if (statut === "LIVREE")             return "done";
        return "preparing";
      };
      const cId = commandeId;
      const poll = () => {
        livraisonsApi.getByCommande(cId)
          .then((l) => {
            setOrderStep(mapStatut(l.statut));
            if (l.statut === "LIVREE" || l.statut === "ECHEC") {
              if (pollingRef.current) clearInterval(pollingRef.current);
            }
          })
          .catch(() => {});
      };
      poll();
      pollingRef.current = setInterval(poll, 12000);
    } else if (!isDelivery && commandeId) {
      // Retrait : poll le statut commande
      const cId = commandeId;
      const mapCommandeStatut = (statut: string): OrderStep => {
        if (statut === "EN_PREPARATION") return "preparing";
        if (statut === "PRETE")          return "ready";
        if (statut === "TERMINEE")       return "done";
        return "preparing";
      };
      const poll = () => {
        commandesApi.getById(cId)
          .then((c) => {
            setOrderStep(mapCommandeStatut(c.statut));
            if (c.statut === "TERMINEE" || c.statut === "ANNULEE") {
              if (pollingRef.current) clearInterval(pollingRef.current);
            }
          })
          .catch(() => {});
      };
      poll();
      pollingRef.current = setInterval(poll, 12000);
    }
  };

  const handleNewOrder = () => {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
    setStep("search");
    setQuery("");
    setItems([]);
    setSelectedPharmacy(null);
    setMode(null);
    setOrderStep(null);
    setCommande(null);
    setTab("search");
  };

  // Switch tab: reset search flow if leaving mid-checkout
  const handleTab = (t: PatientTab) => {
    setTab(t);
  };

  return (
    <div className="flex-1 flex overflow-hidden" style={{ backgroundColor: "#F3F4F6" }}>
      {/* Desktop sidebar */}
      <SidebarNav tab={tab} unreadCount={unreadCount} onTab={handleTab} onLogout={onLogout} />

      {/* Main content column */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      {/* ── Sticky header ── */}
      <header className="shrink-0 bg-white border-b border-gray-200 lg:hidden">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={handleNewOrder}
            className="flex items-center gap-2"
          >
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-bold text-xs"
              style={{ backgroundColor: "#1A3072" }}
            >
              DP
            </div>
            <span className="font-bold text-base" style={{ color: "#1A3072" }}>
              Digie-Pharma
            </span>
          </button>

          {/* Location */}
          <button className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
            <Navigation2 className="w-4 h-4 text-green-500" />
            {currentCityLabel}
          </button>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Bell */}
            <button
              onClick={() => setNotifOpen(true)}
              className="relative p-2 rounded-full hover:bg-gray-100"
            >
              <Bell
                className="w-5 h-5"
                style={{ color: notifOpen ? "#1A3072" : "#6B7280" }}
              />
              {unreadCount > 0 && (
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                  style={{ backgroundColor: "#EF4444" }}
                />
              )}
            </button>
            {/* Profile */}
            <button
              onClick={() => handleTab("profile")}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <User
                className="w-5 h-5"
                style={{ color: tab === "profile" ? "#1A3072" : "#6B7280" }}
              />
            </button>
          </div>
        </div>

        {/* Step progress bar — only during checkout */}
        {inCheckout && <StepBar current={step} />}
      </header>

      {/* Desktop topbar (sidebar layout) */}
      <header className="hidden lg:flex shrink-0 bg-white border-b border-gray-200 items-center justify-between px-6 py-3">
        <div>
          <h1 className="font-bold text-gray-900 text-lg">
            {tab === "home" && "Accueil"}
            {tab === "search" && "Recherche de médicaments"}
            {tab === "dashboard" && "Suivi patient"}
            {tab === "profile" && "Mon profil"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
            <Navigation2 className="w-4 h-4 text-green-500" />
            {currentCityLabel}
          </button>
          <button
            onClick={() => setNotifOpen(true)}
            className="relative p-2 rounded-full hover:bg-gray-100 ml-1"
          >
            <Bell className="w-5 h-5" style={{ color: notifOpen ? "#1A3072" : "#6B7280" }} />
            {unreadCount > 0 && (
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ backgroundColor: "#EF4444" }}
              />
            )}
          </button>
        </div>
        {inCheckout && <StepBar current={step} />}
      </header>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto" style={{ backgroundColor: "#F3F4F6" }}>

      {/* ── Tab: Accueil ── */}
      {tab === "home" && (
        <HomeTab
          onGoSearch={() => setTab("search")}
          onPrescription={() => setPrescriptionOpen(true)}
          onGoCommandes={() => setCommandesOpen(true)}
        />
      )}

      {/* ── Tab: Recherche ── */}
      {tab === "search" && (
        <>
          {step === "search" && (
            <SearchModule
              onSearch={handleSearch}
              onPrescription={() => setPrescriptionOpen(true)}
              nearbyPharmacies={apiPharmacies}
              onSelectPharmacy={handleSelectPharmacy}
              onShowMap={() => setMapOpen(true)}
              onGoHome={() => setTab("home")}
              recentSearches={recentSearches}
            />
          )}
          {step === "pharmacies" && (
            <PharmaciesModule
              query={query}
              items={items}
              pharmacies={respondedPharmacies.length > 0 ? respondedPharmacies : apiPharmacies}
              onSelect={handleSelectPharmacy}
              onBack={() => setStep("search")}
              onShowMap={() => setMapOpen(true)}
              cityLabel={currentCityLabel}
            />
          )}
          {step === "mode" && selectedPharmacy && (
            <ModeModule
              pharmacy={selectedPharmacy}
              onSelect={handleSelectMode}
              onBack={() => setStep("pharmacies")}
            />
          )}
          {step === "validation" && selectedPharmacy && mode && (
            <ValidationModule
              pharmacy={selectedPharmacy}
              mode={mode}
              items={items}
              onConfirm={handleValidation}
              onBack={() => setStep("mode")}
            />
          )}
          {step === "payment" && mode && (
            <PaymentModule
              items={items}
              mode={mode}
              onPay={handlePay}
              onBack={() => setStep("validation")}
            />
          )}
          {step === "tracking" && orderStep && (
            <TrackingModule
              orderStep={orderStep}
              orderMode={mode ?? "pickup"}
              items={items}
              pharmacy={selectedPharmacy}
              onNewOrder={handleNewOrder}
            />
          )}
        </>
      )}

      {/* ── Tab: Tableau de bord ── */}
      {tab === "dashboard" && (
        <div>
          <SuiviTab
            prescriptions={apiPresDisplays}
            rawOrdonnances={apiOrdonnances}
            patientName={patientName}
            patientData={patientData}
            rappels={rappels}
            onToggleRappel={handleToggleRappel}
            onAddRappel={handleAddRappel}
            onDeleteRappel={handleDeleteRappel}
            onUpdateMesures={handleUpdateMesures}
            onOrderFromOrdonnance={async (drugs, ordonnanceId) => {
              setItems(drugs);
              setQuery(drugs[0] ?? "ordonnance");
              setDemandeId(null);
              if (userId) {
                try {
                  const d = await demandesApi.create({ patientId: userId, type: "ORDONNANCE", ordonnanceId });
                  setDemandeId(d.id);
                } catch {}
              }
              setTab("search");
              setStep("pharmacies");
            }}
          />
        </div>
      )}

      {/* ── Tab: Rendez-vous ── */}
      {tab === "appointments" && <PatientDoctorAppointments patientId={userId} />}

      {/* ── Tab: Profil ── */}
      {tab === "profile" && <ProfilePage onLogout={onLogout} userId={userId} orders={apiOrderDisplays} />}

      {/* ── Notifications overlay ── */}
      {notifOpen && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div className="flex-1 bg-black/40" onClick={() => setNotifOpen(false)} />
          <div className="bg-white rounded-t-3xl overflow-hidden" style={{ maxHeight: "80vh" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <button
                onClick={() => setNotifOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="overflow-y-auto">
              <NotificationsPage
                notifications={notifications}
                onMarkAllRead={() =>
                  setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
                }
              />
            </div>
          </div>
        </div>
      )}

      </div>{/* end scrollable content */}

      {/* Prescription modal */}
      <PrescriptionModal
        open={prescriptionOpen}
        onClose={() => setPrescriptionOpen(false)}
        onConfirm={handlePrescriptionConfirm}
      />

      {/* Carte des pharmacies */}
      {mapOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Pharmacies à proximité</h3>
            <button onClick={() => setMapOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1">
            <PharmacyMap
              pharmacies={apiPharmacies}
              onPharmacySelect={(p) => { setMapOpen(false); handleSelectPharmacy(p); }}
            />
          </div>
        </div>
      )}

      {/* Mes commandes */}
      {commandesOpen && (
        <MesCommandes
          demandes={apiDemandes}
          commandes={patientCommandes}
          patientLocation={userLocation}
          patientId={userId}
          onClose={() => setCommandesOpen(false)}
        />
      )}

      {/* Bottom navigation */}
      <BottomNav tab={tab} unreadCount={unreadCount} onTab={handleTab} />
      </div>{/* end main content column */}
    </div>
  );
}
