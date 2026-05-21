import { useState } from "react";
import { Search, Phone, Mail, ChevronRight } from "lucide-react";
import type { PatientAPI } from "../lib/types";

type Props = {
  patients: PatientAPI[];
  loading?: boolean;
};

export function DoctorPatientsList({ patients, loading }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientAPI | null>(null);

  const filtered = patients.filter((p) =>
    `${p.prenom} ${p.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.telephone.includes(searchTerm),
  );

  if (selectedPatient) {
    return (
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 border-b border-red-100">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
              {selectedPatient.prenom.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{selectedPatient.prenom} {selectedPatient.nom}</h1>
              <p className="text-sm text-gray-600 mt-1">Dossier patient</p>
            </div>
            <button onClick={() => setSelectedPatient(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
              Retour
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">Informations de contact</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <a href={`tel:${selectedPatient.telephone}`} className="text-blue-600 hover:underline">
                  {selectedPatient.telephone}
                </a>
              </div>
              {selectedPatient.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <a href={`mailto:${selectedPatient.email}`} className="text-blue-600 hover:underline">
                    {selectedPatient.email}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par nom ou téléphone…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 outline-none"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-gray-500">Chargement…</div>
        ) : filtered.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filtered.map((p) => (
              <button key={p.id} onClick={() => setSelectedPatient(p)}
                className="w-full px-6 py-4 hover:bg-gray-50 transition text-left border-l-4 border-transparent hover:border-red-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold">
                      {p.prenom.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{p.prenom} {p.nom}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{p.telephone}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-gray-500">
              {searchTerm ? "Aucun patient trouvé" : "Aucun patient enregistré"}
            </p>
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="text-red-600 hover:underline text-sm mt-2">
                Réinitialiser
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
