import { useState, useEffect, useCallback } from "react";
import {
  Package, Clock, CheckCircle, Navigation, LogOut,
  Home, User, Truck, ChevronRight, Settings, HelpCircle,
  Shield, Star, RefreshCw, Bell, Volume2, VolumeX,
} from "lucide-react";
import { livraisonsApi, livreursApi, session } from "../lib/api";
import type { LivraisonAPI, LivreurAPI } from "../lib/types";
import { useLiveAlerts, requestNotificationPermission } from "../lib/useLiveAlerts";
import { NotificationToast } from "./NotificationToast";
import { DeliveryRouteMap } from "./DeliveryRouteMap";

type DeliveryTab = "home" | "livraisons" | "notifications" | "profile";
type LivraisonsSubTab = "disponibles" | "mesCourses";

type Props = { onLogout?: () => void };

const STATUT_LABEL: Record<LivraisonAPI["statut"], string> = {
  EN_ATTENTE_LIVREUR: "En attente",
  ASSIGNEE:           "Assignée",
  EN_COURS:           "En cours",
  LIVREE:             "Livrée",
  ECHEC:              "Échec",
};

const STATUT_COLOR: Record<LivraisonAPI["statut"], string> = {
  EN_ATTENTE_LIVREUR: "#F47920",
  ASSIGNEE:           "#1A3072",
  EN_COURS:           "#F47920",
  LIVREE:             "#10B981",
  ECHEC:              "#EF4444",
};

// ── Navigation ─────────────────────────────────────────────────────────────────

function DeliveryNav({
  tab, disponiblesCount, unreadNotifCount, onTab,
}: { tab: DeliveryTab; disponiblesCount: number; unreadNotifCount: number; onTab: (t: DeliveryTab) => void }) {
  const tabs = [
    { key: "home" as const, icon: Home, label: "Accueil" },
    { key: "livraisons" as const, icon: Truck, label: "Livraisons", badge: disponiblesCount },
    { key: "notifications" as const, icon: Bell, label: "Notifications", badge: unreadNotifCount },
    { key: "profile" as const, icon: User, label: "Profil" },
  ];
  return (
    <nav className="shrink-0 bg-white border-t border-gray-200 lg:hidden">
      <div className="flex items-center justify-around px-1 py-2">
        {tabs.map(({ key, icon: Icon, label, badge }) => {
          const active = tab === key;
          return (
            <button key={key} onClick={() => onTab(key)} className="flex flex-col items-center gap-1 flex-1 py-1 relative">
              <div className="relative">
                <Icon className="w-5 h-5 transition-colors" style={{ color: active ? "#1A3072" : "#9CA3AF" }} />
                {badge != null && badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white font-bold bg-red-500" style={{ fontSize: "9px" }}>
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium transition-colors" style={{ color: active ? "#1A3072" : "#9CA3AF" }}>{label}</span>
              {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full" style={{ backgroundColor: "#1A3072" }} />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function DeliverySidebarNav({
  tab, disponiblesCount, unreadNotifCount, onTab, onLogout,
}: { tab: DeliveryTab; disponiblesCount: number; unreadNotifCount: number; onTab: (t: DeliveryTab) => void; onLogout?: () => void }) {
  const tabs = [
    { key: "home" as const, icon: Home, label: "Accueil" },
    { key: "livraisons" as const, icon: Truck, label: "Livraisons", badge: disponiblesCount },
    { key: "notifications" as const, icon: Bell, label: "Notifications", badge: unreadNotifCount },
    { key: "profile" as const, icon: User, label: "Profil" },
  ];
  return (
    <aside className="hidden lg:flex flex-col shrink-0 border-r border-gray-200 bg-white" style={{ width: 240 }}>
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: "#1A3072" }}>
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-base" style={{ color: "#1A3072" }}>Livreur</p>
            <p className="text-xs text-gray-400">Espace Livraison</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {tabs.map(({ key, icon: Icon, label, badge }) => {
          const active = tab === key;
          return (
            <button key={key} onClick={() => onTab(key)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left"
              style={{ backgroundColor: active ? "#EEF1F8" : "transparent", color: active ? "#1A3072" : "#4B5563" }}>
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium flex-1">{label}</span>
              {badge != null && badge > 0 && (
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold shrink-0 bg-red-500" style={{ fontSize: "10px" }}>
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-gray-100">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-red-500 hover:bg-red-50 transition-colors">
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}

// ── Home tab ────────────────────────────────────────────────────────────────────

function DeliveryHomeTab({
  mesCourses, disponibles, onGoDisponibles, onGoMesCourses,
}: { mesCourses: LivraisonAPI[]; disponibles: LivraisonAPI[]; onGoDisponibles: () => void; onGoMesCourses: () => void }) {
  // onGoDisponibles / onGoMesCourses pointent toutes deux vers l'onglet "Livraisons",
  // avec le sous-onglet correspondant déjà sélectionné par le parent.
  const active = mesCourses.filter((l) => l.statut === "ASSIGNEE" || l.statut === "EN_COURS");
  const done   = mesCourses.filter((l) => l.statut === "LIVREE").length;

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Hero */}
      <div className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #122660 0%, #1A3072 100%)" }}>
        <div className="relative z-10">
          <p className="text-sm text-white/80">Bonjour 👋</p>
          <h2 className="text-xl font-bold mt-0.5">Espace Livreur</h2>
          <p className="text-xs text-white/70 mt-1">Digie-Pharma Livraison · Disponible</p>
        </div>
        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute -right-2 top-10 w-14 h-14 rounded-full bg-white/10" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <button onClick={onGoDisponibles} className="bg-white rounded-2xl p-4 border border-gray-100 text-left hover:shadow-sm transition">
          <p className="text-2xl font-bold" style={{ color: disponibles.length > 0 ? "#F47920" : "#9CA3AF" }}>{disponibles.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Disponibles</p>
        </button>
        <button onClick={onGoMesCourses} className="bg-white rounded-2xl p-4 border border-gray-100 text-left hover:shadow-sm transition">
          <p className="text-2xl font-bold" style={{ color: active.length > 0 ? "#1A3072" : "#9CA3AF" }}>{active.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">En cours</p>
        </button>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-2xl font-bold" style={{ color: "#10B981" }}>{done}</p>
          <p className="text-xs text-gray-500 mt-0.5">Livrées</p>
        </div>
      </div>

      {/* Livraisons disponibles à prendre */}
      {disponibles.length > 0 && (
        <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{ backgroundColor: "#FFF3E6", borderColor: "#FED7AA" }}>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" style={{ color: "#F47920" }} />
              <p className="text-xs font-semibold" style={{ color: "#D4680F" }}>Livraisons disponibles</p>
            </div>
            <button onClick={onGoDisponibles} className="text-xs font-medium" style={{ color: "#F47920" }}>Voir tout →</button>
          </div>
          <div className="divide-y divide-gray-50">
            {disponibles.slice(0, 2).map((l) => (
              <div key={l.id} className="px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#FFF3E6" }}>
                  <Package className="w-4 h-4" style={{ color: "#F47920" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Commande #{l.commandeId?.slice(-6) ?? l.id.slice(-6)}</p>
                  <p className="text-xs text-gray-500 truncate">{l.adresseLivraison ?? "Adresse non disponible"}</p>
                </div>
                <button onClick={onGoDisponibles} className="text-xs px-2.5 py-1 rounded-full text-white font-medium shrink-0" style={{ backgroundColor: "#F47920" }}>
                  Prendre
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Courses actives */}
      {active.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Mes courses actives</p>
            <button onClick={onGoMesCourses} className="text-xs font-medium" style={{ color: "#1A3072" }}>Voir tout →</button>
          </div>
          <div className="divide-y divide-gray-50">
            {active.slice(0, 2).map((l) => (
              <div key={l.id} className="px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: STATUT_COLOR[l.statut] + "20" }}>
                  <Navigation className="w-4 h-4" style={{ color: STATUT_COLOR[l.statut] }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Commande #{l.commandeId?.slice(-6) ?? l.id.slice(-6)}</p>
                  <p className="text-xs text-gray-500 truncate">{l.adresseLivraison ?? "Adresse non disponible"}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white shrink-0" style={{ backgroundColor: STATUT_COLOR[l.statut] }}>
                  {STATUT_LABEL[l.statut]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Données mock complémentaires pour les fiches livraison ─────────────────────

const PHARMACIES_MOCK = [
  { nom: "Pharmacie Moha", adresse: "Angré Petro Ivoire, Abidjan" },
  { nom: "Pharmacie du Plateau", adresse: "Avenue Noguès, Plateau" },
  { nom: "Pharmacie Sainte Marie", adresse: "Cocody Angré 8ème Tranche" },
];
const PATIENTS_MOCK = [
  { nom: "Mohamed Diallo", telephone: "07 XX XX XX XX" },
  { nom: "Koffi Assi", telephone: "05 XX XX XX XX" },
  { nom: "Aminata Traoré", telephone: "01 XX XX XX XX" },
];
function getMockExtra(id: string) {
  const idx = id.charCodeAt(id.length - 1) % 3;
  const distKm = ((id.charCodeAt(0) % 30 + 10) / 10).toFixed(1);
  const gainFCFA = Math.round((parseFloat(distKm) * 400 + 700) / 100) * 100;
  const tempsMins = Math.round(parseFloat(distKm) * 4 + 8);
  return {
    pharmacie: PHARMACIES_MOCK[idx],
    patient: PATIENTS_MOCK[idx],
    distKm,
    gainFCFA,
    tempsMins,
  };
}

// ── Disponibles tab ─────────────────────────────────────────────────────────────

function DisponiblesTab({
  disponibles, loading, onRefresh, onSeProposer,
}: {
  disponibles: LivraisonAPI[];
  loading: boolean;
  onRefresh: () => void;
  onSeProposer: (id: string) => Promise<void>;
}) {
  const [proposing, setProposing] = useState<string | null>(null);

  const handleProposer = async (id: string) => {
    setProposing(id);
    await onSeProposer(id);
    setProposing(null);
  };

  return (
    <div className="px-4 py-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-sm font-semibold text-gray-700">{disponibles.length} livraison(s) disponible(s)</p>
          <p className="text-xs text-gray-400 mt-0.5">Proposez-vous pour prendre une course</p>
        </div>
        <button onClick={onRefresh} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {disponibles.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
          <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">Aucune livraison disponible</p>
          <p className="text-xs text-gray-400 mt-1">Revenez plus tard ou actualisez</p>
        </div>
      ) : (
        disponibles.map((l) => {
          const extra = getMockExtra(l.id);
          const ref = `#${l.commandeId?.slice(-8).toUpperCase() ?? l.id.slice(-8).toUpperCase()}`;
          return (
            <div key={l.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* En-tête */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                <div>
                  <p className="text-sm font-bold text-gray-900">Commande {ref}</p>
                  <p className="text-xs text-gray-400">Livraison #{l.id.slice(-8)}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs text-white font-semibold" style={{ backgroundColor: "#10B981" }}>
                  Disponible
                </span>
              </div>

              <div className="px-4 py-3 space-y-2.5">
                {/* Pharmacie de récupération */}
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Pharmacie de récupération</p>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#EEF1F8" }}>
                      <Package className="w-3.5 h-3.5" style={{ color: "#1A3072" }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{extra.pharmacie.nom}</p>
                      <p className="text-xs text-gray-500">{extra.pharmacie.adresse}</p>
                    </div>
                  </div>
                </div>

                {/* Adresse de livraison */}
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Adresse de livraison</p>
                  <DeliveryRouteMap adresseLivraison={l.adresseLivraison} pharmacieLabel={extra.pharmacie.nom} />
                </div>

                {/* Patient */}
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Patient</p>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0" style={{ backgroundColor: "#1A3072" }}>
                      {extra.patient.nom.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{extra.patient.nom}</p>
                      <p className="text-xs text-gray-500">{extra.patient.telephone}</p>
                    </div>
                  </div>
                </div>

                {/* Stats : distance / temps / gain */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="text-center p-2.5 rounded-xl bg-gray-50">
                    <p className="text-base font-bold text-gray-900">{extra.distKm} km</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Distance</p>
                  </div>
                  <div className="text-center p-2.5 rounded-xl bg-gray-50">
                    <p className="text-base font-bold text-gray-900">{extra.tempsMins} min</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Temps estimé</p>
                  </div>
                  <div className="text-center p-2.5 rounded-xl" style={{ backgroundColor: "#EEF1F8" }}>
                    <p className="text-base font-bold" style={{ color: "#1A3072" }}>{extra.gainFCFA.toLocaleString("fr-FR")} F</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "#1A3072" }}>Gain estimé</p>
                  </div>
                </div>

                {/* Bouton se proposer */}
                <button
                  onClick={() => handleProposer(l.id)}
                  disabled={proposing === l.id}
                  className="w-full py-3 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition mt-1"
                  style={{ backgroundColor: "#1A3072" }}
                >
                  <Truck className="w-4 h-4" />
                  {proposing === l.id ? "Envoi en cours…" : "Me proposer pour cette livraison"}
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ── Mes courses tab ─────────────────────────────────────────────────────────────

function MesCoursesTab({
  livraisons, loading, onRefresh, onPrendreEnCharge, onConfirmer,
}: {
  livraisons: LivraisonAPI[];
  loading: boolean;
  onRefresh: () => void;
  onPrendreEnCharge: (id: string) => Promise<void>;
  onConfirmer: (id: string) => Promise<void>;
}) {
  const active  = livraisons.filter((l) => l.statut === "ASSIGNEE" || l.statut === "EN_COURS");
  const history = livraisons.filter((l) => l.statut === "LIVREE" || l.statut === "ECHEC");

  return (
    <div className="px-4 py-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold text-gray-700">{active.length} course(s) active(s)</p>
        <button onClick={onRefresh} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {active.length === 0 && (
        <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
          <Truck className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">Aucune course en cours</p>
          <p className="text-xs text-gray-400 mt-1">Allez dans "Disponibles" pour prendre une commande</p>
        </div>
      )}

      {active.map((l) => {
        const extra = getMockExtra(l.id);
        return (
        <div key={l.id} className="bg-white rounded-2xl p-4 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500">Livraison #{l.id.slice(-8)}</p>
              {l.commandeId && <p className="text-xs text-gray-400">Commande #{l.commandeId.slice(-8)}</p>}
            </div>
            <span className="px-3 py-1 rounded-full text-xs text-white font-medium" style={{ backgroundColor: STATUT_COLOR[l.statut] }}>
              {STATUT_LABEL[l.statut]}
            </span>
          </div>

          {/* Progression visuelle */}
          <div className="flex items-center gap-1 mb-3">
            {(["ASSIGNEE", "EN_COURS", "LIVREE"] as const).map((s, i) => {
              const steps: LivraisonAPI["statut"][] = ["ASSIGNEE", "EN_COURS", "LIVREE"];
              const currentIdx = steps.indexOf(l.statut as typeof steps[number]);
              const done = i <= currentIdx;
              return (
                <div key={s} className="flex items-center gap-1 flex-1">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
                    style={{ backgroundColor: done ? "#1A3072" : "#E5E7EB" }}>
                    {done ? "✓" : i + 1}
                  </div>
                  {i < 2 && <div className="flex-1 h-0.5 rounded" style={{ backgroundColor: i < currentIdx ? "#1A3072" : "#E5E7EB" }} />}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mb-3">
            <span>Assignée</span>
            <span>En cours</span>
            <span>Livrée</span>
          </div>

          <div className="mb-3">
            <DeliveryRouteMap adresseLivraison={l.adresseLivraison} pharmacieLabel={extra.pharmacie.nom} />
          </div>

          {l.assigneeAt && (
            <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5" />
              Assignée le {new Date(l.assigneeAt).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
            </div>
          )}

          {l.statut === "ASSIGNEE" && (
            <button onClick={() => onPrendreEnCharge(l.id)}
              className="w-full py-2.5 rounded-xl text-white text-sm font-medium"
              style={{ backgroundColor: "#1A3072" }}>
              Récupérer à la pharmacie
            </button>
          )}
          {l.statut === "EN_COURS" && (
            <button onClick={() => onConfirmer(l.id)}
              className="w-full py-2.5 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2"
              style={{ backgroundColor: "#10B981" }}>
              <CheckCircle className="w-4 h-4" />
              Confirmer la livraison
            </button>
          )}
        </div>
        );
      })}

      {history.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">Historique</p>
          <div className="space-y-2">
            {history.slice(0, 5).map((l) => (
              <div key={l.id} className="bg-white rounded-xl px-4 py-3 border border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: STATUT_COLOR[l.statut] + "20" }}>
                  {l.statut === "LIVREE"
                    ? <CheckCircle className="w-4 h-4" style={{ color: "#10B981" }} />
                    : <Package className="w-4 h-4" style={{ color: "#EF4444" }} />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">Commande #{l.commandeId?.slice(-6) ?? l.id.slice(-6)}</p>
                  {l.livreeAt && <p className="text-xs text-gray-400">{new Date(l.livreeAt).toLocaleDateString("fr-FR")}</p>}
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white shrink-0" style={{ backgroundColor: STATUT_COLOR[l.statut] }}>
                  {STATUT_LABEL[l.statut]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Livraisons tab (Disponibles + Mes courses regroupées) ───────────────────────

function LivraisonsTab({
  subTab, onSubTab, disponibles, mesCourses, loading, onRefresh, onSeProposer, onPrendreEnCharge, onConfirmer,
}: {
  subTab: LivraisonsSubTab;
  onSubTab: (t: LivraisonsSubTab) => void;
  disponibles: LivraisonAPI[];
  mesCourses: LivraisonAPI[];
  loading: boolean;
  onRefresh: () => void;
  onSeProposer: (id: string) => Promise<void>;
  onPrendreEnCharge: (id: string) => Promise<void>;
  onConfirmer: (id: string) => Promise<void>;
}) {
  const activeCount = mesCourses.filter((l) => l.statut === "ASSIGNEE" || l.statut === "EN_COURS").length;
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl">
          {([
            { key: "disponibles" as const, label: "Disponibles", badge: disponibles.length },
            { key: "mesCourses" as const, label: "Mes courses", badge: activeCount },
          ]).map(({ key, label, badge }) => (
            <button
              key={key}
              onClick={() => onSubTab(key)}
              className="flex-1 relative py-2 px-1 rounded-xl text-xs font-semibold transition-all"
              style={{
                backgroundColor: subTab === key ? "white" : "transparent",
                color: subTab === key ? "#1A3072" : "#6B7280",
                boxShadow: subTab === key ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
              }}
            >
              {label}
              {badge > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-white font-bold" style={{ fontSize: "9px", backgroundColor: "#F47920" }}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      {subTab === "disponibles" ? (
        <DisponiblesTab disponibles={disponibles} loading={loading} onRefresh={onRefresh} onSeProposer={onSeProposer} />
      ) : (
        <MesCoursesTab livraisons={mesCourses} loading={loading} onRefresh={onRefresh} onPrendreEnCharge={onPrendreEnCharge} onConfirmer={onConfirmer} />
      )}
    </div>
  );
}

// ── Notifications tab (journal d'activité livraisons) ────────────────────────────

type ActivityType = "disponible" | "acceptee" | "terminee";
type ActivityItem = { id: string; type: ActivityType; time: string; ref: string };

const ACTIVITY_CONFIG: Record<ActivityType, { label: string; icon: typeof Bell; color: string; bg: string }> = {
  disponible: { label: "Nouvelle livraison disponible", icon: Bell,        color: "#F47920", bg: "#FFF3E6" },
  acceptee:   { label: "Livraison acceptée",             icon: Truck,       color: "#1A3072", bg: "#EEF1F8" },
  terminee:   { label: "Livraison terminée",             icon: CheckCircle, color: "#10B981", bg: "#ECFDF5" },
};

function buildActivityFeed(disponibles: LivraisonAPI[], mesCourses: LivraisonAPI[]): ActivityItem[] {
  const items: ActivityItem[] = [];
  disponibles.forEach((l) => {
    if (l.createdAt) items.push({ id: `dispo-${l.id}`, type: "disponible", time: l.createdAt, ref: l.commandeId ?? l.id });
  });
  mesCourses.forEach((l) => {
    if (l.assigneeAt) items.push({ id: `accept-${l.id}`, type: "acceptee", time: l.assigneeAt, ref: l.commandeId ?? l.id });
    if (l.livreeAt) items.push({ id: `done-${l.id}`, type: "terminee", time: l.livreeAt, ref: l.commandeId ?? l.id });
  });
  return items.sort((a, b) => b.time.localeCompare(a.time));
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  return new Date(iso).toLocaleDateString("fr-FR");
}

function NotificationsTab({
  disponibles, mesCourses, onGoLivraisons,
}: { disponibles: LivraisonAPI[]; mesCourses: LivraisonAPI[]; onGoLivraisons: (sub: LivraisonsSubTab) => void }) {
  const feed = buildActivityFeed(disponibles, mesCourses).slice(0, 30);

  if (feed.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Aucune notification pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-2">
      {feed.map((item) => {
        const cfg = ACTIVITY_CONFIG[item.type];
        const Icon = cfg.icon;
        return (
          <button
            key={item.id}
            onClick={() => onGoLivraisons(item.type === "disponible" ? "disponibles" : "mesCourses")}
            className="w-full text-left bg-white rounded-2xl border border-gray-100 p-3.5 flex items-start gap-3 hover:border-gray-200 transition"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: cfg.bg }}>
              <Icon className="w-4 h-4" style={{ color: cfg.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{cfg.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">Commande #{item.ref.slice(-8).toUpperCase()}</p>
              <p className="text-[11px] text-gray-400 mt-1">{formatRelative(item.time)}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Profile tab ─────────────────────────────────────────────────────────────────

function DeliveryProfileTab({
  onLogout, livreur, toggling, onToggle, soundEnabled, onToggleSound,
}: { onLogout?: () => void; livreur: LivreurAPI | null; toggling: boolean; onToggle: () => void; soundEnabled: boolean; onToggleSound: (v: boolean) => void }) {
  return (
    <div className="px-4 py-4 space-y-4 pb-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0" style={{ backgroundColor: "#1A3072" }}>
            {livreur ? livreur.prenom.charAt(0).toUpperCase() : "L"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900">
              {livreur ? `${livreur.prenom} ${livreur.nom}` : "Livreur Digie-Pharma"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{livreur?.telephone ?? ""}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 text-yellow-400" fill="#FBBF24" />
              <span className="text-xs text-gray-600">Espace livreur</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle disponibilité */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-900">Ma disponibilité</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {livreur?.disponibiliteStatut === "EN_COURSE"
                ? "Impossible de changer pendant une course"
                : "Activez pour recevoir des livraisons"}
            </p>
          </div>
          <button
            onClick={onToggle}
            disabled={toggling || livreur?.disponibiliteStatut === "EN_COURSE"}
            className="relative w-12 h-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: livreur?.disponibiliteStatut === "DISPONIBLE" ? "#10B981"
                : livreur?.disponibiliteStatut === "EN_COURSE" ? "#F47920" : "#D1D5DB",
            }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
              style={{ left: livreur?.disponibiliteStatut === "DISPONIBLE" || livreur?.disponibiliteStatut === "EN_COURSE" ? "calc(100% - 22px)" : "2px" }}
            />
          </button>
        </div>
        <p className="text-xs font-medium mt-2" style={{
          color: livreur?.disponibiliteStatut === "DISPONIBLE" ? "#10B981"
            : livreur?.disponibiliteStatut === "EN_COURSE" ? "#F47920" : "#9CA3AF",
        }}>
          {livreur?.disponibiliteStatut === "DISPONIBLE" ? "● Disponible"
            : livreur?.disponibiliteStatut === "EN_COURSE" ? "● En course"
            : "● Hors ligne"}
        </p>
      </div>

      {/* Signal sonore */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {soundEnabled ? <Volume2 className="w-4 h-4 text-gray-400" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
            <div>
              <p className="text-sm font-semibold text-gray-900">Signal sonore</p>
              <p className="text-xs text-gray-400 mt-0.5">Jouer un son pour chaque nouvelle livraison disponible</p>
            </div>
          </div>
          <button
            onClick={() => onToggleSound(!soundEnabled)}
            className="relative w-10 h-6 rounded-full transition-colors shrink-0"
            style={{ backgroundColor: soundEnabled ? "#1A3072" : "#D1D5DB" }}
          >
            <span className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all" style={{ left: soundEnabled ? "22px" : "2px" }} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {[
          { icon: Truck, label: "Historique des livraisons" },
          { icon: Settings, label: "Paramètres du compte" },
          { icon: Shield, label: "Confidentialité & données" },
          { icon: HelpCircle, label: "Aide & support" },
        ].map(({ icon: Icon, label }) => (
          <button key={label} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 border-gray-50 text-left">
            <div className="flex items-center gap-3">
              <Icon className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-800">{label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>
        ))}
      </div>

      <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-200 text-red-600 hover:bg-red-50 transition">
        <LogOut className="w-4 h-4" />
        <span className="text-sm font-medium">Déconnexion</span>
      </button>
    </div>
  );
}

// ── Disponibilité toggle ────────────────────────────────────────────────────────

function DisponibiliteToggle({
  statut, loading, onToggle,
}: { statut?: LivreurAPI["disponibiliteStatut"]; loading: boolean; onToggle: () => void }) {
  if (!statut) return null;

  const isEnCourse = statut === "EN_COURSE";
  const isDisponible = statut === "DISPONIBLE";

  const dotColor = isEnCourse ? "#F47920" : isDisponible ? "#10B981" : "#9CA3AF";
  const label = isEnCourse ? "En course" : isDisponible ? "Disponible" : "Hors ligne";

  return (
    <button
      onClick={onToggle}
      disabled={loading || isEnCourse}
      className="flex items-center gap-1.5 group disabled:cursor-default"
      title={isEnCourse ? "Impossible de changer pendant une course" : `Passer ${isDisponible ? "hors ligne" : "disponible"}`}
    >
      <div className="w-2 h-2 rounded-full transition-colors" style={{ backgroundColor: dotColor }} />
      <span className="text-xs font-medium transition-colors" style={{ color: dotColor }}>
        {loading ? "…" : label}
      </span>
      {!isEnCourse && (
        <span className="text-[10px] text-gray-400 group-hover:text-gray-600 transition-colors">
          {isDisponible ? "→ Hors ligne" : "→ Disponible"}
        </span>
      )}
    </button>
  );
}

// ── Main component ──────────────────────────────────────────────────────────────

export function DeliveryDashboard({ onLogout }: Props) {
  const [tab, setTab] = useState<DeliveryTab>("home");
  const [livSubTab, setLivSubTab] = useState<LivraisonsSubTab>("disponibles");
  const livreurId = session.getUserId();

  const [livreur, setLivreur] = useState<LivreurAPI | null>(null);
  const [mesCourses, setMesCourses] = useState<LivraisonAPI[]>([]);
  const [disponibles, setDisponibles] = useState<LivraisonAPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const goLivraisons = (sub: LivraisonsSubTab) => { setLivSubTab(sub); setTab("livraisons"); };

  // Badge "Notifications" : compte les événements plus récents que la dernière consultation
  // de l'onglet (partagé via localStorage entre les deux instances mobile/desktop montées en parallèle).
  const [notifLastSeen, setNotifLastSeen] = useState<number>(() => {
    try { return parseInt(localStorage.getItem("delivery_notif_last_seen") ?? "0", 10) || 0; } catch { return 0; }
  });
  useEffect(() => {
    if (tab !== "notifications") return;
    const now = Date.now();
    setNotifLastSeen(now);
    try { localStorage.setItem("delivery_notif_last_seen", String(now)); } catch { /* ignore */ }
  }, [tab]);
  const unreadNotifCount = buildActivityFeed(disponibles, mesCourses)
    .filter((i) => new Date(i.time).getTime() > notifLastSeen).length;

  const pollDisponibles = useCallback(
    () => (livreurId ? livraisonsApi.getEnAttente() : Promise.resolve([])),
    [livreurId],
  );
  const alerts = useLiveAlerts({
    storageKey: "delivery",
    poll: pollDisponibles,
    getId: (l) => l.id,
    enabled: !!livreurId,
  });

  useEffect(() => { requestNotificationPermission(); }, []);

  const load = () => {
    if (!livreurId) return;
    setLoading(true);
    Promise.all([
      livreursApi.getById(livreurId),
      livraisonsApi.getByLivreur(livreurId),
      livraisonsApi.getEnAttente(),
    ])
      .then(([lv, mes, dispo]) => {
        setLivreur(lv);
        setMesCourses(mes);
        setDisponibles(dispo);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [livreurId]);

  const handleToggleDisponibilite = async () => {
    if (!livreur || toggling) return;
    if (livreur.disponibiliteStatut === "EN_COURSE") return;
    const next = livreur.disponibiliteStatut === "DISPONIBLE" ? "HORS_LIGNE" : "DISPONIBLE";
    setToggling(true);
    try {
      const updated = await livreursApi.changerDisponibilite(livreurId, next);
      setLivreur(updated);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setToggling(false);
    }
  };

  const handleSeProposer = async (id: string) => {
    setActionError(null);
    try {
      const updated = await livraisonsApi.seProposer(id, livreurId);
      setDisponibles((prev) => prev.filter((l) => l.id !== id));
      setMesCourses((prev) => [updated, ...prev]);
      goLivraisons("mesCourses");
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Erreur");
    }
  };

  const handlePrendreEnCharge = async (id: string) => {
    setActionError(null);
    try {
      const updated = await livraisonsApi.prendreEnCharge(id, livreurId);
      setMesCourses((prev) => prev.map((l) => l.id === updated.id ? updated : l));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Erreur");
    }
  };

  const handleConfirmer = async (id: string) => {
    setActionError(null);
    try {
      const updated = await livraisonsApi.confirmer(id, livreurId);
      setMesCourses((prev) => prev.map((l) => l.id === updated.id ? updated : l));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Erreur");
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden" style={{ backgroundColor: "#F3F4F6" }}>
      <DeliverySidebarNav tab={tab} disponiblesCount={disponibles.length} unreadNotifCount={unreadNotifCount} onTab={setTab} onLogout={onLogout} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="shrink-0 bg-white border-b border-gray-200 lg:hidden">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: "#1A3072" }}>
                <Package className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  {livreur ? `${livreur.prenom} ${livreur.nom}` : "Espace Livreur"}
                </p>
                <DisponibiliteToggle statut={livreur?.disponibiliteStatut} loading={toggling} onToggle={handleToggleDisponibilite} />
              </div>
            </div>
            {onLogout && (
              <button onClick={onLogout} className="p-2 rounded-full hover:bg-gray-100">
                <LogOut className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>
        </header>

        <header className="hidden lg:flex shrink-0 bg-white border-b border-gray-200 items-center justify-between px-6 py-3">
          <h1 className="font-bold text-gray-900 text-lg">
            {tab === "home" && "Tableau de bord"}
            {tab === "livraisons" && "Livraisons"}
            {tab === "notifications" && "Notifications"}
            {tab === "profile" && "Mon profil"}
          </h1>
          <DisponibiliteToggle statut={livreur?.disponibiliteStatut} loading={toggling} onToggle={handleToggleDisponibilite} />
        </header>

        {actionError && (
          <div className="mx-4 mt-2 px-4 py-2 bg-red-50 text-red-600 text-sm rounded-xl">{actionError}</div>
        )}

        <div className="flex-1 overflow-y-auto">
          {tab === "home" && (
            <DeliveryHomeTab
              mesCourses={mesCourses}
              disponibles={disponibles}
              onGoDisponibles={() => goLivraisons("disponibles")}
              onGoMesCourses={() => goLivraisons("mesCourses")}
            />
          )}
          {tab === "livraisons" && (
            <LivraisonsTab
              subTab={livSubTab}
              onSubTab={setLivSubTab}
              disponibles={disponibles}
              mesCourses={mesCourses}
              loading={loading}
              onRefresh={load}
              onSeProposer={handleSeProposer}
              onPrendreEnCharge={handlePrendreEnCharge}
              onConfirmer={handleConfirmer}
            />
          )}
          {tab === "notifications" && (
            <NotificationsTab disponibles={disponibles} mesCourses={mesCourses} onGoLivraisons={goLivraisons} />
          )}
          {tab === "profile" && (
            <DeliveryProfileTab
              onLogout={onLogout} livreur={livreur} toggling={toggling} onToggle={handleToggleDisponibilite}
              soundEnabled={alerts.soundEnabled} onToggleSound={alerts.setSoundEnabled}
            />
          )}
        </div>

        <DeliveryNav tab={tab} disponiblesCount={disponibles.length} unreadNotifCount={unreadNotifCount} onTab={setTab} />
      </div>

      {alerts.newItem && (
        <NotificationToast
          icon={Bell}
          color="#F47920"
          title="Nouvelle livraison disponible"
          message={`Commande #${alerts.newItem.commandeId?.slice(-8).toUpperCase() ?? alerts.newItem.id.slice(-8).toUpperCase()} en attente d'un livreur.`}
          onView={() => { goLivraisons("disponibles"); load(); alerts.dismissNew(); }}
          onDismiss={alerts.dismissNew}
        />
      )}
    </div>
  );
}
