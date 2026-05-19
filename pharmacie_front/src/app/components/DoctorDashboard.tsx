import { useState } from "react";
import {
  LogOut,
  Users,
  Calendar,
  FileText,
  Plus,
  ChevronRight,
  Home,
  Menu,
  X,
  Bell,
  User,
  Settings,
  HelpCircle,
} from "lucide-react";
import { Header } from "./Header";
import { DoctorPatientsList } from "./DoctorPatientsList";
import { DoctorAppointments } from "./DoctorAppointments";
import { DoctorPrescriptionForm } from "./DoctorPrescriptionForm";

type DoctorView = "home" | "patients" | "appointments" | "prescription";

interface Props {
  onLogout: () => void;
}

export function DoctorDashboard({ onLogout }: Props) {
  const [currentView, setCurrentView] = useState<DoctorView>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications] = useState([
    { id: "1", type: "appointment", message: "Nouveau RDV demandé par Jean Dupont", time: "il y a 2h" },
    { id: "2", type: "message", message: "Ordonnance renouvelée pour Marie Martin", time: "il y a 5h" },
  ]);

  const quickStats = [
    { label: "Patients", value: "24", icon: Users, color: "#DC2626" },
    { label: "RDV aujourd'hui", value: "5", icon: Calendar, color: "#2563EB" },
    { label: "Ordonnances", value: "12", icon: FileText, color: "#10B981" },
  ];

  let content;
  switch (currentView) {
    case "patients":
      content = <DoctorPatientsList />;
      break;
    case "appointments":
      content = <DoctorAppointments />;
      break;
    case "prescription":
      content = <DoctorPrescriptionForm onClose={() => setCurrentView("home")} />;
      break;
    default:
      content = (
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 md:p-6">
            {quickStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center gap-4"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: stat.color + "18" }}
                >
                  <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="px-4 md:px-6 py-4">
            <h3 className="font-semibold text-gray-900 mb-4">Actions rapides</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => setCurrentView("appointments")}
                className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md transition text-left"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#2563EB18" }}
                >
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Gérer RDV</p>
                  <p className="text-xs text-gray-500">Voir et confirmer</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => setCurrentView("patients")}
                className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md transition text-left"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#DC262618" }}
                >
                  <Users className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Mes patients</p>
                  <p className="text-xs text-gray-500">Voir la liste</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => setCurrentView("prescription")}
                className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md transition text-left"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#10B98118" }}
                >
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Nouvelle ordonnance</p>
                  <p className="text-xs text-gray-500">Créer et envoyer</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md transition text-left">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: "#F5940B18" }}
                >
                  <Bell className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Notifications</p>
                  <p className="text-xs text-gray-500">{notifications.length} nouveau(x)</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="px-4 md:px-6 py-4">
            <h3 className="font-semibold text-gray-900 mb-4">Notifications récentes</h3>
            <div className="space-y-2">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="bg-white rounded-2xl p-4 border border-gray-100 flex items-start gap-3"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "#DC262618" }}
                  >
                    <Bell className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
  }

  return (
    <div className="flex-1 flex overflow-hidden" style={{ backgroundColor: "#F3F4F6" }}>
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-gray-100 flex-col">
        {/* Logo */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 font-bold text-lg text-red-600">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
              +
            </div>
            LAHFIA
          </div>
          <p className="text-xs text-gray-500 mt-1">Médecin</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavItem
            icon={Home}
            label="Tableau de bord"
            active={currentView === "home"}
            onClick={() => setCurrentView("home")}
          />
          <NavItem
            icon={Users}
            label="Mes patients"
            active={currentView === "patients"}
            onClick={() => setCurrentView("patients")}
          />
          <NavItem
            icon={Calendar}
            label="Rendez-vous"
            active={currentView === "appointments"}
            onClick={() => setCurrentView("appointments")}
            badge="5"
          />
          <NavItem
            icon={FileText}
            label="Ordonnances"
            active={currentView === "prescription"}
            onClick={() => setCurrentView("prescription")}
          />
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-100 space-y-2">
          <NavItem icon={Settings} label="Paramètres" />
          <NavItem icon={HelpCircle} label="Aide" />
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden">
          <aside className="w-64 bg-white h-full flex flex-col">
            <div className="px-4 py-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-2 font-bold text-red-600">
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">
                  +
                </div>
                LAHFIA
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
              <NavItem
                icon={Home}
                label="Tableau de bord"
                active={currentView === "home"}
                onClick={() => {
                  setCurrentView("home");
                  setSidebarOpen(false);
                }}
              />
              <NavItem
                icon={Users}
                label="Mes patients"
                active={currentView === "patients"}
                onClick={() => {
                  setCurrentView("patients");
                  setSidebarOpen(false);
                }}
              />
              <NavItem
                icon={Calendar}
                label="Rendez-vous"
                active={currentView === "appointments"}
                onClick={() => {
                  setCurrentView("appointments");
                  setSidebarOpen(false);
                }}
                badge="5"
              />
              <NavItem
                icon={FileText}
                label="Ordonnances"
                active={currentView === "prescription"}
                onClick={() => {
                  setCurrentView("prescription");
                  setSidebarOpen(false);
                }}
              />
            </nav>

            <div className="px-4 py-4 border-t border-gray-100 space-y-2">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition"
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {currentView === "patients" && "Mes Patients"}
                {currentView === "appointments" && "Rendez-vous"}
                {currentView === "prescription" && "Nouvelle Ordonnance"}
                {currentView === "home" && "Tableau de Bord"}
              </h1>
            </div>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <User className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          {content}
        </div>
      </div>
    </div>
  );
}

interface NavItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  onClick?: () => void;
  badge?: string;
}

function NavItem({ icon: Icon, label, active, onClick, badge }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
        active ? "bg-red-50 text-red-600" : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="flex-1 text-left">{label}</span>
      {badge ? (
        <span className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
          {badge}
        </span>
      ) : (
        <span className="w-8"></span>
      )}
    </button>
  );
}
