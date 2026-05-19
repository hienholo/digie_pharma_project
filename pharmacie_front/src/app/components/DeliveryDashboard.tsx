import { useState } from "react";
import {
  Package, MapPin, Clock, CheckCircle, Navigation, LogOut,
  Home, User, Truck, History, ChevronRight, Settings, HelpCircle,
  Shield, Star,
} from "lucide-react";
import { mockDeliveries } from "../datamock/delivery.mock";
import type { Delivery } from "../datamock/delivery.mock";

type DeliveryTab = "home" | "deliveries" | "map" | "profile";

type Props = {
  onLogout?: () => void;
};

// ── Bottom navigation ─────────────────────────────────────────────────────────

function DeliveryNav({
  tab,
  activeCount,
  onTab,
}: {
  tab: DeliveryTab;
  activeCount: number;
  onTab: (t: DeliveryTab) => void;
}) {
  const tabs: { key: DeliveryTab; icon: any; label: string }[] = [
    { key: "home", icon: Home, label: "Accueil" },
    { key: "deliveries", icon: Truck, label: "Livraisons" },
    { key: "map", icon: MapPin, label: "Carte" },
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
                  style={{ color: active ? "#F59E0B" : "#9CA3AF" }}
                />
                {key === "deliveries" && activeCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: "#EF4444", fontSize: "9px" }}
                  >
                    {activeCount > 9 ? "9+" : activeCount}
                  </span>
                )}
              </div>
              <span
                className="text-[10px] font-medium transition-colors"
                style={{ color: active ? "#F59E0B" : "#9CA3AF" }}
              >
                {label}
              </span>
              {active && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                  style={{ backgroundColor: "#F59E0B" }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function DeliverySidebarNav({
  tab,
  activeCount,
  onTab,
  onLogout,
}: {
  tab: DeliveryTab;
  activeCount: number;
  onTab: (t: DeliveryTab) => void;
  onLogout?: () => void;
}) {
  const tabs: { key: DeliveryTab; icon: any; label: string }[] = [
    { key: "home", icon: Home, label: "Accueil" },
    { key: "deliveries", icon: Truck, label: "Livraisons" },
    { key: "map", icon: MapPin, label: "Carte" },
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
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white"
            style={{ backgroundColor: "#F59E0B" }}
          >
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-base" style={{ color: "#D97706" }}>Livreur</p>
            <p className="text-xs text-gray-400">Espace Livraison</p>
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
                backgroundColor: active ? "#FFFBEB" : "transparent",
                color: active ? "#D97706" : "#4B5563",
              }}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium flex-1">{label}</span>
              {key === "deliveries" && activeCount > 0 && (
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                  style={{ backgroundColor: "#EF4444", fontSize: "10px" }}
                >
                  {activeCount > 9 ? "9+" : activeCount}
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

// ── Helper functions ──────────────────────────────────────────────────────────

function getStatusColor(status: Delivery["status"]) {
  switch (status) {
    case "assigned": return "#F59E0B";
    case "picked-up": return "#3B82F6";
    case "delivering": return "#8B5CF6";
    case "delivered": return "#10B981";
  }
}

function getStatusLabel(status: Delivery["status"]) {
  switch (status) {
    case "assigned": return "Assignée";
    case "picked-up": return "Récupérée";
    case "delivering": return "En cours";
    case "delivered": return "Livrée";
  }
}

function getNextStatus(status: Delivery["status"]): Delivery["status"] | null {
  switch (status) {
    case "assigned": return "picked-up";
    case "picked-up": return "delivering";
    case "delivering": return "delivered";
    default: return null;
  }
}

function getNextActionLabel(status: Delivery["status"]) {
  switch (status) {
    case "assigned": return "Récupérer à la pharmacie";
    case "picked-up": return "Commencer la livraison";
    case "delivering": return "Marquer comme livrée";
    default: return "";
  }
}

// ── Home tab ──────────────────────────────────────────────────────────────────

function DeliveryHomeTab({
  deliveries,
  onGoDeliveries,
}: {
  deliveries: Delivery[];
  onGoDeliveries: () => void;
}) {
  const activeCount = deliveries.filter((d) => d.status !== "delivered").length;
  const completedCount = deliveries.filter((d) => d.status === "delivered").length + 45;

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Welcome card */}
      <div
        className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)" }}
      >
        <div className="relative z-10">
          <p className="text-sm text-white/80">Bonjour 👋</p>
          <h2 className="text-xl font-bold mt-0.5">Espace Livreur</h2>
          <p className="text-xs text-white/70 mt-1">LAHFIA Livraison · Disponible</p>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-2 h-2 rounded-full bg-white" />
            <span className="text-xs text-white/90">En ligne</span>
          </div>
        </div>
        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
        <div className="absolute -right-2 top-10 w-14 h-14 rounded-full bg-white/10" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onGoDeliveries}
          className="bg-white rounded-2xl p-4 border border-gray-100 text-left hover:border-amber-200 transition"
        >
          <p
            className="text-2xl font-bold"
            style={{ color: activeCount > 0 ? "#F59E0B" : "#10B981" }}
          >
            {activeCount}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">En cours</p>
        </button>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-2xl font-bold" style={{ color: "#10B981" }}>
            {completedCount}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Livrées (30j)</p>
        </div>
      </div>

      {/* Active deliveries preview */}
      {activeCount > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Livraisons actives
            </p>
            <button onClick={onGoDeliveries} className="text-xs text-amber-600">
              Voir tout →
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {deliveries
              .filter((d) => d.status !== "delivered")
              .slice(0, 2)
              .map((d) => (
                <div key={d.id} className="px-4 py-3 flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: getStatusColor(d.status) + "20" }}
                  >
                    <Navigation
                      className="w-4 h-4"
                      style={{ color: getStatusColor(d.status) }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {d.customerName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{d.customerAddress}</p>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium text-white shrink-0"
                    style={{ backgroundColor: getStatusColor(d.status) }}
                  >
                    {getStatusLabel(d.status)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Earnings summary */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#FFFBEB" }}
            >
              <Star className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Note moyenne</p>
              <p className="text-xs text-gray-500">Basé sur 127 livraisons</p>
            </div>
          </div>
          <p className="text-lg font-bold text-amber-500">4.9 ★</p>
        </div>
      </div>
    </div>
  );
}

// ── Deliveries tab ────────────────────────────────────────────────────────────

function DeliveriesTab({
  deliveries,
  onUpdateStatus,
}: {
  deliveries: Delivery[];
  onUpdateStatus: (id: string, status: Delivery["status"]) => void;
}) {
  const activeDeliveries = deliveries.filter((d) => d.status !== "delivered");

  return (
    <div className="px-4 py-4 space-y-3">
      {activeDeliveries.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
          <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Aucune livraison en cours</p>
        </div>
      ) : (
        activeDeliveries.map((delivery) => {
          const nextStatus = getNextStatus(delivery.status);
          return (
            <div
              key={delivery.id}
              className="bg-white rounded-2xl p-4 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-500">Commande #{delivery.orderId}</p>
                  <p className="text-gray-900 font-medium mt-0.5">{delivery.customerName}</p>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-xs text-white font-medium"
                  style={{ backgroundColor: getStatusColor(delivery.status) }}
                >
                  {getStatusLabel(delivery.status)}
                </span>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-start gap-2 text-sm">
                  <Package className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    {delivery.items.map((item, i) => (
                      <div key={i} className="text-gray-700">• {item}</div>
                    ))}
                  </div>
                </div>
                <div className="pl-6 space-y-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#10B981" }} />
                    <span className="text-gray-900">{delivery.pharmacy}</span>
                  </div>
                  <p className="text-xs text-gray-500 ml-4">{delivery.pharmacyAddress}</p>
                </div>
                <div className="pl-6 space-y-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{delivery.customerAddress}</span>
                  </div>
                </div>
              </div>

              {nextStatus && (
                <button
                  onClick={() => onUpdateStatus(delivery.id, nextStatus)}
                  className="w-full py-2.5 rounded-xl text-white text-sm font-medium"
                  style={{ backgroundColor: getStatusColor(nextStatus) }}
                >
                  {getNextActionLabel(delivery.status)}
                </button>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

// ── Map tab (placeholder) ─────────────────────────────────────────────────────

function MapTab() {
  return (
    <div className="px-4 py-4 space-y-4">
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{ height: 300 }}
      >
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)" }}
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ backgroundColor: "#FEF3C7" }}>
            <MapPin className="w-8 h-8 text-amber-500" />
          </div>
          <p className="font-semibold text-gray-700">Carte en temps réel</p>
          <p className="text-sm text-gray-400 mt-1 text-center px-6">
            La carte GPS sera disponible dans la prochaine version
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <Navigation className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Position actuelle</p>
            <p className="text-xs text-gray-500">Abidjan, Côte d'Ivoire</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-600">Actif</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Profile tab ───────────────────────────────────────────────────────────────

function DeliveryProfileTab({ onLogout }: { onLogout?: () => void }) {
  return (
    <div className="px-4 py-4 space-y-4 pb-6">
      {/* Livreur card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0"
            style={{ backgroundColor: "#F59E0B" }}
          >
            M
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900">Mohamed Aissani</p>
            <p className="text-xs text-gray-500 mt-0.5">Livreur LAHFIA</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 text-yellow-400" fill="#FBBF24" />
              <span className="text-xs text-gray-600">4.9 · 127 livraisons</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
          <p className="text-2xl font-bold" style={{ color: "#F59E0B" }}>127</p>
          <p className="text-xs text-gray-500 mt-0.5">Livraisons totales</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
          <p className="text-2xl font-bold" style={{ color: "#10B981" }}>4.9</p>
          <p className="text-xs text-gray-500 mt-0.5">Note moyenne</p>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {[
          { icon: History, label: "Historique des livraisons" },
          { icon: Settings, label: "Paramètres du compte" },
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

export function DeliveryDashboard({ onLogout }: Props) {
  const [tab, setTab] = useState<DeliveryTab>("home");
  const [deliveries, setDeliveries] = useState<Delivery[]>(mockDeliveries);

  const updateStatus = (id: string, status: Delivery["status"]) => {
    setDeliveries((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
  };

  const activeCount = deliveries.filter((d) => d.status !== "delivered").length;

  return (
    <div className="flex-1 flex overflow-hidden" style={{ backgroundColor: "#F3F4F6" }}>
      {/* Desktop sidebar */}
      <DeliverySidebarNav tab={tab} activeCount={activeCount} onTab={setTab} onLogout={onLogout} />

      {/* Main content column */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      {/* Header — mobile/tablet only */}
      <header className="shrink-0 bg-white border-b border-gray-200 lg:hidden">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center text-white"
              style={{ backgroundColor: "#F59E0B" }}
            >
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
          {tab === "deliveries" && "Mes livraisons"}
          {tab === "map" && "Carte des livraisons"}
          {tab === "profile" && "Mon profil"}
        </h1>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-sm text-gray-500">Disponible</span>
        </div>
      </header>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {tab === "home" && (
          <DeliveryHomeTab
            deliveries={deliveries}
            onGoDeliveries={() => setTab("deliveries")}
          />
        )}
        {tab === "deliveries" && (
          <DeliveriesTab deliveries={deliveries} onUpdateStatus={updateStatus} />
        )}
        {tab === "map" && <MapTab />}
        {tab === "profile" && <DeliveryProfileTab onLogout={onLogout} />}
      </div>

      {/* Bottom navigation */}
      <DeliveryNav tab={tab} activeCount={activeCount} onTab={setTab} />
      </div>{/* end main content column */}
    </div>
  );
}
