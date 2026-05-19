import { useState } from "react";
import { type InventoryItem } from "./PharmacyDashboard";
import { Search, AlertTriangle, Plus, Edit2 } from "lucide-react";
import { InventoryEdit } from "./InventoryEdit";

type Props = {
  inventory: InventoryItem[];
  onUpdate: (inventory: InventoryItem[]) => void;
};

export function InventoryPanel({ inventory, onUpdate }: Props) {
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [showAddNew, setShowAddNew] = useState(false);

  const filtered = inventory.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSave = (item: InventoryItem) => {
    if (showAddNew) {
      onUpdate([...inventory, { ...item, id: `M${Date.now()}` }]);
      setShowAddNew(false);
    } else {
      onUpdate(inventory.map((i) => (i.id === item.id ? item : i)));
      setEditItem(null);
    }
  };

  return (
    <div>
      <div className="bg-white rounded-2xl p-4 border border-gray-200 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un médicament..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400"
            />
          </div>
          <button
            onClick={() => setShowAddNew(true)}
            className="px-4 py-2.5 rounded-xl text-white flex items-center gap-2"
            style={{ backgroundColor: "#10B981" }}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ajouter</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
            <p className="text-gray-500">Aucun médicament trouvé</p>
          </div>
        ) : (
          filtered.map((item) => {
            const lowStock = item.stock < item.minStock;
            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl p-4 border ${
                  lowStock ? "border-orange-200 bg-orange-50/30" : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-gray-900">{item.name}</h3>
                      {lowStock && (
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600">
                        Stock: <span className={lowStock ? "text-orange-600" : "text-gray-900"}>{item.stock}</span>
                      </span>
                      <span className="text-gray-400">
                        Min: {item.minStock}
                      </span>
                      <span className="text-gray-900">
                        {item.price} DZD
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditItem(item)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {editItem && (
        <InventoryEdit
          item={editItem}
          onClose={() => setEditItem(null)}
          onSave={handleSave}
        />
      )}

      {showAddNew && (
        <InventoryEdit
          item={{
            id: "",
            name: "",
            stock: 0,
            minStock: 0,
            price: 0,
          }}
          onClose={() => setShowAddNew(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
