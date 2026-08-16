import { useState } from "react";
import { PatientSpace } from "./components/PatientSpace";
import { PharmacyDashboard } from "./components/PharmacyDashboard";
import { DeliveryDashboard } from "./components/DeliveryDashboard";
import { DoctorDashboard } from "./components/DoctorDashboard";
import { LoginPage } from "./components/LoginPage";
import { AdminLoginPage } from "./components/AdminLoginPage";
import { AdminDashboard } from "./components/AdminDashboard";
import { session } from "./lib/api";

type UserRole = "patient" | "pharmacy" | "delivery" | "doctor";

const VALID_ROLES: UserRole[] = ["patient", "pharmacy", "delivery", "doctor"];

function getStoredRole(): UserRole | null {
  const role = session.getRole();
  return (VALID_ROLES as string[]).includes(role) ? (role as UserRole) : null;
}

// Accès admin caché : uniquement via /admin, jamais affiché parmi les rôles publics.
function isAdminRoute(): boolean {
  return window.location.pathname.startsWith("/admin");
}

export default function App() {
  // Restaure la session depuis le localStorage : évite d'être renvoyé au login à chaque F5.
  const [userRole, setUserRole] = useState<UserRole | null>(() => getStoredRole());
  const [userId, setUserId] = useState<string>(() => (getStoredRole() ? session.getUserId() : ""));
  const [adminId, setAdminId] = useState<string>(() => (session.getRole() === "admin" ? session.getUserId() : ""));

  const handleLogin = (role: UserRole, id: string) => {
    setUserRole(role);
    setUserId(id);
  };

  const handleLogout = () => {
    session.clear();
    setUserRole(null);
    setUserId("");
  };

  const handleAdminLogout = () => {
    session.clear();
    setAdminId("");
  };

  if (isAdminRoute()) {
    if (!adminId) {
      return (
        <div className="min-h-screen flex justify-center" style={{ backgroundColor: "#FFFFFF" }}>
          <div
            className="w-full flex flex-col overflow-hidden"
            style={{ maxWidth: "clamp(480px, 50vw, 620px)", minHeight: "100dvh", backgroundColor: "#FFFFFF" }}
          >
            <AdminLoginPage onLogin={setAdminId} />
          </div>
        </div>
      );
    }
    return <AdminDashboard onLogout={handleAdminLogout} />;
  }

  let content;
  if (!userRole) {
    content = <LoginPage onLogin={handleLogin} />;
  } else if (userRole === "pharmacy") {
    content = <PharmacyDashboard onLogout={handleLogout} />;
  } else if (userRole === "delivery") {
    content = <DeliveryDashboard onLogout={handleLogout} />;
  } else if (userRole === "doctor") {
    content = <DoctorDashboard onLogout={handleLogout} />;
  } else {
    content = <PatientSpace userId={userId} onLogout={handleLogout} />;
  }

  // Pages de connexion : carte centrée étroite
  if (!userRole) {
    return (
      <div className="min-h-screen flex justify-center" style={{ backgroundColor: "#FFFFFF" }}>
        <div
          className="w-full flex flex-col overflow-hidden"
          style={{
            maxWidth: "clamp(480px, 50vw, 620px)",
            minHeight: "100dvh",
            backgroundColor: "#FFFFFF",
          }}
        >
          {content}
        </div>
      </div>
    );
  }

  // Espaces utilisateurs : plein écran comme à l'origine
  return (
    <div className="min-h-screen lg:flex lg:justify-center" style={{ backgroundColor: "#FFFFFF" }}>
      {/* Mobile/tablette */}
      <div className="lg:hidden flex justify-center min-h-screen">
        <div
          className="w-full max-w-[600px] flex flex-col overflow-hidden"
          style={{ minHeight: "100dvh", backgroundColor: "#F3F4F6" }}
        >
          {content}
        </div>
      </div>
      {/* Desktop : pleine largeur */}
      <div
        className="hidden lg:flex w-full max-w-[1440px] overflow-hidden"
        style={{ minHeight: "100dvh", backgroundColor: "#F3F4F6" }}
      >
        {content}
      </div>
    </div>
  );
}
