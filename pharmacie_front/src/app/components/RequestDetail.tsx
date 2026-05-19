import { useState } from "react";
import { type Request } from "./PharmacyDashboard";
import { X, CheckCircle, XCircle, Package, MapPin, FileText } from "lucide-react";

type Props = {
  request: Request;
  onClose: () => void;
  onConfirm: (
    id: string,
    status: Request["status"],
    availability?: Record<string, boolean>,
  ) => void;
  onReject: (id: string) => void;
};

export function RequestDetail({ request, onClose, onConfirm, onReject }: Props) {
  const [availability, setAvailability] = useState<Record<string, boolean>>(
    Object.fromEntries(request.items.map((item) => [item, true])),
  );

  const allAvailable = Object.values(availability).every((v) => v);
  const someAvailable = Object.values(availability).some((v) => v);

  const handleConfirm = () => {
    onConfirm(request.id, "confirmed", availability);
  };

  const handleReject = () => {
    onReject(request.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between">
          <h2>Détails de la demande</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <p className="text-sm text-gray-500 mb-1">Patient</p>
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: "#3B82F6" }}
              >
                {request.patientName.charAt(0)}
              </div>
              <div>
                <p className="text-gray-900">{request.patientName}</p>
                <p className="text-xs text-gray-500">
                  {new Date(request.timestamp).toLocaleString("fr-FR")}
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <p className="text-sm text-gray-500">
                {request.type === "pickup" ? "Retrait en pharmacie" : "Livraison"}
              </p>
            </div>
            {request.type === "delivery" && (
              <p className="text-sm text-gray-700 ml-6">{request.address}</p>
            )}
          </div>

          {request.prescription && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-500">Ordonnance</p>
              </div>
              <div className="ml-6 rounded-xl overflow-hidden border border-gray-200 inline-block">
                <img
                  src={request.prescription}
                  alt="Ordonnance"
                  className="max-w-xs w-full"
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-gray-400" />
              <p className="text-sm text-gray-500">
                Médicaments ({request.items.length})
              </p>
            </div>
            <div className="ml-6 space-y-2">
              {request.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-gray-50"
                >
                  <span className="text-sm text-gray-900">{item}</span>
                  {request.status === "pending" && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={availability[item] ?? true}
                        onChange={(e) =>
                          setAvailability((prev) => ({
                            ...prev,
                            [item]: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 rounded accent-blue-600"
                      />
                      <span className="text-xs text-gray-600">
                        {availability[item] ? "Disponible" : "Indisponible"}
                      </span>
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          {request.status === "pending" && (
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleReject}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Refuser
              </button>
              <button
                onClick={handleConfirm}
                disabled={!someAvailable}
                className="flex-1 py-2.5 rounded-xl text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#10B981" }}
              >
                <CheckCircle className="w-4 h-4" />
                {allAvailable ? "Tout confirmer" : "Confirmer disponibles"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
