import { useState } from "react";
import type { MedicamentAPI } from "../lib/types";
import { Search, Plus } from "lucide-react";
import { InventoryEdit } from "./InventoryEdit";

type Props = {
  medicaments: MedicamentAPI[];
  onAdd: (m: Omit<MedicamentAPI, "id">) => Promise<void>;
};

export function InventoryPanel({ medicaments, onAdd }: Props) {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  const filtered = medicaments.filter((m) =>
    m.nomCommercial.toLowerCase().includes(search.toLowerCase()) ||
    (m.nomGenerique ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const handleSave = async (m: Omit<MedicamentAPI, "id">) => {
    setSaving(true);
    try {
      await onAdd(m);
      setShowAdd(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Search + add */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un médicament…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1A3072]"
            />
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2.5 rounded-xl text-white flex items-center gap-2"
            style={{ backgroundColor: "#1A3072" }}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ajouter</span>
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
            <p className="text-gray-500">
              {search ? "Aucun médicament trouvé" : "Catalogue vide — ajoutez un médicament"}
            </p>
          </div>
        ) : (
          filtered.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl p-4 border border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-900">{m.nomCommercial}</p>
                  {m.nomGenerique && (
                    <p className="text-xs text-gray-500 mt-0.5">Générique : {m.nomGenerique}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    {m.forme && <span className="bg-gray-100 px-2 py-0.5 rounded-full">{m.forme}</span>}
                    {m.dosage && <span className="bg-gray-100 px-2 py-0.5 rounded-full">{m.dosage}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAdd && (
        <InventoryEdit
          onClose={() => setShowAdd(false)}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
}
