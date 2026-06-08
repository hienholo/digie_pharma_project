import { Bell, MapPin, User, LogOut } from "lucide-react";

type Props = {
  onNav: (page: string) => void;
  current: string;
  onLogout?: () => void;
};

export function Header({ onNav, current, onLogout }: Props) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => onNav("home")}
          className="flex items-center gap-2"
        >
          <div
            className="w-9 h-9 rounded-2xl flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: "#1A3072" }}
          >
            DP
          </div>
          <span className="font-bold" style={{ color: "#1A3072" }}>Digie-Pharma</span>
        </button>

        <nav className="hidden md:flex items-center gap-6 text-gray-600">
          <button
            onClick={() => onNav("home")}
            className={current === "home" ? "text-gray-900" : ""}
          >
            Accueil
          </button>
          <button
            onClick={() => onNav("pharmacies")}
            className={current === "pharmacies" ? "text-gray-900" : ""}
          >
            Pharmacies
          </button>
          <button
            onClick={() => onNav("orders")}
            className={current === "orders" ? "text-gray-900" : ""}
          >
            Mes commandes
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 text-gray-600 text-sm">
            <MapPin className="w-4 h-4" style={{ color: "#10B981" }} />
            <span className="hidden sm:inline">Abidjan</span>
          </button>
          <button className="relative p-2 rounded-full hover:bg-gray-100">
            <Bell className="w-5 h-5 text-gray-700" />
            <span
              className="absolute top-1 right-1 w-2 h-2 rounded-full"
              style={{ backgroundColor: "#10B981" }}
            />
          </button>
          <button
            onClick={() => onNav("account")}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <User className="w-5 h-5 text-gray-700" />
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="ml-2 p-2 rounded-full hover:bg-gray-100"
              title="Déconnexion"
            >
              <LogOut className="w-5 h-5 text-gray-700" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
