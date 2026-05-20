import { useState } from "react";
import type { MedicamentAPI } from "../lib/types";
import { X, Save } from "lucide-react";

type Props = {
  onClose: () => void;
  onSave: (m: Omit<MedicamentAPI, "id">) => Promise<void>;
  saving: boolean;
};

export function InventoryEdit({ onClose, onSave, saving }: Props) {
  const [nomCommercial, setNomCommercial] = useState("");
  const [nomGenerique, setNomGenerique]   = useState("");
  const [dosage, setDosage]               = useState("");
  const [forme, setForme]                 = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomCommercial.trim()) return;
    onSave({ nomCommercial, nomGenerique: nomGenerique || undefined, dosage, forme });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-gray-200 px-5 py-4 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Nouveau médicament</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-1.5 block">Nom commercial *</label>
            <input
              type="text"
              value={nomCommercial}
              onChange={(e) => setNomCommercial(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400"
              placeholder="Ex : Doliprane"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1.5 block">Nom générique</label>
            <input
              type="text"
              value={nomGenerique}
              onChange={(e) => setNomGenerique(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400"
              placeholder="Ex : Paracétamol"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600 mb-1.5 block">Dosage</label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400"
                placeholder="Ex : 1000mg"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1.5 block">Forme</label>
              <input
                type="text"
                value={forme}
                onChange={(e) => setForme(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-green-400"
                placeholder="Ex : Comprimé"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ backgroundColor: "#10B981" }}>
              <Save className="w-4 h-4" />
              {saving ? "Ajout…" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
