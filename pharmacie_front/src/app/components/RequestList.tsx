import { useState } from "react";
import type { DemandeEnAttenteAPI } from "../lib/types";
import { RequestDetail } from "./RequestDetail";
import { Clock, Package, FileText } from "lucide-react";

type Props = {
  requests: DemandeEnAttenteAPI[];
  pharmacieId: string;
  onRepondu: (reponseId: string) => void;
};

export function RequestList({ requests, pharmacieId, onRepondu }: Props) {
  const [selected, setSelected] = useState<DemandeEnAttenteAPI | null>(null);

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `Il y a ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    return new Date(iso).toLocaleDateString("fr-FR");
  };

  return (
    <>
      <div className="space-y-3">
        {requests.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
            <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Aucune demande en attente</p>
          </div>
        ) : (
          requests.map((req) => (
            <div
              key={req.reponseId}
              onClick={() => setSelected(req)}
              className="bg-white rounded-2xl p-4 border border-gray-200 cursor-pointer hover:border-green-200 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm bg-blue-500">
                    {req.patientPrenom.charAt(0)}
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">{req.patientPrenom} {req.patientNom}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {formatTime(req.createdAt)}
                    </div>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full font-medium bg-amber-100 text-amber-700">
                  En attente
                </span>
              </div>

              <div className="space-y-1.5 mb-3">
                {req.type === "ORDONNANCE" ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>Ordonnance{req.medicamentNoms.length > 0 ? ` — ${req.medicamentNoms.join(", ")}` : ""}</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <Package className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <span>{req.medicamentNoms.length > 0 ? req.medicamentNoms.join(", ") : "Médicament sans précision"}</span>
                  </div>
                )}
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); setSelected(req); }}
                className="w-full py-2 rounded-xl text-white text-sm bg-blue-500 hover:bg-blue-600 transition"
              >
                Répondre à la demande
              </button>
            </div>
          ))
        )}
      </div>

      {selected && (
        <RequestDetail
          request={selected}
          pharmacieId={pharmacieId}
          onClose={() => setSelected(null)}
          onRepondu={(reponseId) => { onRepondu(reponseId); setSelected(null); }}
        />
      )}
    </>
  );
}
