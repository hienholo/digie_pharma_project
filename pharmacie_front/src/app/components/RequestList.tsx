import { useState } from "react";
import { type Request } from "./PharmacyDashboard";
import { RequestDetail } from "./RequestDetail";
import { Clock, Package, MapPin, User } from "lucide-react";

type Props = {
  requests: Request[];
  onUpdate: (requests: Request[]) => void;
};

export function RequestList({ requests, onUpdate }: Props) {
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  const handleStatusChange = (
    id: string,
    status: Request["status"],
    availability?: Record<string, boolean>,
  ) => {
    const updated = requests.map((r) =>
      r.id === id ? { ...r, status } : r,
    );
    onUpdate(updated);
    setSelectedRequest(null);
  };

  const getStatusColor = (status: Request["status"]) => {
    switch (status) {
      case "pending":
        return "#F59E0B";
      case "confirmed":
        return "#10B981";
      case "rejected":
        return "#EF4444";
      case "completed":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  const getStatusLabel = (status: Request["status"]) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "confirmed":
        return "Confirmée";
      case "rejected":
        return "Refusée";
      case "completed":
        return "Terminée";
      default:
        return status;
    }
  };

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `Il y a ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    return `Il y a ${hours}h`;
  };

  const sortedRequests = [...requests].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
  );

  return (
    <>
      <div className="space-y-3">
        {sortedRequests.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
            <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Aucune demande pour le moment</p>
          </div>
        ) : (
          sortedRequests.map((req) => (
            <div
              key={req.id}
              onClick={() => setSelectedRequest(req)}
              className="bg-white rounded-2xl p-4 border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: "#3B82F6" }}
                  >
                    {req.patientName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-gray-900">{req.patientName}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {formatTime(req.timestamp)}
                    </div>
                  </div>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-xs text-white"
                  style={{ backgroundColor: getStatusColor(req.status) }}
                >
                  {getStatusLabel(req.status)}
                </span>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-start gap-2 text-sm">
                  <Package className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    {req.items.map((item, i) => (
                      <div key={i} className="text-gray-700">
                        • {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>
                    {req.type === "pickup" ? "Retrait" : "Livraison"} -{" "}
                    {req.address}
                  </span>
                </div>
              </div>

              {req.status === "pending" && (
                <div className="pt-3 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRequest(req);
                    }}
                    className="w-full py-2 rounded-xl text-white text-sm"
                    style={{ backgroundColor: "#3B82F6" }}
                  >
                    Répondre à la demande
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {selectedRequest && (
        <RequestDetail
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onConfirm={handleStatusChange}
          onReject={(id) => handleStatusChange(id, "rejected")}
        />
      )}
    </>
  );
}
