import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import logoSrc from "../assets/img/logo.jpeg";
import { adminApi, session } from "../lib/api";

const BLUE      = "#1A3072";
const BLUE_DARK = "#122660";

type Props = { onLogin: (userId: string) => void };

export function AdminLoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputCls = "w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm focus:outline-none focus:bg-white transition";
  const focusStyle = (e: React.FocusEvent<HTMLElement>) => { (e.target as HTMLElement).style.borderColor = BLUE; };
  const blurStyle  = (e: React.FocusEvent<HTMLElement>) => { (e.target as HTMLElement).style.borderColor = "#E5E7EB"; };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.login(email, password);
      session.setToken("no-auth");
      session.setUserId(res.id);
      session.setRole("admin");
      onLogin(res.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <div className="flex flex-col items-center pt-14 pb-6">
        <img src={logoSrc} alt="Digie-Pharma" className="w-28 h-28 object-contain" />
        <div className="flex items-center gap-2 mt-3">
          <ShieldCheck className="w-5 h-5" style={{ color: BLUE }} />
          <span className="text-sm font-bold uppercase tracking-widest" style={{ color: BLUE }}>
            Administration
          </span>
        </div>
      </div>

      <div className="flex-1 px-6 pt-4">
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: BLUE }}>
              Email administrateur
            </label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className={inputCls} onFocus={focusStyle} onBlur={blurStyle}
              placeholder="admin@digie-pharma.ci" required autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: BLUE }}>
              Mot de passe
            </label>
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className={inputCls} onFocus={focusStyle} onBlur={blurStyle}
              placeholder="••••••••" required
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2.5 text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-2xl text-white font-semibold text-base mt-2 transition active:scale-[0.98] disabled:opacity-60"
            style={{
              background: `linear-gradient(90deg, ${BLUE_DARK}, ${BLUE})`,
              boxShadow: `0 4px 16px ${BLUE}50`,
            }}
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
