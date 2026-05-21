import { useState, useEffect } from "react";
import { Plus, X, Check, Pill, Search, User } from "lucide-react";
import type { PatientAPI, MedicamentAPI, OrdonnanceNumeriqueAPI } from "../lib/types";
import { medicamentsApi, ordonnancesNumeriquesApi } from "../lib/api";

interface LigneForme {
  tempId: string;
  medicament: MedicamentAPI;
  quantite: number;
  posologie: string;
  duree: string;
  instructions: string;
}

type Props = {
  medecinId: string;
  patients: PatientAPI[];
  onClose: () => void;
  onCreated: (o: OrdonnanceNumeriqueAPI) => void;
};

export function DoctorPrescriptionForm({ medecinId, patients, onClose, onCreated }: Props) {
  const [medicaments, setMedicaments] = useState<MedicamentAPI[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientAPI | null>(null);
  const [patientSearch, setPatientSearch] = useState("");
  const [showPatientDrop, setShowPatientDrop] = useState(false);
  const [lignes, setLignes] = useState<LigneForme[]>([]);

  const [medSearch, setMedSearch] = useState("");
  const [showMedDrop, setShowMedDrop] = useState(false);
  const [selectedMed, setSelectedMed] = useState<MedicamentAPI | null>(null);
  const [quantite, setQuantite] = useState(1);
  const [posologie, setPosologie] = useState("");
  const [duree, setDuree] = useState("7 jours");
  const [instructions, setInstructions] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    medicamentsApi.list().then(setMedicaments).catch(console.error);
  }, []);

  const filteredPatients = patients.filter((p) =>
    `${p.prenom} ${p.nom}`.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.telephone.includes(patientSearch),
  );

  const filteredMeds = medicaments.filter((m) =>
    m.nomCommercial.toLowerCase().includes(medSearch.toLowerCase()) ||
    (m.nomGenerique ?? "").toLowerCase().includes(medSearch.toLowerCase()),
  );

  const addLigne = () => {
    if (!selectedMed) return;
    setLignes((prev) => [...prev, {
      tempId: Date.now().toString(),
      medicament: selectedMed,
      quantite,
      posologie,
      duree,
      instructions,
    }]);
    setSelectedMed(null);
    setMedSearch("");
    setQuantite(1);
    setPosologie("");
    setDuree("7 jours");
    setInstructions("");
  };

  const removeLigne = (tempId: string) => setLignes((prev) => prev.filter((l) => l.tempId !== tempId));

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPatient) { setError("Sélectionnez un patient"); return; }
    if (lignes.length === 0) { setError("Ajoutez au moins un médicament"); return; }
    setError(null);
    setSubmitting(true);
    try {
      const result = await ordonnancesNumeriquesApi.rediger({
        medecinId,
        patientId: selectedPatient.id,
        lignes: lignes.map((l) => ({
          medicamentId: l.medicament.id,
          quantite: l.quantite,
          posologie: l.posologie || undefined,
          duree: l.duree || undefined,
          instructions: l.instructions || undefined,
        })),
      });
      onCreated(result);
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose(); }, 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Ordonnance créée !</h2>
          <p className="text-gray-600">L'ordonnance a été envoyée au patient {selectedPatient?.prenom} {selectedPatient?.nom}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto">

        {/* Patient */}
        <div className="px-6 py-4 bg-white border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-3">Patient *</h2>
          {selectedPatient ? (
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-200">
              <div className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                {selectedPatient.prenom.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{selectedPatient.prenom} {selectedPatient.nom}</p>
                <p className="text-xs text-gray-500">{selectedPatient.telephone}</p>
              </div>
              <button type="button" onClick={() => setSelectedPatient(null)}
                className="p-1 hover:bg-red-100 rounded-full">
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl">
                <User className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={patientSearch}
                  onChange={(e) => { setPatientSearch(e.target.value); setShowPatientDrop(true); }}
                  onFocus={() => setShowPatientDrop(true)}
                  placeholder="Rechercher un patient par nom ou téléphone…"
                  className="flex-1 bg-transparent outline-none text-sm"
                />
              </div>
              {showPatientDrop && filteredPatients.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                  {filteredPatients.map((p) => (
                    <button key={p.id} type="button"
                      onClick={() => { setSelectedPatient(p); setPatientSearch(""); setShowPatientDrop(false); }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-0">
                      <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold text-sm">
                        {p.prenom.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{p.prenom} {p.nom}</p>
                        <p className="text-xs text-gray-500">{p.telephone}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ajouter médicament */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-3">Ajouter un médicament</h2>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 space-y-3">
            {/* Médicament search */}
            <div className="relative">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={selectedMed ? selectedMed.nomCommercial : medSearch}
                  onChange={(e) => { setMedSearch(e.target.value); setSelectedMed(null); setShowMedDrop(true); }}
                  onFocus={() => setShowMedDrop(true)}
                  placeholder="Saisir un médicament…"
                  className="flex-1 bg-transparent outline-none text-sm"
                />
                {selectedMed && (
                  <button type="button" onClick={() => { setSelectedMed(null); setMedSearch(""); }}
                    className="p-1 hover:bg-gray-100 rounded-full">
                    <X className="w-3 h-3 text-gray-500" />
                  </button>
                )}
              </div>
              {showMedDrop && !selectedMed && filteredMeds.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                  {filteredMeds.map((m) => (
                    <button key={m.id} type="button"
                      onClick={() => { setSelectedMed(m); setMedSearch(""); setShowMedDrop(false); }}
                      className="w-full px-4 py-2.5 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0">
                      <p className="text-sm font-medium text-gray-900">{m.nomCommercial}</p>
                      <p className="text-xs text-gray-500">{m.dosage} {m.forme}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Quantité</label>
                <input type="number" min={1} value={quantite}
                  onChange={(e) => setQuantite(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Durée</label>
                <input type="text" value={duree}
                  onChange={(e) => setDuree(e.target.value)}
                  placeholder="Ex : 7 jours"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:border-blue-500" />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Posologie</label>
              <input type="text" value={posologie}
                onChange={(e) => setPosologie(e.target.value)}
                placeholder="Ex : 1 comprimé matin et soir"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:border-blue-500" />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Instructions</label>
              <input type="text" value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Ex : À prendre pendant les repas"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:border-blue-500" />
            </div>

            <button type="button" onClick={addLigne} disabled={!selectedMed}
              className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Ajouter ce médicament
            </button>
          </div>
        </div>

        {/* Lignes ajoutées */}
        {lignes.length > 0 && (
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-3">Médicaments ({lignes.length})</h2>
            <div className="space-y-2">
              {lignes.map((l) => (
                <div key={l.tempId} className="bg-white rounded-xl p-3 border border-gray-200 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                    <Pill className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{l.medicament.nomCommercial}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">qté : {l.quantite}</span>
                      {l.posologie && <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{l.posologie}</span>}
                      {l.duree && <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{l.duree}</span>}
                    </div>
                  </div>
                  <button type="button" onClick={() => removeLigne(l.tempId)}
                    className="p-1.5 hover:bg-red-50 rounded-lg transition">
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm text-center">{error}</div>
        )}

        {/* Actions */}
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex gap-3 sticky bottom-0 mt-auto">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition">
            Annuler
          </button>
          <button type="submit" disabled={submitting}
            className="flex-1 px-4 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 disabled:opacity-60 transition flex items-center justify-center gap-2">
            <Check className="w-5 h-5" />
            {submitting ? "Envoi…" : "Créer l'ordonnance"}
          </button>
        </div>
      </form>
    </div>
  );
}
