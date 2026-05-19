import { useState } from "react";
import { type InventoryItem } from "./PharmacyDashboard";
import { X, Save } from "lucide-react";

type Props = {
  item: InventoryItem;
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
};

export function InventoryEdit({ item, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<InventoryItem>(item);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price <= 0) {
      return;
    }
    onSave(formData);
  };

  const isNew = !item.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div
        className="bg-white rounded-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 px-5 py-4 flex items-center justify-between">
          <h2>{isNew ? "Nouveau médicament" : "Modifier le stock"}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-1.5 block">
              Nom du médicament
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400"
              placeholder="Ex: Doliprane 1000mg"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600 mb-1.5 block">
                Stock actuel
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: Number(e.target.value) })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400"
                min="0"
                required
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1.5 block">
                Stock minimum
              </label>
              <input
                type="number"
                value={formData.minStock}
                onChange={(e) =>
                  setFormData({ ...formData, minStock: Number(e.target.value) })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1.5 block">
              Prix (DZD)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: Number(e.target.value) })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400"
              min="0"
              step="10"
              required
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-white transition-colors flex items-center justify-center gap-2"
              style={{ backgroundColor: "#10B981" }}
            >
              <Save className="w-4 h-4" />
              {isNew ? "Ajouter" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
