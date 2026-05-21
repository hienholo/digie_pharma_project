import { useState, useEffect } from "react";
import { Calendar, Clock, Phone, Check, X, ChevronRight, RefreshCw } from "lucide-react";
import type { RendezVousAPI } from "../lib/types";
import { rendezVousApi, session } from "../lib/api";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  EN_ATTENTE: { bg: "#FEF3C7", text: "#D97706" },
  CONFIRME:   { bg: "#DCFCE7", text: "#16A34A" },
  COMPLETE:   { bg: "#DBEAFE", text: "#0284C7" },
  ANNULE:     { bg: "#FEE2E2", text: "#DC2626" },
};

const STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  CONFIRME:   "Confirmé",
  COMPLETE:   "Complété",
  ANNULE:     "Annulé",
};

type Props = { medecinId?: string };

export function DoctorAppointments({ medecinId: medecinIdProp }: Props = {}) {
  const medecinId = medecinIdProp || session.getUserId();
  const [rdvs, setRdvs] = useState<RendezVousAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<RendezVousAPI | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "EN_ATTENTE" | "CONFIRME">("ALL");

  const load = () => {
    if (!medecinId) return;
    setLoading(true);
    rendezVousApi.getByMedecin(medecinId)
      .then(setRdvs)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [medecinId]);

  const handleConfirmer = async (id: string) => {
    setActionLoading(true);
    setError(null);
    try {
      const updated = await rendezVousApi.confirmer(id);
      setRdvs((prev) => prev.map((r) => r.id === id ? updated : r));
      if (selected?.id === id) setSelected(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAnnuler = async (id: string) => {
    setActionLoading(true);
    setError(null);
    try {
      const updated = await rendezVousApi.annuler(id);
      setRdvs((prev) => prev.map((r) => r.id === id ? updated : r));
      if (selected?.id === id) setSelected(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = rdvs.filter((r) => filter === "ALL" || r.statut === filter);

  if (selected) {
    const colors = STATUS_COLORS[selected.statut] ?? STATUS_COLORS.EN_ATTENTE;
    return (
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-blue-100">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{ backgroundColor: colors.text }}>
              {selected.patientPrenom.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{selected.patientPrenom} {selected.patientNom}</h1>
              <span className="inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold"
                style={{ backgroundColor: colors.bg, color: colors.text }}>
                {STATUS_LABELS[selected.statut]}
              </span>
            </div>
            <button onClick={() => setSelected(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
              Retour
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Date &amp; heure</p>
                <p className="font-semibold text-gray-900">
                  {new Date(selected.dateRdv).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} à {selected.heure}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center">
                <Phone className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Téléphone</p>
                <p className="font-semibold text-gray-900">{selected.patientTelephone}</p>
              </div>
            </div>

            {selected.motif && (
              <div>
                <p className="text-sm text-gray-600 mb-1">Motif</p>
                <p className="font-medium text-gray-900 bg-gray-50 p-3 rounded-lg">{selected.motif}</p>
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2.5 text-center">{error}</p>
          )}

          {selected.statut === "EN_ATTENTE" && (
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => handleConfirmer(selected.id)} disabled={actionLoading}
                className="bg-green-600 text-white rounded-xl py-3 font-medium hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50">
                <Check className="w-5 h-5" /> Confirmer
              </button>
              <button onClick={() => handleAnnuler(selected.id)} disabled={actionLoading}
                className="bg-red-600 text-white rounded-xl py-3 font-medium hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50">
                <X className="w-5 h-5" /> Annuler
              </button>
            </div>
          )}

          {selected.statut === "CONFIRME" && (
            <button onClick={() => handleAnnuler(selected.id)} disabled={actionLoading}
              className="w-full border border-red-300 text-red-600 rounded-xl py-3 font-medium hover:bg-red-50 transition disabled:opacity-50">
              Annuler ce rendez-vous
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Filtres */}
      <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          {(["ALL", "EN_ATTENTE", "CONFIRME"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition text-sm ${
                filter === f
                  ? f === "ALL" ? "bg-blue-600 text-white"
                    : f === "EN_ATTENTE" ? "bg-amber-600 text-white"
                    : "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}>
              {f === "ALL" ? "Tous" : STATUS_LABELS[f]}
              {f !== "ALL" && (
                <span className="ml-1.5 bg-white/30 text-current text-xs px-1.5 py-0.5 rounded-full">
                  {rdvs.filter((r) => r.statut === f).length}
                </span>
              )}
            </button>
          ))}
        </div>
        <button onClick={load}
          className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-gray-500">Chargement…</div>
        ) : filtered.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filtered.map((r) => {
              const colors = STATUS_COLORS[r.statut] ?? STATUS_COLORS.EN_ATTENTE;
              return (
                <button key={r.id} onClick={() => setSelected(r)}
                  className="w-full px-6 py-4 hover:bg-gray-50 transition text-left border-l-4 border-transparent hover:border-blue-600">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shrink-0"
                        style={{ backgroundColor: colors.text }}>
                        {r.patientPrenom.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{r.patientPrenom} {r.patientNom}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{r.motif || "Consultation"}</p>
                      </div>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <p className="text-xs text-gray-500">
                        {new Date(r.dateRdv).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" /> {r.heure}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-1 rounded"
                      style={{ backgroundColor: colors.bg, color: colors.text }}>
                      {STATUS_LABELS[r.statut]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500">
              {filter === "ALL" ? "Aucun rendez-vous reçu" : `Aucun RDV "${STATUS_LABELS[filter]}"`}
            </p>
            <p className="text-xs text-gray-400 mt-1">Les patients prennent RDV depuis leur espace</p>
          </div>
        )}
      </div>
    </div>
  );
}
