import { useState } from "react";
import { RequestList } from "./RequestList";
import { InventoryPanel } from "./InventoryPanel";
import {
  Package, Inbox, BarChart3, LogOut, Home, User,
  MapPin, Star, ChevronRight, Settings, HelpCircle, Shield, Phone,
} from "lucide-react";
import { mockRequests, mockInventory } from "../datamock/pharmacy-dashboard.mock";
import type { Request, InventoryItem } from "../datamock/pharmacy-dashboard.mock";

type PharmacyTab = "home" | "requests" | "inventory" | "profile";

type Props = {
  onLogout?: () => void;
};

// ── Bottom navigation ─────────────────────────────────────────────────────────

function PharmacyNav({
  tab,
  pendingCount,
  onTab,
}: {
  tab: PharmacyTab;
  pendingCount: number;
  onTab: (t: PharmacyTab) => void;
}) {
  const tabs: { key: PharmacyTab; icon: any; label: string }[] = [
    { key: "home", icon: Home, label: "Accueil" },
    { key: "requests", icon: Inbox, label: "Demandes" },
    { key: "inventory", icon: Package, label: "Stock" },
    { key: "profile", icon: User, label: "Profil" },
  ];

  return (
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
                  style={{ color: active ? "#10B981" : "#9CA3AF" }}
                />
                {key === "requests" && pendingCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: "#EF4444", fontSize: "9px" }}
                  >
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
              </div>
              <span
                className="text-[10px] font-medium transition-colors"
                style={{ color: active ? "#10B981" : "#9CA3AF" }}
              >
                {label}
              </span>
              {active && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                  style={{ backgroundColor: "#10B981" }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function PharmacySidebarNav({
  tab,
  pendingCount,
  onTab,
  onLogout,
}: {
  tab: PharmacyTab;
  pendingCount: number;
  onTab: (t: PharmacyTab) => void;
  onLogout?: () => void;
}) {
  const tabs: { key: PharmacyTab; icon: any; label: string }[] = [
    { key: "home", icon: Home, label: "Accueil" },
    { key: "requests", icon: Inbox, label: "Demandes" },
    { key: "inventory", icon: Package, label: "Stock" },
    { key: "profile", icon: User, label: "Profil" },
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
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: "#10B981" }}
          >
            P
          </div>
          <div>
            <p className="font-bold text-base" style={{ color: "#10B981" }}>Pharmacie du Plateau</p>
            <p className="text-xs text-gray-400">Espace Pharmacie</p>
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
                backgroundColor: active ? "#F0FDF4" : "transparent",
                color: active ? "#10B981" : "#4B5563",
              }}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium flex-1">{label}</span>
              {key === "requests" && pendingCount > 0 && (
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                  style={{ backgroundColor: "#EF4444", fontSize: "10px" }}
                >
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
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

// ── Home tab ──────────────────────────────────────────────────────────────────

function PharmacyHomeTab({
  requests,
  inventory,
  onGoRequests,
  onGoInventory,
}: {
  requests: Request[];
  inventory: InventoryItem[];
  onGoRequests: () => void;
  onGoInventory: () => void;
}) {
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const lowStockCount = inventory.filter((i) => i.stock < i.minStock).length;
  const recentRequests = requests.slice(0, 3);

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Welcome card */}
      <div
        className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #10B981 0%, #3B82F6 100%)" }}
      >
        <div className="relative z-10">
          <p className="text-sm text-white/80">Bienvenue 👋</p>
          <h2 className="text-xl font-bold mt-0.5">Pharmacie du Plateau</h2>
          <p className="text-xs text-white/70 mt-1">23 Boulevard de la République, Plateau, Abidjan</p>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-2 h-2 rounded-full bg-white" />
            <span className="text-xs text-white/90">Ouverte</span>
          </div>
        </div>
        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute -right-2 top-10 w-14 h-14 rounded-full bg-white/10" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-2xl font-bold text-gray-900">127</p>
          <p className="text-xs text-gray-500 mt-0.5">Commandes (30j)</p>
        </div>
        <button
          onClick={onGoRequests}
          className="bg-white rounded-2xl p-4 border border-gray-100 text-left hover:border-green-200 transition"
        >
          <p
            className="text-2xl font-bold"
            style={{ color: pendingCount > 0 ? "#EF4444" : "#10B981" }}
          >
            {pendingCount}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">En attente</p>
        </button>
        <button
          onClick={onGoInventory}
          className="bg-white rounded-2xl p-4 border border-gray-100 text-left hover:border-green-200 transition"
        >
          <p
            className="text-2xl font-bold"
            style={{ color: lowStockCount > 0 ? "#F59E0B" : "#10B981" }}
          >
            {lowStockCount}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Stock faible</p>
        </button>
      </div>

      {/* Recent requests */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Demandes récentes
          </p>
          <button onClick={onGoRequests} className="text-xs text-green-600">
            Voir tout →
          </button>
        </div>
        {recentRequests.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-400">
            Aucune demande récente
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentRequests.map((r) => (
              <div key={r.id} className="px-4 py-3 flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor:
                      r.status === "pending" ? "#FEF3C7" : r.status === "confirmed" ? "#F0FDF4" : "#F3F4F6",
                  }}
                >
                  <Inbox
                    className="w-4 h-4"
                    style={{
                      color:
                        r.status === "pending" ? "#F59E0B" : r.status === "confirmed" ? "#10B981" : "#9CA3AF",
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{r.patientName}</p>
                  <p className="text-xs text-gray-500 truncate">{r.items.join(", ")}</p>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                  style={{
                    backgroundColor:
                      r.status === "pending" ? "#FEF3C7" : r.status === "confirmed" ? "#F0FDF4" : "#F3F4F6",
                    color:
                      r.status === "pending" ? "#D97706" : r.status === "confirmed" ? "#059669" : "#6B7280",
                  }}
                >
                  {r.status === "pending" ? "En attente" : r.status === "confirmed" ? "Confirmé" : r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick stats bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#F0FDF4" }}
            >
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Ventes du mois</p>
              <p className="text-xs text-gray-500">Tendance positive</p>
            </div>
          </div>
          <p className="text-lg font-bold" style={{ color: "#10B981" }}>
            +12%
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Profile tab ───────────────────────────────────────────────────────────────

function PharmacyProfileTab({ onLogout }: { onLogout?: () => void }) {
  return (
    <div className="px-4 py-4 space-y-4 pb-6">
      {/* Pharmacy card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0"
            style={{ backgroundColor: "#10B981" }}
          >
            E
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900">Pharmacie du Plateau</p>
            <p className="text-xs text-gray-500 mt-0.5">23 Boulevard de la République, Plateau, Abidjan</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 text-yellow-400" fill="#FBBF24" />
              <span className="text-xs text-gray-600">4.8 · 127 commandes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Informations
          </p>
        </div>
        <div className="divide-y divide-gray-50">
          <div className="flex items-center gap-3 px-4 py-3">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-sm text-gray-800">23 Boulevard de la République, Plateau, Abidjan</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <Phone className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-sm text-gray-800">+225 27 22 45 67 89</span>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {[
          { icon: Settings, label: "Paramètres de la pharmacie" },
          { icon: Shield, label: "Confidentialité & données" },
          { icon: HelpCircle, label: "Aide & support" },
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 border-gray-50 text-left"
          >
            <div className="flex items-center gap-3">
              <Icon className="w-4 h-4 text-gray-400" />
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

// ── Main component ────────────────────────────────────────────────────────────

export function PharmacyDashboard({ onLogout }: Props) {
  const [tab, setTab] = useState<PharmacyTab>("home");
  const [requests, setRequests] = useState<Request[]>(mockRequests);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="flex-1 flex overflow-hidden" style={{ backgroundColor: "#F3F4F6" }}>
      {/* Desktop sidebar */}
      <PharmacySidebarNav tab={tab} pendingCount={pendingCount} onTab={setTab} onLogout={onLogout} />

      {/* Main content column */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      {/* Header — mobile/tablet only */}
      <header className="shrink-0 bg-white border-b border-gray-200 lg:hidden">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: "#10B981" }}
            >
              E
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Pharmacie du Plateau</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#10B981" }} />
                <span className="text-xs" style={{ color: "#10B981" }}>Ouverte</span>
              </div>
            </div>
          </div>
          {onLogout && (
            <button onClick={onLogout} className="p-2 rounded-full hover:bg-gray-100" title="Déconnexion">
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
      </header>

      {/* Desktop topbar */}
      <header className="hidden lg:flex shrink-0 bg-white border-b border-gray-200 items-center justify-between px-6 py-3">
        <h1 className="font-bold text-gray-900 text-lg">
          {tab === "home" && "Tableau de bord"}
          {tab === "requests" && "Demandes patients"}
          {tab === "inventory" && "Gestion du stock"}
          {tab === "profile" && "Profil pharmacie"}
        </h1>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#10B981" }} />
          <span className="text-sm text-gray-500">Pharmacie du Plateau · Ouverte</span>
        </div>
      </header>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {tab === "home" && (
          <PharmacyHomeTab
            requests={requests}
            inventory={inventory}
            onGoRequests={() => setTab("requests")}
            onGoInventory={() => setTab("inventory")}
          />
        )}
        {tab === "requests" && (
          <div className="px-4 py-4">
            <RequestList requests={requests} onUpdate={setRequests} />
          </div>
        )}
        {tab === "inventory" && (
          <div className="px-4 py-4">
            <InventoryPanel inventory={inventory} onUpdate={setInventory} />
          </div>
        )}
        {tab === "profile" && <PharmacyProfileTab onLogout={onLogout} />}
      </div>

      {/* Bottom navigation */}
      <PharmacyNav tab={tab} pendingCount={pendingCount} onTab={setTab} />
      </div>{/* end main content column */}
    </div>
  );
}
