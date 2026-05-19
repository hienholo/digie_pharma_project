import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { Pharmacy } from "./PharmacyCard";
import { MapPin, Phone, Star } from "lucide-react";

// Fix default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom icon pour les pharmacies
const createPharmacyIcon = (open: boolean) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div class="flex items-center justify-center w-10 h-10 rounded-full shadow-lg border-2 border-white" 
           style="background-color: ${open ? "#10B981" : "#EF4444"}">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.5 13.572l-7.5 7.428m0 0l-7.5-7.428m7.5 7.428V3"></path>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

// Custom icon pour la localisation utilisateur
const userIcon = L.divIcon({
  className: "custom-user-marker",
  html: `
    <div class="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-lg">
      <div class="w-2 h-2 bg-white rounded-full"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface MapProps {
  pharmacies: Pharmacy[];
  onPharmacySelect?: (pharmacy: Pharmacy) => void;
}

function MapControls() {
  const map = useMap();

  useEffect(() => {
    // Ajouter contrôles de zoom
    L.control.zoom({ position: "topright" }).addTo(map);
  }, [map]);

  return null;
}

export function PharmacyMap({ pharmacies, onPharmacySelect }: MapProps) {
  // Coordonnées d'Abidjan (centre approximatif)
  const algerCenter = [5.3196, -4.0167] as [number, number];

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-gray-200">
      <MapContainer
        center={algerCenter}
        zoom={13}
        className="w-full h-full"
        style={{ zIndex: 1 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* User location marker */}
        <Marker position={algerCenter} icon={userIcon}>
          <Popup>
            <div className="text-sm font-medium">Votre localisation</div>
          </Popup>
        </Marker>

        {/* Pharmacy markers */}
        {pharmacies.map((pharmacy) => {
          // Simulated coordinates around Algiers
          const lat = algerCenter[0] + (Math.random() - 0.5) * 0.2;
          const lng = algerCenter[1] + (Math.random() - 0.5) * 0.2;

          return (
            <Marker
              key={pharmacy.id}
              position={[lat, lng]}
              icon={createPharmacyIcon(pharmacy.open)}
              eventHandlers={{
                click: () => onPharmacySelect?.(pharmacy),
              }}
            >
              <Popup>
                <div className="w-48">
                  <h3 className="font-semibold text-gray-900 mb-2">{pharmacy.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">{pharmacy.address}</p>

                  <div className="space-y-1.5 mb-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{pharmacy.rating}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span>{pharmacy.distanceKm} km</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        pharmacy.open
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {pharmacy.open ? "Ouvert" : "Fermé"}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <MapControls />
      </MapContainer>

      {/* Info overlay */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg px-3 py-2 text-xs font-medium text-gray-700 shadow-lg z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>{pharmacies.length} pharmacies à proximité</span>
        </div>
      </div>
    </div>
  );
}
