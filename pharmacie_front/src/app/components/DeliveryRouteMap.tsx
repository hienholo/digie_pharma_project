import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import { MapPin, Navigation } from "lucide-react";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;

// Icône de géolocalisation classique (goutte + pastille), pointe ancrée sur la coordonnée exacte.
function pin(color: string) {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <svg width="30" height="38" viewBox="0 0 24 30" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 1px 3px rgba(0,0,0,0.4))">
        <path d="M12 0C6.477 0 2 4.477 2 10c0 7.5 10 19 10 19s10-11.5 10-19c0-5.523-4.477-10-10-10z" fill="${color}" stroke="white" stroke-width="1.5"/>
        <circle cx="12" cy="10" r="4" fill="white"/>
      </svg>`,
    iconSize: [30, 38],
    iconAnchor: [15, 38],
  });
}
const pharmacyPin = pin("#1A3072");
const deliveryPin = pin("#EF4444");

/** Adresse stockée en base au format "latitude,longitude" (snapshot GPS patient). */
function parseLatLng(adresse?: string): [number, number] | null {
  if (!adresse) return null;
  const parts = adresse.split(",").map((p) => parseFloat(p.trim()));
  if (parts.length !== 2 || parts.some((p) => Number.isNaN(p))) return null;
  return [parts[0], parts[1]];
}

type Props = {
  adresseLivraison?: string;
  pharmacieLabel: string;
};

export function DeliveryRouteMap({ adresseLivraison, pharmacieLabel }: Props) {
  const dest = parseLatLng(adresseLivraison);

  if (!dest) {
    return (
      <div className="flex items-start gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
        <MapPin className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
        <p className="text-sm text-gray-700">{adresseLivraison ?? "Adresse non disponible"}</p>
      </div>
    );
  }

  // Position de la pharmacie non exposée par l'API livraison : approximation visuelle
  // à proximité du point de livraison, uniquement pour représenter l'itinéraire.
  const origin: [number, number] = [dest[0] + 0.006, dest[1] - 0.004];
  const center: [number, number] = [(dest[0] + origin[0]) / 2, (dest[1] + origin[1]) / 2];
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${dest[0]},${dest[1]}`;

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200">
      <div className="h-32 relative">
        <MapContainer center={center} zoom={13} zoomControl={false} dragging={false} scrollWheelZoom={false} doubleClickZoom={false} className="w-full h-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          <Marker position={origin} icon={pharmacyPin} />
          <Marker position={dest} icon={deliveryPin} />
          <Polyline positions={[origin, dest]} pathOptions={{ color: "#1A3072", weight: 3, dashArray: "6 6" }} />
        </MapContainer>
      </div>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-white border-t border-gray-100 hover:bg-gray-50 transition"
        style={{ color: "#1A3072" }}
      >
        <Navigation className="w-3.5 h-3.5" />
        Ouvrir l'itinéraire dans Maps
      </a>
    </div>
  );
}
