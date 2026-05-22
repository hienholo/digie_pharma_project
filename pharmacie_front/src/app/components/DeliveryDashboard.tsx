import { useState, useEffect } from "react";
import {
  Package, MapPin, Clock, CheckCircle, Navigation, LogOut,
  Home, User, Truck, History, ChevronRight, Settings, HelpCircle,
  Shield, Star, RefreshCw,
} from "lucide-react";
import { livraisonsApi, session } from "../lib/api";
import type { LivraisonAPI } from "../lib/types";

type DeliveryTab = "home" | "deliveries" | "profile";

type Props = { onLogout?: () => void };

const STATUT_LABEL: Record<LivraisonAPI["statut"], string> = {
  EN_ATTENTE_LIVREUR: "En attente",
  ASSIGNEE:           "Assignée",
  EN_COURS:           "En cours",
  LIVREE:             "Livrée",
  ECHEC:              "Échec",
};

const STATUT_COLOR: Record<LivraisonAPI["statut"], string> = {
  EN_ATTENTE_LIVREUR: "#F59E0B",
  ASSIGNEE:           "#3B82F6",
  EN_COURS:           "#8B5CF6",
  LIVREE:             "#10B981",
  ECHEC:              "#EF4444",
};

// ── Navigation ────────────────────────────────────────────────────────────────

function DeliveryNav({ tab, activeCount, onTab }: { tab: DeliveryTab; activeCount: number; onTab: (t: DeliveryTab) => void }) {
  const tabs = [
    { key: "home" as const, icon: Home, label: "Accueil" },
    { key: "deliveries" as const, icon: Truck, label: "Livraisons" },
    { key: "profile" as const, icon: User, label: "Profil" },
  ];
  return (
    <nav className="shrink-0 bg-white border-t border-gray-200 lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map(({ key, icon: Icon, label }) => {
          const active = tab === key;
          return (
            <button key={key} onClick={() => onTab(key)} className="flex flex-col items-center gap-1 flex-1 py-1 relative">
              <div className="relative">
                <Icon className="w-6 h-6 transition-colors" style={{ color: active ? "#F59E0B" : "#9CA3AF" }} />
                {key === "deliveries" && activeCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white font-bold bg-red-500" style={{ fontSize: "9px" }}>
                    {activeCount > 9 ? "9+" : activeCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium transition-colors" style={{ color: active ? "#F59E0B" : "#9CA3AF" }}>{label}</span>
              {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full" style={{ backgroundColor: "#F59E0B" }} />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function DeliverySidebarNav({ tab, activeCount, onTab, onLogout }: { tab: DeliveryTab; activeCount: number; onTab: (t: DeliveryTab) => void; onLogout?: () => void }) {
  const tabs = [
    { key: "home" as const, icon: Home, label: "Accueil" },
    { key: "deliveries" as const, icon: Truck, label: "Livraisons" },
    { key: "profile" as const, icon: User, label: "Profil" },
  ];
  return (
    <aside className="hidden lg:flex flex-col shrink-0 border-r border-gray-200 bg-white" style={{ width: 240 }}>
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: "#F59E0B" }}>
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-base" style={{ color: "#D97706" }}>Livreur</p>
            <p className="text-xs text-gray-400">Espace Livraison</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {tabs.map(({ key, icon: Icon, label }) => {
          const active = tab === key;
          return (
            <button key={key} onClick={() => onTab(key)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left"
              style={{ backgroundColor: active ? "#FFFBEB" : "transparent", color: active ? "#D97706" : "#4B5563" }}>
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium flex-1">{label}</span>
              {key === "deliveries" && activeCount > 0 && (
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold shrink-0 bg-red-500" style={{ fontSize: "10px" }}>
                  {activeCount > 9 ? "9+" : activeCount}
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

// ── Home tab ──────────────────────────────────────────────────────────────────

function DeliveryHomeTab({ livraisons, onGoDeliveries }: { livraisons: LivraisonAPI[]; onGoDeliveries: () => void }) {
  const active = livraisons.filter((l) => l.statut === "ASSIGNEE" || l.statut === "EN_COURS");
  const done   = livraisons.filter((l) => l.statut === "LIVREE").length;

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)" }}>
        <div className="relative z-10">
          <p className="text-sm text-white/80">Bonjour 👋</p>
          <h2 className="text-xl font-bold mt-0.5">Espace Livreur</h2>
          <p className="text-xs text-white/70 mt-1">LAHFIA Livraison · Disponible</p>
        </div>
        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute -right-2 top-10 w-14 h-14 rounded-full bg-white/10" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={onGoDeliveries} className="bg-white rounded-2xl p-4 border border-gray-100 text-left hover:border-amber-200 transition">
          <p className="text-2xl font-bold" style={{ color: active.length > 0 ? "#F59E0B" : "#10B981" }}>{active.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">En cours</p>
        </button>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-2xl font-bold" style={{ color: "#10B981" }}>{done}</p>
          <p className="text-xs text-gray-500 mt-0.5">Livrées</p>
        </div>
      </div>

      {active.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Livraisons actives</p>
            <button onClick={onGoDeliveries} className="text-xs text-amber-600">Voir tout →</button>
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

// ── Deliveries tab ────────────────────────────────────────────────────────────

function DeliveriesTab({
  livraisons, loading, onRefresh, onPrendreEnCharge, onConfirmer,
}: {
  livraisons: LivraisonAPI[];
  loading: boolean;
  onRefresh: () => void;
  onPrendreEnCharge: (id: string) => Promise<void>;
  onConfirmer: (id: string) => Promise<void>;
}) {
  const active = livraisons.filter((l) => l.statut === "ASSIGNEE" || l.statut === "EN_COURS");

  return (
    <div className="px-4 py-4 space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold text-gray-700">{active.length} livraison(s) active(s)</p>
        <button onClick={onRefresh} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {active.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
          <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Aucune livraison assignée</p>
          <p className="text-xs text-gray-400 mt-1">La pharmacie vous assignera une livraison</p>
        </div>
      ) : (
        active.map((l) => (
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
                style={{ backgroundColor: "#8B5CF6" }}>
                Récupérer à la pharmacie
              </button>
            )}
            {l.statut === "EN_COURS" && (
              <button onClick={() => onConfirmer(l.id)}
                className="w-full py-2.5 rounded-xl text-white text-sm font-medium"
                style={{ backgroundColor: "#10B981" }}>
                <CheckCircle className="w-4 h-4 inline mr-1" />
                Confirmer la livraison
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// ── Profile tab ───────────────────────────────────────────────────────────────

function DeliveryProfileTab({ onLogout, livreurId }: { onLogout?: () => void; livreurId: string }) {
  return (
    <div className="px-4 py-4 space-y-4 pb-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0" style={{ backgroundColor: "#F59E0B" }}>
            L
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900">Livreur LAHFIA</p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">ID : {livreurId.slice(-12)}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 text-yellow-400" fill="#FBBF24" />
              <span className="text-xs text-gray-600">Espace livreur</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {[
          { icon: History, label: "Historique des livraisons" },
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

// ── Main component ────────────────────────────────────────────────────────────

export function DeliveryDashboard({ onLogout }: Props) {
  const [tab, setTab] = useState<DeliveryTab>("home");
  const livreurId = session.getUserId();

  const [livraisons, setLivraisons] = useState<LivraisonAPI[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = () => {
    if (!livreurId) return;
    setLoading(true);
    livraisonsApi.getByLivreur(livreurId)
      .then(setLivraisons)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [livreurId]);

  const handlePrendreEnCharge = async (id: string) => {
    setActionError(null);
    try {
      const updated = await livraisonsApi.prendreEnCharge(id, livreurId);
      setLivraisons((prev) => prev.map((l) => l.id === updated.id ? updated : l));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Erreur");
    }
  };

  const handleConfirmer = async (id: string) => {
    setActionError(null);
    try {
      const updated = await livraisonsApi.confirmer(id, livreurId);
      setLivraisons((prev) => prev.map((l) => l.id === updated.id ? updated : l));
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Erreur");
    }
  };

  const activeCount = livraisons.filter((l) => l.statut === "ASSIGNEE" || l.statut === "EN_COURS").length;

  return (
    <div className="flex-1 flex overflow-hidden" style={{ backgroundColor: "#F3F4F6" }}>
      <DeliverySidebarNav tab={tab} activeCount={activeCount} onTab={setTab} onLogout={onLogout} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="shrink-0 bg-white border-b border-gray-200 lg:hidden">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: "#F59E0B" }}>
                <Package className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Espace Livreur</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-xs text-green-600">Disponible</span>
                </div>
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
            {tab === "deliveries" && "Mes livraisons"}
            {tab === "profile" && "Mon profil"}
          </h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-sm text-gray-500">Disponible</span>
          </div>
        </header>

        {actionError && (
          <div className="mx-4 mt-2 px-4 py-2 bg-red-50 text-red-600 text-sm rounded-xl">{actionError}</div>
        )}

        <div className="flex-1 overflow-y-auto">
          {tab === "home" && <DeliveryHomeTab livraisons={livraisons} onGoDeliveries={() => setTab("deliveries")} />}
          {tab === "deliveries" && (
            <DeliveriesTab
              livraisons={livraisons}
              loading={loading}
              onRefresh={load}
              onPrendreEnCharge={handlePrendreEnCharge}
              onConfirmer={handleConfirmer}
            />
          )}
          {tab === "profile" && <DeliveryProfileTab onLogout={onLogout} livreurId={livreurId} />}
        </div>

        <DeliveryNav tab={tab} activeCount={activeCount} onTab={setTab} />
      </div>
    </div>
  );
}
