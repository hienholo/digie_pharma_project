import { useState } from "react";
import type { DemandeEnAttenteAPI } from "../lib/types";
import { demandesApi } from "../lib/api";
import { X, Package, FileText, Phone, CheckCircle, XCircle, AlertCircle } from "lucide-react";

type Props = {
  request: DemandeEnAttenteAPI;
  pharmacieId: string;
  onClose: () => void;
  onRepondu: (reponseId: string) => void;
};

export function RequestDetail({ request, pharmacieId, onClose, onRepondu }: Props) {
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<"DISPONIBLE" | "PARTIEL" | null>(null);
  const [detailPartiel, setDetailPartiel] = useState("");
  const [prix, setPrix] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reply = async (reponse: "DISPONIBLE" | "NON_DISPONIBLE" | "PARTIEL") => {
    if (reponse !== "NON_DISPONIBLE" && !pending) {
      setPending(reponse);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await demandesApi.repondre(
        request.demandeId,
        pharmacieId,
        reponse,
        reponse === "PARTIEL" ? detailPartiel : undefined,
        reponse !== "NON_DISPONIBLE" && prix.trim() ? parseFloat(prix) : undefined,
      );
      onRepondu(request.reponseId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl">
          <h2 className="font-bold text-gray-900">Détails de la demande</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Patient */}
          <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0"
              style={{ backgroundColor: "#1A3072" }}>
              {request.patientPrenom.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{request.patientPrenom} {request.patientNom}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                <Phone className="w-3 h-3" />
                {request.patientTelephone}
              </div>
            </div>
            <a href={`tel:${request.patientTelephone}`}
              className="p-2 rounded-xl text-white shrink-0"
              style={{ backgroundColor: "#1A3072" }}
              onClick={(e) => e.stopPropagation()}>
              <Phone className="w-4 h-4" />
            </a>
          </div>

          {/* Message patient */}
          <div className="px-4 py-3 rounded-xl border-l-4 bg-amber-50 border-amber-400">
            <p className="text-xs font-semibold text-amber-700 mb-0.5">Message du patient</p>
            <p className="text-sm text-amber-800 italic">Besoin urgent s'il vous plaît.</p>
          </div>

          {/* Type de demande */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Demande</p>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              {request.type === "ORDONNANCE"
                ? <FileText className="w-4 h-4 shrink-0" style={{ color: "#1A3072" }} />
                : <Package className="w-4 h-4 shrink-0" style={{ color: "#1A3072" }} />}
              {request.type === "ORDONNANCE" ? "Ordonnance médicale" : "Médicament(s) spécifique(s)"}
            </div>
          </div>

          {/* Image ordonnance */}
          {request.ordonnanceImageUrl && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Ordonnance</p>
              <div className="rounded-xl overflow-hidden border border-gray-200">
                <img src={request.ordonnanceImageUrl} alt="Ordonnance" className="w-full" />
              </div>
            </div>
          )}

          {/* Médicament recherché */}
          {request.medicamentRecherche && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Médicament recherché</p>
              <div className="flex items-center gap-3 p-3 rounded-xl border border-[#D6DCF0] bg-[#EEF1F8]">
                <Package className="w-4 h-4 shrink-0" style={{ color: "#1A3072" }} />
                <span className="text-sm font-semibold" style={{ color: "#1A3072" }}>{request.medicamentRecherche}</span>
              </div>
            </div>
          )}

          {/* Médicaments ordonnance */}
          {request.medicamentNoms.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Médicaments ({request.medicamentNoms.length})
              </p>
              <div className="space-y-2">
                {request.medicamentNoms.map((nom, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-gray-50">
                    <Package className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-900">{nom}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prix + détail (affiché après le choix Disponible / Partiellement) */}
          {pending && (
            <div
              className="p-4 rounded-2xl border space-y-3"
              style={{
                borderColor: pending === "PARTIEL" ? "#FED7AA" : "#A7F3D0",
                backgroundColor: pending === "PARTIEL" ? "#FFF7ED" : "#ECFDF5",
              }}
            >
              <p className="text-sm font-semibold" style={{ color: pending === "PARTIEL" ? "#C2410C" : "#047857" }}>
                {pending === "PARTIEL" ? "Précisez ce qui est disponible" : "Confirmer la disponibilité"}
              </p>

              {pending === "PARTIEL" && (
                <textarea
                  value={detailPartiel}
                  onChange={(e) => setDetailPartiel(e.target.value)}
                  placeholder="Ex : Doliprane disponible mais pas Amoxicilline…"
                  className="w-full px-4 py-3 rounded-xl border border-orange-200 bg-white text-sm focus:outline-none focus:border-orange-400 resize-none"
                  rows={2}
                  autoFocus
                />
              )}

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Prix (FCFA) — optionnel</label>
                <input
                  type="number"
                  min={0}
                  value={prix}
                  onChange={(e) => setPrix(e.target.value)}
                  placeholder="Ex : 1500"
                  autoFocus={pending === "DISPONIBLE"}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-[#1A3072]"
                />
              </div>

              <button
                onClick={() => reply(pending)}
                disabled={loading || (pending === "PARTIEL" && !detailPartiel.trim())}
                className="w-full py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: pending === "PARTIEL" ? "#F47920" : "#10B981" }}
              >
                {pending === "PARTIEL" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                {loading ? "Envoi…" : pending === "PARTIEL" ? "Confirmer disponibilité partielle" : "Confirmer disponible"}
              </button>
              <button onClick={() => setPending(null)} className="w-full text-xs text-gray-400 hover:text-gray-600">
                Annuler
              </button>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2.5 text-center">{error}</p>
          )}

          {/* Actions principales */}
          {!pending && (
            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={() => reply("DISPONIBLE")}
                disabled={loading}
                className="py-3 rounded-2xl text-white text-xs font-bold flex flex-col items-center gap-1.5 disabled:opacity-50 transition"
                style={{ backgroundColor: "#10B981" }}
              >
                <CheckCircle className="w-5 h-5" />
                Disponible
              </button>
              <button
                onClick={() => reply("PARTIEL")}
                disabled={loading}
                className="py-3 rounded-2xl text-white text-xs font-bold flex flex-col items-center gap-1.5 disabled:opacity-50 transition"
                style={{ backgroundColor: "#F47920" }}
              >
                <AlertCircle className="w-5 h-5" />
                Partiellement
              </button>
              <button
                onClick={() => reply("NON_DISPONIBLE")}
                disabled={loading}
                className="py-3 rounded-2xl text-white text-xs font-bold flex flex-col items-center gap-1.5 disabled:opacity-50 transition"
                style={{ backgroundColor: "#EF4444" }}
              >
                <XCircle className="w-5 h-5" />
                Non dispo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
