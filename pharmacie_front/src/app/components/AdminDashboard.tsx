import { useCallback, useEffect, useState } from "react";
import {
  ShieldCheck, LogOut, Users, Building2, Bike, Stethoscope,
  Trash2, CheckCircle2, Ban, RefreshCw, AlertTriangle,
  Menu, X, ClipboardList, ShoppingBag, Truck,
} from "lucide-react";
import { adminApi, patientsApi, pharmaciesApi, livreursApi, medecinsApi } from "../lib/api";
import type { AdminStatsAPI, PatientAPI, PharmacieAPI, LivreurAPI, MedecinAPI } from "../lib/types";

const BLUE   = "#1A3072";
const GREEN  = "#059669";
const ORANGE = "#F47920";
const PURPLE = "#7C3AED";
const RED    = "#DC2626";
const GRAY   = "#6B7280";

type Tab = "patients" | "pharmacies" | "livreurs" | "medecins";
type Props = { onLogout: () => void };

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function initials(a?: string, b?: string) {
  const x = (a?.[0] ?? "").toUpperCase();
  const y = (b?.[0] ?? "").toUpperCase();
  return (x + y) || "?";
}

function Avatar({ label, color }: { label: string; color: string }) {
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
      style={{ backgroundColor: color + "1E", color }}
    >
      {label}
    </div>
  );
}

function StatutBadge({ statut }: { statut: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    ACTIF:                 { label: "Actif",      color: GREEN,  bg: "#ECFDF5" },
    EN_ATTENTE_VALIDATION: { label: "En attente",  color: ORANGE, bg: "#FFF3E6" },
    SUSPENDU:              { label: "Suspendu",    color: RED,    bg: "#FEF2F2" },
  };
  const s = map[statut] ?? { label: statut, color: GRAY, bg: "#F3F4F6" };
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ color: s.color, backgroundColor: s.bg }}>
      {s.label}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: typeof Users; label: string; value: number | string; sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3.5 md:p-4 shadow-sm flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + "18" }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide truncate">{label}</p>
        <p className="text-xl font-extrabold mt-0.5 leading-none" style={{ color: BLUE }}>{value}</p>
        {sub && <p className="text-[11px] text-gray-400 mt-1 leading-snug">{sub}</p>}
      </div>
    </div>
  );
}

const TABS: { key: Tab; label: string; icon: typeof Users; color: string }[] = [
  { key: "patients",   label: "Patients",   icon: Users,       color: BLUE },
  { key: "pharmacies", label: "Pharmacies", icon: Building2,   color: GREEN },
  { key: "livreurs",   label: "Livreurs",   icon: Bike,        color: ORANGE },
  { key: "medecins",   label: "Médecins",   icon: Stethoscope, color: PURPLE },
];

// ── Ligne générique table desktop / carte mobile ─────────────────────────────

type EntityRow = {
  id: string;
  avatarLabel: string;
  avatarColor: string;
  title: string;
  subtitle?: string;
  fields: { label: string; value: React.ReactNode }[];
  actions: React.ReactNode;
};

function NavItem({ icon: Icon, label, active, color, onClick }: {
  icon: typeof Users; label: string; active?: boolean; color: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
        active ? "text-white" : "text-gray-700 hover:bg-gray-50"
      }`}
      style={active ? { backgroundColor: color } : {}}
    >
      <Icon className="w-5 h-5" />
      <span className="flex-1 text-left">{label}</span>
    </button>
  );
}

function EntityList({ rows, loading, emptyLabel }: { rows: EntityRow[]; loading: boolean; emptyLabel: string }) {
  const thCls = "text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3 whitespace-nowrap";
  const tdCls = "px-4 py-3 text-sm text-gray-700 align-middle";

  if (loading) {
    return <div className="py-16 text-center text-sm text-gray-400">Chargement…</div>;
  }
  if (rows.length === 0) {
    return <div className="py-16 text-center text-sm text-gray-400">{emptyLabel}</div>;
  }
  const columnLabels = rows[0].fields.map((f) => f.label);

  return (
    <>
      {/* Desktop / tablette large : tableau */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className={thCls}>Nom</th>
              {columnLabels.map((l) => <th key={l} className={thCls}>{l}</th>)}
              <th className={thCls}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50/70 transition">
                <td className={tdCls}>
                  <div className="flex items-center gap-3 min-w-[160px]">
                    <Avatar label={r.avatarLabel} color={r.avatarColor} />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{r.title}</p>
                      {r.subtitle && <p className="text-xs text-gray-400 truncate">{r.subtitle}</p>}
                    </div>
                  </div>
                </td>
                {r.fields.map((f, i) => <td key={i} className={tdCls}>{f.value}</td>)}
                <td className={tdCls}>
                  <div className="flex flex-wrap gap-1.5">{r.actions}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablette étroite : cartes empilées */}
      <div className="lg:hidden divide-y divide-gray-100">
        {rows.map((r) => (
          <div key={r.id} className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar label={r.avatarLabel} color={r.avatarColor} />
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">{r.title}</p>
                {r.subtitle && <p className="text-xs text-gray-400 truncate">{r.subtitle}</p>}
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm mb-3">
              {r.fields.map((f, i) => (
                <div key={i} className="min-w-0">
                  <dt className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{f.label}</dt>
                  <dd className="text-gray-700 truncate mt-0.5">{f.value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-wrap gap-1.5">{r.actions}</div>
          </div>
        ))}
      </div>
    </>
  );
}

export function AdminDashboard({ onLogout }: Props) {
  const [tab, setTab] = useState<Tab>("patients");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<AdminStatsAPI | null>(null);
  const [patients, setPatients] = useState<PatientAPI[]>([]);
  const [pharmacies, setPharmacies] = useState<PharmacieAPI[]>([]);
  const [livreurs, setLivreurs] = useState<LivreurAPI[]>([]);
  const [medecins, setMedecins] = useState<MedecinAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: Tab; id: string; label: string } | null>(null);

  const loadAll = useCallback(async () => {
    setError(null);
    try {
      const [s, p, ph, l, m] = await Promise.all([
        adminApi.stats(), patientsApi.findAll(), pharmaciesApi.list(), livreursApi.getAll(), medecinsApi.getAll(),
      ]);
      setStats(s); setPatients(p); setPharmacies(ph); setLivreurs(l); setMedecins(m);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const openConfirmDelete = (type: Tab, id: string, label: string) => {
    setActionError(null);
    setConfirmDelete({ type, id, label });
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setBusyId(confirmDelete.id);
    setActionError(null);
    try {
      if (confirmDelete.type === "patients") await patientsApi.supprimer(confirmDelete.id);
      else if (confirmDelete.type === "pharmacies") await pharmaciesApi.supprimer(confirmDelete.id);
      else if (confirmDelete.type === "livreurs") await livreursApi.supprimer(confirmDelete.id);
      else await medecinsApi.supprimer(confirmDelete.id);
      setConfirmDelete(null);
      await loadAll();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Suppression impossible");
    } finally {
      setBusyId(null);
    }
  };

  const handleValider = async (type: "livreurs" | "medecins", id: string) => {
    setBusyId(id);
    setActionError(null);
    try {
      if (type === "livreurs") await livreursApi.valider(id);
      else await medecinsApi.valider(id);
      await loadAll();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action impossible");
    } finally {
      setBusyId(null);
    }
  };

  const handleSuspendre = async (type: "livreurs" | "medecins", id: string) => {
    setBusyId(id);
    setActionError(null);
    try {
      if (type === "livreurs") await livreursApi.suspendre(id);
      else await medecinsApi.suspendre(id);
      await loadAll();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Action impossible");
    } finally {
      setBusyId(null);
    }
  };

  const actionBtn = (color: string, bg: string) =>
    `flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50 hover:opacity-80`;
  const btnStyle = (color: string, bg: string) => ({ color, backgroundColor: bg });

  // ── Construction des lignes par onglet ───────────────────────────────────

  const rows: EntityRow[] =
    tab === "patients" ? patients.map((p) => ({
      id: p.id,
      avatarLabel: initials(p.prenom, p.nom),
      avatarColor: BLUE,
      title: `${p.prenom} ${p.nom}`,
      fields: [
        { label: "Email", value: p.email || "—" },
        { label: "Téléphone", value: p.telephone },
        { label: "Inscrit le", value: formatDate(p.createdAt) },
      ],
      actions: (
        <button
          disabled={busyId === p.id}
          onClick={() => openConfirmDelete("patients", p.id, `${p.prenom} ${p.nom}`)}
          className={actionBtn(RED, "#FEF2F2")} style={btnStyle(RED, "#FEF2F2")}
        >
          <Trash2 className="w-3.5 h-3.5" /> Supprimer
        </button>
      ),
    })) :
    tab === "pharmacies" ? pharmacies.map((p) => ({
      id: p.id,
      avatarLabel: initials(p.nom, p.nom.split(" ")[1]),
      avatarColor: GREEN,
      title: p.nom,
      subtitle: p.adresse,
      fields: [
        { label: "Email", value: p.email || "—" },
        { label: "Téléphone", value: p.telephone || "—" },
        {
          label: "Livraison",
          value: p.livraisonActive
            ? <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: GREEN, backgroundColor: "#ECFDF5" }}>Active</span>
            : <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: GRAY, backgroundColor: "#F3F4F6" }}>Inactive</span>,
        },
      ],
      actions: (
        <button
          disabled={busyId === p.id}
          onClick={() => openConfirmDelete("pharmacies", p.id, p.nom)}
          className={actionBtn(RED, "#FEF2F2")} style={btnStyle(RED, "#FEF2F2")}
        >
          <Trash2 className="w-3.5 h-3.5" /> Supprimer
        </button>
      ),
    })) :
    tab === "livreurs" ? livreurs.map((l) => ({
      id: l.id,
      avatarLabel: initials(l.prenom, l.nom),
      avatarColor: ORANGE,
      title: `${l.prenom} ${l.nom}`,
      fields: [
        { label: "Email", value: l.email },
        { label: "Téléphone", value: l.telephone },
        { label: "Statut", value: <StatutBadge statut={l.statut} /> },
        { label: "Disponibilité", value: l.disponibiliteStatut },
      ],
      actions: (
        <>
          {l.statut === "EN_ATTENTE_VALIDATION" && (
            <button
              disabled={busyId === l.id}
              onClick={() => handleValider("livreurs", l.id)}
              className={actionBtn(GREEN, "#ECFDF5")} style={btnStyle(GREEN, "#ECFDF5")}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Valider
            </button>
          )}
          {l.statut === "ACTIF" && (
            <button
              disabled={busyId === l.id}
              onClick={() => handleSuspendre("livreurs", l.id)}
              className={actionBtn(ORANGE, "#FFF3E6")} style={btnStyle(ORANGE, "#FFF3E6")}
            >
              <Ban className="w-3.5 h-3.5" /> Suspendre
            </button>
          )}
          <button
            disabled={busyId === l.id}
            onClick={() => openConfirmDelete("livreurs", l.id, `${l.prenom} ${l.nom}`)}
            className={actionBtn(RED, "#FEF2F2")} style={btnStyle(RED, "#FEF2F2")}
          >
            <Trash2 className="w-3.5 h-3.5" /> Supprimer
          </button>
        </>
      ),
    })) :
    medecins.map((m) => ({
      id: m.id,
      avatarLabel: initials(m.prenom, m.nom),
      avatarColor: PURPLE,
      title: `${m.prenom} ${m.nom}`,
      subtitle: m.specialite,
      fields: [
        { label: "Spécialité", value: m.specialite },
        { label: "Email", value: m.email },
        { label: "Téléphone", value: m.telephone },
        { label: "Statut", value: <StatutBadge statut={m.statut} /> },
      ],
      actions: (
        <>
          {m.statut === "EN_ATTENTE_VALIDATION" && (
            <button
              disabled={busyId === m.id}
              onClick={() => handleValider("medecins", m.id)}
              className={actionBtn(GREEN, "#ECFDF5")} style={btnStyle(GREEN, "#ECFDF5")}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Valider
            </button>
          )}
          {m.statut === "ACTIF" && (
            <button
              disabled={busyId === m.id}
              onClick={() => handleSuspendre("medecins", m.id)}
              className={actionBtn(ORANGE, "#FFF3E6")} style={btnStyle(ORANGE, "#FFF3E6")}
            >
              <Ban className="w-3.5 h-3.5" /> Suspendre
            </button>
          )}
          <button
            disabled={busyId === m.id}
            onClick={() => openConfirmDelete("medecins", m.id, `${m.prenom} ${m.nom}`)}
            className={actionBtn(RED, "#FEF2F2")} style={btnStyle(RED, "#FEF2F2")}
          >
            <Trash2 className="w-3.5 h-3.5" /> Supprimer
          </button>
        </>
      ),
    }));

  const emptyLabels: Record<Tab, string> = {
    patients: "Aucun patient", pharmacies: "Aucune pharmacie",
    livreurs: "Aucun livreur", medecins: "Aucun médecin",
  };
  const activeTab = TABS.find((t) => t.key === tab)!;

  const sidebarNav = (
    <nav className="flex-1 px-4 py-6 space-y-2">
      {TABS.map((t) => (
        <NavItem
          key={t.key} icon={t.icon} label={t.label} color={t.color}
          active={tab === t.key}
          onClick={() => { setTab(t.key); setSidebarOpen(false); }}
        />
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen md:flex" style={{ backgroundColor: "#F3F4F6" }}>
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex md:w-64 bg-white border-r border-gray-100 flex-col shrink-0">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 font-bold text-lg" style={{ color: BLUE }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: BLUE }}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            Digie-Pharma
          </div>
          <p className="text-xs text-gray-500 mt-1">Administration</p>
        </div>
        {sidebarNav}
        <div className="px-4 py-4 border-t border-gray-100">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-semibold transition"
          >
            <LogOut className="w-5 h-5" style={{ color: RED }} />
            <span style={{ color: RED }}>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Sidebar — mobile (drawer) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)}>
          <aside className="w-64 bg-white h-full flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-2 font-bold" style={{ color: BLUE }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: BLUE }}>
                  <ShieldCheck className="w-4 h-4" />
                </div>
                Digie-Pharma
              </div>
              <button onClick={() => setSidebarOpen(false)} aria-label="Fermer le menu" className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            {sidebarNav}
            <div className="px-4 py-4 border-t border-gray-100">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-semibold transition"
              >
                <LogOut className="w-5 h-5" style={{ color: RED }} />
                <span style={{ color: RED }}>Déconnexion</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-white border-b border-gray-100 px-4 md:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Ouvrir le menu"
              className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg shrink-0"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">{activeTab.label}</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Statistiques & gestion des comptes</p>
            </div>
          </div>
          <button
            onClick={() => loadAll()}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition shrink-0"
            title="Rafraîchir"
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <main className="flex-1 px-4 md:px-6 py-5 md:py-6 space-y-5 md:space-y-6 overflow-y-auto">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* Stats */}
          {stats && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard icon={Users} color={BLUE} label="Patients" value={stats.totalPatients} />
                <StatCard icon={Building2} color={GREEN} label="Pharmacies" value={stats.totalPharmacies} sub={`${stats.pharmaciesLivraisonActive} avec livraison`} />
                <StatCard icon={Bike} color={ORANGE} label="Livreurs" value={stats.totalLivreurs} sub={`${stats.livreursActifs} actifs · ${stats.livreursEnAttente} attente · ${stats.livreursSuspendus} suspendus`} />
                <StatCard icon={Stethoscope} color={PURPLE} label="Médecins" value={stats.totalMedecins} sub={`${stats.medecinsActifs} actifs · ${stats.medecinsEnAttente} attente · ${stats.medecinsSuspendus} suspendus`} />
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="grid grid-cols-3 divide-x divide-gray-100">
                  {[
                    { icon: ClipboardList, color: BLUE, label: "Demandes", value: stats.totalDemandes },
                    { icon: ShoppingBag, color: GREEN, label: "Commandes", value: stats.totalCommandes },
                    { icon: Truck, color: ORANGE, label: "Livraisons", value: stats.totalLivraisons },
                  ].map((m) => (
                    <div key={m.label} className="flex flex-col items-center text-center px-1 gap-1">
                      <m.icon className="w-4 h-4" style={{ color: m.color }} />
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{m.label}</p>
                      <p className="text-lg font-extrabold leading-none" style={{ color: BLUE }}>{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {actionError && !confirmDelete && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {actionError}
            </div>
          )}

          {/* Tabs — visibles aussi en contenu principal sur desktop/tablette pour un accès rapide */}
          <div className="flex gap-2 overflow-x-auto md:hidden -mx-4 px-4 pb-1">
            {TABS.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition shrink-0"
                  style={{
                    backgroundColor: active ? t.color : "#FFFFFF",
                    color: active ? "#FFFFFF" : "#374151",
                    border: active ? "none" : "1px solid #E5E7EB",
                  }}
                >
                  <t.icon className="w-4 h-4" /> {t.label}
                </button>
              );
            })}
          </div>

          {/* Liste */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <EntityList rows={rows} loading={loading} emptyLabel={emptyLabels[tab]} />
          </div>
        </main>
      </div>

      {/* Confirmation suppression */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#FEF2F2" }}>
                <AlertTriangle className="w-5 h-5" style={{ color: RED }} />
              </div>
              <h3 className="font-bold text-gray-900">Supprimer ce compte ?</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Cette action est <strong>irréversible</strong>. Le compte « {confirmDelete.label} » et toutes ses données associées seront définitivement supprimés.
            </p>
            {actionError && (
              <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2.5 mb-4">
                {actionError}
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={busyId === confirmDelete.id}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition disabled:opacity-60"
                style={{ backgroundColor: RED }}
              >
                {busyId === confirmDelete.id ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
