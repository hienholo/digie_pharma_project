import { useState, useEffect } from "react";
import {
  Package, MapPin, Clock, CheckCircle, Navigation, LogOut,
  Home, User, Truck, ChevronRight, Settings, HelpCircle,
  Shield, Star, RefreshCw, Bell,
} from "lucide-react";
import { livraisonsApi, livreursApi, session } from "../lib/api";
import type { LivraisonAPI, LivreurAPI } from "../lib/types";

type DeliveryTab = "home" | "disponibles" | "mesCourses" | "profile";

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
  tab, disponiblesCount, activeCount, onTab,
}: { tab: DeliveryTab; disponiblesCount: number; activeCount: number; onTab: (t: DeliveryTab) => void }) {
  const tabs = [
    { key: "home" as const, icon: Home, label: "Accueil" },
    { key: "disponibles" as const, icon: Bell, label: "Disponibles", badge: disponiblesCount },
    { key: "mesCourses" as const, icon: Truck, label: "Mes courses", badge: activeCount },
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
  tab, disponiblesCount, activeCount, onTab, onLogout,
}: { tab: DeliveryTab; disponiblesCount: number; activeCount: number; onTab: (t: DeliveryTab) => void; onLogout?: () => void }) {
  const tabs = [
    { key: "home" as const, icon: Home, label: "Accueil" },
    { key: "disponibles" as const, icon: Bell, label: "Disponibles", badge: disponiblesCount },
    { key: "mesCourses" as const, icon: Truck, label: "Mes courses", badge: activeCount },
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
          <p className="text-xs text-white/70 mt-1">LAHFIA Livraison · Disponible</p>
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
        disponibles.map((l) => (
          <div key={l.id} className="bg-white rounded-2xl p-4 border border-gray-200">
            {/* En-tête */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">Commande #{l.commandeId?.slice(-8) ?? l.id.slice(-8)}</p>
                <p className="text-xs text-gray-400 mt-0.5">Livraison #{l.id.slice(-8)}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs text-white font-medium" style={{ backgroundColor: "#F47920" }}>
                Disponible
              </span>
            </div>

            {/* Adresse */}
            <div className="flex items-start gap-2 mb-3 text-sm text-gray-700">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <span>{l.adresseLivraison ?? "Adresse non disponible"}</span>
            </div>

            {/* Date */}
            {l.createdAt && (
              <div className="flex items-center gap-2 mb-4 text-xs text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                Commandé le {new Date(l.createdAt).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </div>
            )}

            {/* Bouton se proposer */}
            <button
              onClick={() => handleProposer(l.id)}
              disabled={proposing === l.id}
              className="w-full py-2.5 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60 transition"
              style={{ backgroundColor: "#1A3072" }}
            >
              <Truck className="w-4 h-4" />
              {proposing === l.id ? "Envoi…" : "Me proposer pour cette livraison"}
            </button>
          </div>
        ))
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

      {active.map((l) => (
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

          <div className="flex items-start gap-2 mb-3 text-sm text-gray-700">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <span>{l.adresseLivraison ?? "Adresse non disponible"}</span>
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
      ))}

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

// ── Profile tab ─────────────────────────────────────────────────────────────────

function DeliveryProfileTab({
  onLogout, livreur, toggling, onToggle,
}: { onLogout?: () => void; livreur: LivreurAPI | null; toggling: boolean; onToggle: () => void }) {
  return (
    <div className="px-4 py-4 space-y-4 pb-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0" style={{ backgroundColor: "#1A3072" }}>
            {livreur ? livreur.prenom.charAt(0).toUpperCase() : "L"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900">
              {livreur ? `${livreur.prenom} ${livreur.nom}` : "Livreur LAHFIA"}
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
  const livreurId = session.getUserId();

  const [livreur, setLivreur] = useState<LivreurAPI | null>(null);
  const [mesCourses, setMesCourses] = useState<LivraisonAPI[]>([]);
  const [disponibles, setDisponibles] = useState<LivraisonAPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

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
      setTab("mesCourses");
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

  const activeCount = mesCourses.filter((l) => l.statut === "ASSIGNEE" || l.statut === "EN_COURS").length;

  return (
    <div className="flex-1 flex overflow-hidden" style={{ backgroundColor: "#F3F4F6" }}>
      <DeliverySidebarNav tab={tab} disponiblesCount={disponibles.length} activeCount={activeCount} onTab={setTab} onLogout={onLogout} />

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
            {tab === "disponibles" && "Livraisons disponibles"}
            {tab === "mesCourses" && "Mes courses"}
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
              onGoDisponibles={() => setTab("disponibles")}
              onGoMesCourses={() => setTab("mesCourses")}
            />
          )}
          {tab === "disponibles" && (
            <DisponiblesTab
              disponibles={disponibles}
              loading={loading}
              onRefresh={load}
              onSeProposer={handleSeProposer}
            />
          )}
          {tab === "mesCourses" && (
            <MesCoursesTab
              livraisons={mesCourses}
              loading={loading}
              onRefresh={load}
              onPrendreEnCharge={handlePrendreEnCharge}
              onConfirmer={handleConfirmer}
            />
          )}
          {tab === "profile" && <DeliveryProfileTab onLogout={onLogout} livreur={livreur} toggling={toggling} onToggle={handleToggleDisponibilite} />}
        </div>

        <DeliveryNav tab={tab} disponiblesCount={disponibles.length} activeCount={activeCount} onTab={setTab} />
      </div>
    </div>
  );
}
