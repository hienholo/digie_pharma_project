import { MapPin, Truck, Package } from "lucide-react";

export type Pharmacy = {
  id: string;
  name: string;
  address: string;
  distanceKm?: number;
  open: boolean;
  rating?: number;
  delivery: boolean;
  pickup: boolean;
  eta?: string;
  available: "in-stock" | "partial" | "unknown";
};

type Props = {
  pharmacy: Pharmacy;
  onOrder: (p: Pharmacy, mode: "pickup" | "delivery") => void;
};

const availLabels = {
  "in-stock": { text: "Disponible", color: "#10B981" },
  partial: { text: "Partiellement disponible", color: "#F47920" },
  unknown: { text: "Non disponible", color: "#EF4444" },
};

export function PharmacyCard({ pharmacy, onOrder }: Props) {
  const avail = availLabels[pharmacy.available];
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="truncate">{pharmacy.name}</h3>
            <span
              className="px-2 py-0.5 rounded-full text-xs text-white"
              style={{ backgroundColor: avail.color }}
            >
              {avail.text}
            </span>
            {pharmacy.open ? (
              <span className="text-xs text-green-600">● Ouverte</span>
            ) : (
              <span className="text-xs text-gray-400">● Fermée</span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="truncate">{pharmacy.address}</span>
            {(pharmacy.distanceKm ?? 0) > 0 && (
              <>
                <span className="mx-1 shrink-0">·</span>
                <span className="shrink-0">{pharmacy.distanceKm!.toFixed(1)} km</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {pharmacy.pickup && (
          <button
            onClick={() => onOrder(pharmacy, "pickup")}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700"
          >
            <Package className="w-4 h-4" />
            Retrait
          </button>
        )}
        {pharmacy.delivery && (
          <button
            onClick={() => onOrder(pharmacy, "delivery")}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-white"
            style={{ backgroundColor: "#1A3072" }}
          >
            <Truck className="w-4 h-4" />
            Livraison
          </button>
        )}
      </div>
    </div>
  );
}
