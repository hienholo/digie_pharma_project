import { useState, useEffect } from "react";
import { RequestList } from "./RequestList";
import { InventoryPanel } from "./InventoryPanel";
import {
  Package, Inbox, BarChart3, LogOut, Home, User,
  MapPin, Star, ChevronRight, Settings, HelpCircle, Shield, Phone, Bell,
} from "lucide-react";
import {
  pharmaciesApi, demandesApi, commandesApi, medicamentsApi, notificationsApi, session,
} from "../lib/api";
import type { PharmacieAPI, DemandeEnAttenteAPI, CommandePharmacieAPI, MedicamentAPI } from "../lib/types";

// Re-export des types pour les sous-composants
export type { DemandeEnAttenteAPI as Request } from "../lib/types";
export type { MedicamentAPI as InventoryItem } from "../lib/types";

type PharmacyTab = "home" | "requests" | "commandes" | "inventory" | "profile";

type Props = {
  onLogout?: () => void;
};

const GREEN = "#1A3072";

const statutLabel: Record<CommandePharmacieAPI["statut"], string> = {
  EN_PREPARATION: "En préparation",
  PRETE:          "Prête",
  EN_LIVRAISON:   "En livraison",
  TERMINEE:       "Terminée",
  ANNULEE:        "Annulée",
};

const statutColor: Record<CommandePharmacieAPI["statut"], string> = {
  EN_PREPARATION: "#F47920",
  PRETE:          "#10B981",
  EN_LIVRAISON:   "#1A3072",
  TERMINEE:       "#6B7280",
  ANNULEE:        "#EF4444",
};

// ── Bottom navigation ─────────────────────────────────────────────────────────

function PharmacyNav({
  tab, pendingCount, commandesCount, onTab,
}: { tab: PharmacyTab; pendingCount: number; commandesCount: number; onTab: (t: PharmacyTab) => void }) {
  const tabs = [
    { key: "home" as const, icon: Home, label: "Accueil", badge: 0 },
    { key: "requests" as const, icon: Inbox, label: "Demandes", badge: pendingCount },
    { key: "commandes" as const, icon: Package, label: "Commandes", badge: commandesCount },
    { key: "inventory" as const, icon: BarChart3, label: "Stock", badge: 0 },
    { key: "profile" as const, icon: User, label: "Profil", badge: 0 },
  ];
  return (
    <nav className="shrink-0 bg-white border-t border-gray-200 lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map(({ key, icon: Icon, label, badge }) => {
          const active = tab === key;
          return (
            <button key={key} onClick={() => onTab(key)} className="flex flex-col items-center gap-1 flex-1 py-1 relative">
              <div className="relative">
                <Icon className="w-6 h-6 transition-colors" style={{ color: active ? GREEN : "#9CA3AF" }} />
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white font-bold bg-red-500" style={{ fontSize: "9px" }}>
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium transition-colors" style={{ color: active ? GREEN : "#9CA3AF" }}>{label}</span>
              {active && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full" style={{ backgroundColor: GREEN }} />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function PharmacySidebarNav({
  tab, pendingCount, commandesCount, onTab, onLogout, pharmacieName,
}: { tab: PharmacyTab; pendingCount: number; commandesCount: number; onTab: (t: PharmacyTab) => void; onLogout?: () => void; pharmacieName: string }) {
  const tabs = [
    { key: "home" as const, icon: Home, label: "Accueil", badge: 0 },
    { key: "requests" as const, icon: Inbox, label: "Demandes", badge: pendingCount },
    { key: "commandes" as const, icon: Package, label: "Commandes", badge: commandesCount },
    { key: "inventory" as const, icon: BarChart3, label: "Stock", badge: 0 },
    { key: "profile" as const, icon: User, label: "Profil", badge: 0 },
  ];
  return (
    <aside className="hidden lg:flex flex-col shrink-0 border-r border-gray-200 bg-white" style={{ width: 240 }}>
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: GREEN }}>
            {pharmacieName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-base truncate max-w-[150px]" style={{ color: GREEN }}>{pharmacieName}</p>
            <p className="text-xs text-gray-400">Espace Pharmacie</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {tabs.map(({ key, icon: Icon, label, badge }) => {
          const active = tab === key;
          return (
            <button key={key} onClick={() => onTab(key)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left"
              style={{ backgroundColor: active ? "#EEF1F8" : "transparent", color: active ? GREEN : "#4B5563" }}>
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium flex-1">{label}</span>
              {badge > 0 && (
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

// ── Home tab ──────────────────────────────────────────────────────────────────

function PharmacyHomeTab({
  pharmacie, pendingCount, commandes, onGoRequests, onGoInventory,
}: {
  pharmacie: PharmacieAPI | null;
  pendingCount: number;
  commandes: CommandePharmacieAPI[];
  onGoRequests: () => void;
  onGoInventory: () => void;
}) {
  const thisMonth = commandes.filter((c) => {
    const d = new Date(c.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const recentCommandes = commandes.slice(0, 3);

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Welcome card */}
      <div className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #122660 0%, #1A3072 100%)" }}>
        <div className="relative z-10">
          <p className="text-sm text-white/80">Bienvenue 👋</p>
          <h2 className="text-xl font-bold mt-0.5">{pharmacie?.nom ?? "Pharmacie"}</h2>
          <p className="text-xs text-white/70 mt-1">{pharmacie?.adresse ?? "Adresse non renseignée"}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-2 h-2 rounded-full bg-white" />
            <span className="text-xs text-white/90">{pharmacie?.livraisonActive ? "Livraison active" : "Retrait uniquement"}</span>
          </div>
        </div>
        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute -right-2 top-10 w-14 h-14 rounded-full bg-white/10" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-2xl font-bold text-gray-900">{thisMonth}</p>
          <p className="text-xs text-gray-500 mt-0.5">Commandes (mois)</p>
        </div>
        <button onClick={onGoRequests} className="bg-white rounded-2xl p-4 border border-gray-100 text-left hover:border-[#D6DCF0] transition">
          <p className="text-2xl font-bold" style={{ color: pendingCount > 0 ? "#EF4444" : GREEN }}>{pendingCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">En attente</p>
        </button>
        <button onClick={onGoInventory} className="bg-white rounded-2xl p-4 border border-gray-100 text-left hover:border-[#D6DCF0] transition">
          <p className="text-2xl font-bold" style={{ color: GREEN }}>
            <Package className="w-6 h-6" style={{ color: GREEN }} />
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Stock</p>
        </button>
      </div>

      {/* Commandes récentes */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Commandes récentes</p>
          <button onClick={onGoRequests} className="text-xs text-[#1A3072]">Voir tout →</button>
        </div>
        {recentCommandes.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-400">Aucune commande pour le moment</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentCommandes.map((c) => (
              <div key={c.id} className="px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: statutColor[c.statut] + "20" }}>
                  <Inbox className="w-4 h-4" style={{ color: statutColor[c.statut] }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{c.patientPrenom} {c.patientNom}</p>
                  <p className="text-xs text-gray-500 truncate">{c.medicamentNoms.join(", ") || c.modeObtention}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                  style={{ backgroundColor: statutColor[c.statut] + "20", color: statutColor[c.statut] }}>
                  {statutLabel[c.statut]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Livraison toggle */}
      {pharmacie && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#EEF1F8" }}>
                <BarChart3 className="w-5 h-5 text-[#1A3072]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Livraison à domicile</p>
                <p className="text-xs text-gray-500">{pharmacie.livraisonActive ? "Activée" : "Désactivée"}</p>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pharmacie.livraisonActive ? GREEN : "#D1D5DB" }} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Commandes tab ─────────────────────────────────────────────────────────────

function CommandesTab({ commandes, onMarquerPrete, onTerminer }: {
  commandes: CommandePharmacieAPI[];
  onMarquerPrete: (id: string) => void;
  onTerminer: (id: string) => void;
}) {
  if (commandes.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">Aucune commande pour le moment</p>
      </div>
    );
  }
  return (
    <div className="px-4 py-4 space-y-3">
      {commandes.map((c) => (
        <div key={c.id} className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-medium text-gray-900">{c.patientPrenom} {c.patientNom}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date(c.createdAt).toLocaleDateString("fr-FR")} · {c.modeObtention === "LIVRAISON" ? "Livraison" : "Retrait"}
              </p>
            </div>
            <span className="text-xs px-2 py-1 rounded-full font-medium"
              style={{ backgroundColor: statutColor[c.statut] + "20", color: statutColor[c.statut] }}>
              {statutLabel[c.statut]}
            </span>
          </div>
          {c.medicamentNoms.length > 0 && (
            <p className="text-sm text-gray-600 mb-3">
              <span className="font-medium">Médicaments :</span> {c.medicamentNoms.join(", ")}
            </p>
          )}
          {c.statut === "EN_PREPARATION" && (
            <button onClick={() => onMarquerPrete(c.id)}
              className="w-full py-2 rounded-xl text-white text-sm font-medium"
              style={{ backgroundColor: GREEN }}>
              Marquer comme prête
            </button>
          )}
          {c.statut === "PRETE" && c.modeObtention === "RETRAIT" && (
            <button onClick={() => onTerminer(c.id)}
              className="w-full py-2 rounded-xl text-white text-sm font-medium bg-gray-500">
              Confirmer le retrait
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Profile tab ───────────────────────────────────────────────────────────────

function PharmacyProfileTab({ pharmacie, onLogout }: { pharmacie: PharmacieAPI | null; onLogout?: () => void }) {
  return (
    <div className="px-4 py-4 space-y-4 pb-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0"
            style={{ backgroundColor: GREEN }}>
            {(pharmacie?.nom ?? "P").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900">{pharmacie?.nom ?? "Pharmacie"}</p>
            <p className="text-xs text-gray-500 mt-0.5">{pharmacie?.adresse ?? "—"}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 text-yellow-400" fill="#FBBF24" />
              <span className="text-xs text-gray-600">Espace pharmacie</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Informations</p>
        </div>
        <div className="divide-y divide-gray-50">
          {pharmacie?.adresse && (
            <div className="flex items-center gap-3 px-4 py-3">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-sm text-gray-800">{pharmacie.adresse}</span>
            </div>
          )}
          {pharmacie?.telephone && (
            <div className="flex items-center gap-3 px-4 py-3">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-sm text-gray-800">{pharmacie.telephone}</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {[
          { icon: Settings, label: "Paramètres de la pharmacie" },
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

export function PharmacyDashboard({ onLogout }: Props) {
  const [tab, setTab] = useState<PharmacyTab>("home");
  const pharmacieId = session.getUserId();

  const [pharmacie, setPharmacie]        = useState<PharmacieAPI | null>(null);
  const [demandesEnAttente, setDemandes] = useState<DemandeEnAttenteAPI[]>([]);
  const [commandes, setCommandes]        = useState<CommandePharmacieAPI[]>([]);
  const [medicaments, setMedicaments]    = useState<MedicamentAPI[]>([]);
  const [unreadCount, setUnreadCount]    = useState(0);

  const reloadCommandes = () =>
    commandesApi.getByPharmacieDetail(pharmacieId).then(setCommandes).catch(() => {});

  useEffect(() => {
    if (!pharmacieId) return;
    pharmaciesApi.getById(pharmacieId).then(setPharmacie).catch(() => {});
    demandesApi.getEnAttenteParPharmacie(pharmacieId).then(setDemandes).catch(() => {});
    reloadCommandes();
    medicamentsApi.list().then(setMedicaments).catch(() => {});
    notificationsApi.getNonLues(pharmacieId)
      .then((n) => setUnreadCount(n.length))
      .catch(() => {});
  }, [pharmacieId]);

  const handleMarquerPrete = async (id: string) => {
    await commandesApi.marquerPrete(id);
    reloadCommandes();
  };

  const handleTerminer = async (id: string) => {
    await commandesApi.terminer(id);
    reloadCommandes();
  };

  const handleAddMedicament = async (m: Omit<MedicamentAPI, "id">) => {
    const created = await medicamentsApi.create(m);
    setMedicaments((prev) => [...prev, created]);
  };

  const pharmacieName = pharmacie?.nom ?? "Pharmacie";
  const newCommandesCount = commandes.filter((c) => c.statut === "EN_PREPARATION").length;

  return (
    <div className="flex-1 flex overflow-hidden" style={{ backgroundColor: "#F3F4F6" }}>
      <PharmacySidebarNav
        tab={tab} pendingCount={demandesEnAttente.length} commandesCount={newCommandesCount}
        onTab={setTab} onLogout={onLogout} pharmacieName={pharmacieName}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header mobile */}
        <header className="shrink-0 bg-white border-b border-gray-200 lg:hidden">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: GREEN }}>
                {pharmacieName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{pharmacieName}</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: GREEN }} />
                  <span className="text-xs" style={{ color: GREEN }}>En ligne</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="relative p-2 rounded-full hover:bg-gray-100">
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
                )}
              </button>
              {onLogout && (
                <button onClick={onLogout} className="p-2 rounded-full hover:bg-gray-100">
                  <LogOut className="w-5 h-5 text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Header desktop */}
        <header className="hidden lg:flex shrink-0 bg-white border-b border-gray-200 items-center justify-between px-6 py-3">
          <h1 className="font-bold text-gray-900 text-lg">
            {tab === "home" && "Tableau de bord"}
            {tab === "requests" && "Demandes patients"}
            {tab === "commandes" && "Commandes"}
            {tab === "inventory" && "Catalogue médicaments"}
            {tab === "profile" && "Profil pharmacie"}
          </h1>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-full hover:bg-gray-100">
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
              )}
            </button>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: GREEN }} />
              <span className="text-sm text-gray-500">{pharmacieName}</span>
            </div>
          </div>
        </header>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {tab === "home" && (
            <PharmacyHomeTab
              pharmacie={pharmacie}
              pendingCount={demandesEnAttente.length}
              commandes={commandes}
              onGoRequests={() => setTab("requests")}
              onGoInventory={() => setTab("inventory")}
            />
          )}
          {tab === "requests" && (
            <div className="px-4 py-4">
              <RequestList
                requests={demandesEnAttente}
                pharmacieId={pharmacieId}
                onRepondu={(reponseId) =>
                  setDemandes((prev) => prev.filter((d) => d.reponseId !== reponseId))
                }
              />
            </div>
          )}
          {tab === "commandes" && (
            <CommandesTab commandes={commandes} onMarquerPrete={handleMarquerPrete} onTerminer={handleTerminer} />
          )}
          {tab === "inventory" && (
            <div className="px-4 py-4">
              <InventoryPanel medicaments={medicaments} onAdd={handleAddMedicament} />
            </div>
          )}
          {tab === "profile" && <PharmacyProfileTab pharmacie={pharmacie} onLogout={onLogout} />}
        </div>

        <PharmacyNav
          tab={tab} pendingCount={demandesEnAttente.length} commandesCount={newCommandesCount}
          onTab={setTab}
        />
      </div>
    </div>
  );
}
