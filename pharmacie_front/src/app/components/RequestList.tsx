import { useState } from "react";
import type { DemandeEnAttenteAPI } from "../lib/types";
import { RequestDetail } from "./RequestDetail";
import { Clock, Package, FileText, CheckCircle, XCircle, AlertCircle, MapPin } from "lucide-react";
import { demandesApi } from "../lib/api";

type Props = {
  requests: DemandeEnAttenteAPI[];
  pharmacieId: string;
  onRepondu: (reponseId: string) => void;
};

type Filter = "toutes" | "nouvelles" | "en_attente" | "traitees";

const DISTANCE_MOCK: Record<string, string> = {};
function getMockDistance(reponseId: string) {
  if (!DISTANCE_MOCK[reponseId]) {
    DISTANCE_MOCK[reponseId] = (Math.random() * 4 + 0.5).toFixed(1);
  }
  return DISTANCE_MOCK[reponseId];
}

function isNouvelle(iso: string) {
  return Date.now() - new Date(iso).getTime() < 30 * 60 * 1000;
}

function formatTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  return new Date(iso).toLocaleDateString("fr-FR");
}

export function RequestList({ requests, pharmacieId, onRepondu }: Props) {
  const [selected, setSelected] = useState<DemandeEnAttenteAPI | null>(null);
  const [filter, setFilter] = useState<Filter>("toutes");
  const [quickLoading, setQuickLoading] = useState<string | null>(null);

  const nouvelles = requests.filter((r) => isNouvelle(r.createdAt));
  const enAttente = requests.filter((r) => !isNouvelle(r.createdAt));

  const filtered = filter === "nouvelles"
    ? nouvelles
    : filter === "en_attente"
    ? enAttente
    : filter === "traitees"
    ? []
    : requests;

  const handleQuickReply = async (
    e: React.MouseEvent,
    req: DemandeEnAttenteAPI,
    reponse: "DISPONIBLE" | "NON_DISPONIBLE",
  ) => {
    e.stopPropagation();
    setQuickLoading(req.reponseId + reponse);
    try {
      await demandesApi.repondre(req.demandeId, pharmacieId, reponse);
      onRepondu(req.reponseId);
    } catch {
      // fallback: ouvre le détail
      setSelected(req);
    } finally {
      setQuickLoading(null);
    }
  };

  const tabs: { key: Filter; label: string; count?: number }[] = [
    { key: "nouvelles", label: "Nouvelles", count: nouvelles.length },
    { key: "en_attente", label: "En attente", count: enAttente.length },
    { key: "traitees", label: "Traitées" },
    { key: "toutes", label: "Toutes", count: requests.length },
  ];

  return (
    <>
      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-2xl">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="flex-1 relative py-2 px-1 rounded-xl text-xs font-semibold transition-all"
            style={{
              backgroundColor: filter === key ? "white" : "transparent",
              color: filter === key ? "#1A3072" : "#6B7280",
              boxShadow: filter === key ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
            }}
          >
            {label}
            {count != null && count > 0 && (
              <span
                className="ml-1 px-1.5 py-0.5 rounded-full text-white font-bold"
                style={{ fontSize: "9px", backgroundColor: key === "nouvelles" ? "#EF4444" : "#1A3072" }}
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
            <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">
              {filter === "traitees" ? "Aucune demande traitée pour le moment" : "Aucune demande"}
            </p>
          </div>
        ) : (
          filtered.map((req) => {
            const nouvelle = isNouvelle(req.createdAt);
            const distance = getMockDistance(req.reponseId);
            const ref = `#DP-${req.reponseId.slice(-4).toUpperCase()}`;
            return (
              <div
                key={req.reponseId}
                onClick={() => setSelected(req)}
                className="bg-white rounded-2xl p-4 border cursor-pointer transition-colors"
                style={{ borderColor: nouvelle ? "#FBD7B4" : "#E5E7EB" }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                      style={{ backgroundColor: "#1A3072" }}>
                      {req.patientPrenom.charAt(0)}
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold text-sm">
                        {req.patientPrenom} {req.patientNom}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          {formatTime(req.createdAt)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <MapPin className="w-3 h-3" />
                          {distance} km
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {nouvelle ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: "#FEF0E4", color: "#F47920" }}>
                        NOUVELLE
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">
                        En attente
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400">{ref}</span>
                  </div>
                </div>

                {/* Contenu */}
                <div className="mb-3">
                  {req.type === "ORDONNANCE" ? (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>Ordonnance{req.medicamentNoms.length > 0 ? ` — ${req.medicamentNoms.join(", ")}` : ""}</span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <Package className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <span>
                        {req.medicamentRecherche
                          ? req.medicamentRecherche
                          : req.medicamentNoms.length > 0
                          ? req.medicamentNoms.join(", ")
                          : "Médicament sans précision"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Message patient */}
                <p className="text-xs text-gray-400 italic mb-3">Besoin urgent s'il vous plaît.</p>

                {/* Boutons réponse rapide */}
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => handleQuickReply(e, req, "DISPONIBLE")}
                    disabled={quickLoading !== null}
                    className="flex-1 py-2 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-60 transition"
                    style={{ backgroundColor: "#10B981" }}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {quickLoading === req.reponseId + "DISPONIBLE" ? "…" : "Disponible"}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelected(req); }}
                    disabled={quickLoading !== null}
                    className="flex-1 py-2 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-60 transition"
                    style={{ backgroundColor: "#F47920" }}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    Partiellement
                  </button>
                  <button
                    onClick={(e) => handleQuickReply(e, req, "NON_DISPONIBLE")}
                    disabled={quickLoading !== null}
                    className="flex-1 py-2 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-60 transition"
                    style={{ backgroundColor: "#EF4444" }}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    {quickLoading === req.reponseId + "NON_DISPONIBLE" ? "…" : "Non dispo"}
                  </button>
                </div>
              </div>
            );
          })
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
