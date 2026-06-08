import { X, CreditCard, Banknote, MapPin } from "lucide-react";
import { useState } from "react";
import type { Pharmacy } from "./PharmacyCard";

type Props = {
  open: boolean;
  pharmacy: Pharmacy | null;
  mode: "pickup" | "delivery";
  items: string[];
  onClose: () => void;
  onConfirm: () => void;
};

export function CheckoutSheet({
  open,
  pharmacy,
  mode,
  items,
  onClose,
  onConfirm,
}: Props) {
  const [pay, setPay] = useState<"cash" | "card">("cash");
  const [address, setAddress] = useState("");
  if (!open || !pharmacy) return null;

  const fee = mode === "delivery" ? 300 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3>Finaliser la commande</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="bg-gray-50 rounded-2xl p-4">
            <div className="text-sm text-gray-500">Pharmacie</div>
            <div>{pharmacy.name}</div>
            <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {pharmacy.address}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-2">
              Articles ({items.length || 1})
            </div>
            <ul className="divide-y divide-gray-100 border border-gray-100 rounded-2xl">
              {(items.length ? items : ["Médicament"]).map((it, i) => (
                <li key={i} className="px-3 py-2 text-sm">
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </div>

          {mode === "delivery" && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Adresse de livraison
              </label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rue, ville..."
                className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:border-blue-400"
              />
            </div>
          )}

          <div>
            <div className="text-sm text-gray-600 mb-2">Paiement</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPay("cash")}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border"
                style={{
                  borderColor: pay === "cash" ? "#1A3072" : "#E5E7EB",
                  backgroundColor: pay === "cash" ? "#EEF1F8" : "white",
                }}
              >
                <Banknote className="w-4 h-4" />À la livraison
              </button>
              <button
                onClick={() => setPay("card")}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border"
                style={{
                  borderColor: pay === "card" ? "#1A3072" : "#E5E7EB",
                  backgroundColor: pay === "card" ? "#EEF1F8" : "white",
                }}
              >
                <CreditCard className="w-4 h-4" />
                Carte / Edahabia
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Médicaments</span>
              <span className="italic text-gray-400">Prix en pharmacie</span>
            </div>
            {fee > 0 && (
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span>Frais de livraison</span>
                <span style={{ color: "#1A3072" }}>{fee} FCFA</span>
              </div>
            )}
          </div>

          <button
            onClick={onConfirm}
            className="w-full py-3 rounded-xl text-white"
            style={{ backgroundColor: "#1A3072" }}
          >
            Confirmer la commande
          </button>
        </div>
      </div>
    </div>
  );
}
