import { useState, useEffect } from "react";
import {
  LogOut, Users, Calendar, FileText, Plus, ChevronRight,
  Home, Menu, X, Bell, User, Settings, HelpCircle,
} from "lucide-react";
import type { MedecinAPI, PatientAPI, OrdonnanceNumeriqueAPI } from "../lib/types";
import { session } from "../lib/api";
import { medecinsApi, patientsApi, ordonnancesNumeriquesApi } from "../lib/api";
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
  const [medecin, setMedecin] = useState<MedecinAPI | null>(null);
  const [patients, setPatients] = useState<PatientAPI[]>([]);
  const [ordonnances, setOrdonnances] = useState<OrdonnanceNumeriqueAPI[]>([]);
  const [loading, setLoading] = useState(true);

  const medecinId = session.getUserId();

  useEffect(() => {
    if (!medecinId) return;
    Promise.all([
      medecinsApi.getById(medecinId),
      patientsApi.findAll(),
      ordonnancesNumeriquesApi.getByMedecin(medecinId),
    ]).then(([m, p, o]) => {
      setMedecin(m);
      setPatients(p);
      setOrdonnances(o);
    }).catch(console.error).finally(() => setLoading(false));
  }, [medecinId]);

  const quickStats = [
    { label: "Patients", value: loading ? "…" : String(patients.length), icon: Users, color: "#DC2626" },
    { label: "Ordonnances", value: loading ? "…" : String(ordonnances.length), icon: FileText, color: "#10B981" },
  ];

  let content;
  switch (currentView) {
    case "patients":
      content = <DoctorPatientsList patients={patients} loading={loading} />;
      break;
    case "appointments":
      content = <DoctorAppointments />;
      break;
    case "prescription":
      content = (
        <DoctorPrescriptionForm
          medecinId={medecinId}
          patients={patients}
          onClose={() => setCurrentView("home")}
          onCreated={(o) => setOrdonnances((prev) => [o, ...prev])}
        />
      );
      break;
    default:
      content = (
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Profil médecin */}
          {medecin && (
            <div className="mx-4 md:mx-6 mt-4 bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg">
                {medecin.prenom.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">Dr. {medecin.prenom} {medecin.nom}</p>
                <p className="text-xs text-gray-500">{medecin.specialite} — {medecin.statut === "ACTIF" ? "Actif" : medecin.statut === "SUSPENDU" ? "Suspendu" : "En attente de validation"}</p>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 p-4 md:p-6">
            {quickStats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-6 border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.color + "18" }}>
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
          <div className="px-4 md:px-6 pb-4">
            <h3 className="font-semibold text-gray-900 mb-4">Actions rapides</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button onClick={() => setCurrentView("appointments")} className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md transition text-left">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#2563EB18" }}>
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Gérer RDV</p>
                  <p className="text-xs text-gray-500">Voir et confirmer</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button onClick={() => setCurrentView("patients")} className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md transition text-left">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#DC262618" }}>
                  <Users className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Mes patients</p>
                  <p className="text-xs text-gray-500">{patients.length} enregistrés</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button onClick={() => setCurrentView("prescription")} className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md transition text-left">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#10B98118" }}>
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Nouvelle ordonnance</p>
                  <p className="text-xs text-gray-500">Créer et envoyer</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>

              <button onClick={() => setCurrentView("appointments")} className="flex items-center gap-3 bg-white rounded-2xl p-4 border border-gray-100 hover:shadow-md transition text-left">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#F5940B18" }}>
                  <Plus className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Nouveau RDV</p>
                  <p className="text-xs text-gray-500">Planifier</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Dernières ordonnances */}
          {ordonnances.length > 0 && (
            <div className="px-4 md:px-6 pb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Dernières ordonnances</h3>
              <div className="space-y-2">
                {ordonnances.slice(0, 3).map((o) => (
                  <div key={o.id} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">
                        {o.lignes.length} médicament{o.lignes.length > 1 ? "s" : ""}
                        {o.lignes[0] ? ` — ${o.lignes[0].medicament.nomCommercial}` : ""}
                        {o.lignes.length > 1 ? "…" : ""}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{new Date(o.createdAt).toLocaleDateString("fr-FR")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
  }

  return (
    <div className="flex-1 flex overflow-hidden" style={{ backgroundColor: "#F3F4F6" }}>
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-gray-100 flex-col">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 font-bold text-lg text-red-600">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">+</div>
            LAHFIA
          </div>
          <p className="text-xs text-gray-500 mt-1">Médecin</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavItem icon={Home} label="Tableau de bord" active={currentView === "home"} onClick={() => setCurrentView("home")} />
          <NavItem icon={Users} label="Mes patients" active={currentView === "patients"} onClick={() => setCurrentView("patients")} />
          <NavItem icon={Calendar} label="Rendez-vous" active={currentView === "appointments"} onClick={() => setCurrentView("appointments")} />
          <NavItem icon={FileText} label="Ordonnances" active={currentView === "prescription"} onClick={() => setCurrentView("prescription")} />
        </nav>

        <div className="px-4 py-4 border-t border-gray-100 space-y-2">
          <NavItem icon={Settings} label="Paramètres" />
          <NavItem icon={HelpCircle} label="Aide" />
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition">
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
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white">+</div>
                LAHFIA
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
              {(["home", "patients", "appointments", "prescription"] as DoctorView[]).map((view) => {
                const cfg = {
                  home: { icon: Home, label: "Tableau de bord" },
                  patients: { icon: Users, label: "Mes patients" },
                  appointments: { icon: Calendar, label: "Rendez-vous" },
                  prescription: { icon: FileText, label: "Ordonnances" },
                }[view];
                return (
                  <NavItem key={view} icon={cfg.icon} label={cfg.label} active={currentView === view}
                    onClick={() => { setCurrentView(view); setSidebarOpen(false); }} />
                );
              })}
            </nav>

            <div className="px-4 py-4 border-t border-gray-100">
              <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition">
                <LogOut className="w-5 h-5" />
                Déconnexion
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-100 px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">
              {currentView === "patients" && "Mes Patients"}
              {currentView === "appointments" && "Rendez-vous"}
              {currentView === "prescription" && "Nouvelle Ordonnance"}
              {currentView === "home" && "Tableau de Bord"}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <User className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

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
    <button onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
        active ? "bg-red-50 text-red-600" : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <span className="bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full">{badge}</span>
      )}
    </button>
  );
}
