import { useState } from "react";
import type { DemandeEnAttenteAPI } from "../lib/types";
import { demandesApi } from "../lib/api";
import { X, CheckCircle, XCircle, Package, FileText, Phone } from "lucide-react";

type Props = {
  request: DemandeEnAttenteAPI;
  pharmacieId: string;
  onClose: () => void;
  onRepondu: (reponseId: string) => void;
};

export function RequestDetail({ request, pharmacieId, onClose, onRepondu }: Props) {
  const [loading, setLoading] = useState(false);
  const [detailPartiel, setDetailPartiel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reply = async (reponse: "DISPONIBLE" | "NON_DISPONIBLE" | "PARTIEL") => {
    setLoading(true);
    setError(null);
    try {
      await demandesApi.repondre(
        request.demandeId,
        pharmacieId,
        reponse,
        reponse === "PARTIEL" ? detailPartiel : undefined,
      );
      onRepondu(request.reponseId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Détails de la demande</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Patient */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Patient</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-blue-500 font-semibold">
                {request.patientPrenom.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{request.patientPrenom} {request.patientNom}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                  <Phone className="w-3 h-3" />
                  {request.patientTelephone}
                </div>
              </div>
            </div>
          </div>

          {/* Type de demande */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Type</p>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              {request.type === "ORDONNANCE" ? <FileText className="w-4 h-4 text-blue-500" /> : <Package className="w-4 h-4 text-blue-500" />}
              {request.type === "ORDONNANCE" ? "Ordonnance médicale" : "Médicament(s) spécifique(s)"}
            </div>
          </div>

          {/* Ordonnance image */}
          {request.ordonnanceImageUrl && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Ordonnance</p>
              <div className="rounded-xl overflow-hidden border border-gray-200 inline-block">
                <img src={request.ordonnanceImageUrl} alt="Ordonnance" className="max-w-xs w-full" />
              </div>
            </div>
          )}

          {/* Médicaments */}
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

          {/* Détail partiel */}
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-2">
              Précision (si disponibilité partielle)
            </label>
            <textarea
              value={detailPartiel}
              onChange={(e) => setDetailPartiel(e.target.value)}
              placeholder="Ex : Doliprane disponible mais pas Amoxicilline…"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 resize-none"
              rows={2}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2.5 text-center">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <button
              onClick={() => reply("NON_DISPONIBLE")}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Refuser
            </button>
            {detailPartiel.trim() && (
              <button
                onClick={() => reply("PARTIEL")}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-white flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: "#F59E0B" }}
              >
                <CheckCircle className="w-4 h-4" />
                Partiel
              </button>
            )}
            <button
              onClick={() => reply("DISPONIBLE")}
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: "#10B981" }}
            >
              <CheckCircle className="w-4 h-4" />
              Disponible
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
