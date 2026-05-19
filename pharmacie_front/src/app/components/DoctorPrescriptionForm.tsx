import { useState } from "react";
import { Plus, X, Check, ChevronDown, Pill } from "lucide-react";

interface PrescriptionMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface Props {
  onClose: () => void;
}

const commonMedications = [
  "Doliprane 500mg",
  "Amoxicilline 500mg",
  "Lisinopril",
  "Metformine",
  "Albuterol",
  "Fluticasone",
  "Atorvastatine",
  "Vitamine D3",
];

const frequencies = ["Une fois par jour", "Deux fois par jour", "Trois fois par jour", "Quatre fois par jour", "Au besoin"];

export function DoctorPrescriptionForm({ onClose }: Props) {
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [medications, setMedications] = useState<PrescriptionMedication[]>([]);
  const [notes, setNotes] = useState("");
  const [newMedName, setNewMedName] = useState("");
  const [newMedDosage, setNewMedDosage] = useState("");
  const [newMedFrequency, setNewMedFrequency] = useState(frequencies[0]);
  const [newMedDuration, setNewMedDuration] = useState("7 jours");
  const [showMedDropdown, setShowMedDropdown] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addMedication = () => {
    const newErrors: Record<string, string> = {};

    if (!newMedName) newErrors.medName = "Nom du médicament requis";
    if (!newMedDosage) newErrors.dosage = "Dosage requis";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newMed: PrescriptionMedication = {
      id: Date.now().toString(),
      name: newMedName,
      dosage: newMedDosage,
      frequency: newMedFrequency,
      duration: newMedDuration,
    };

    setMedications([...medications, newMed]);
    setNewMedName("");
    setNewMedDosage("");
    setNewMedFrequency(frequencies[0]);
    setNewMedDuration("7 jours");
    setErrors({});
  };

  const removeMedication = (id: string) => {
    setMedications(medications.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!patientName) newErrors.patientName = "Nom du patient requis";
    if (!patientEmail) newErrors.patientEmail = "Email du patient requis";
    if (medications.length === 0) newErrors.medications = "Ajoutez au moins un médicament";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Simulate prescription submission
    console.log({
      patientName,
      patientPhone,
      patientEmail,
      medications,
      notes,
      createdAt: new Date().toISOString(),
    });

    // Show success and reset
    alert("Ordonnance créée avec succès et envoyée au patient!");
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setPatientName("");
    setPatientPhone("");
    setPatientEmail("");
    setMedications([]);
    setNotes("");
    setErrors({});
  };

  const handleSelectMedication = (med: string) => {
    setNewMedName(med);
    setShowMedDropdown(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto">
        {/* Patient Information */}
        <div className="px-6 py-4 bg-white border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Informations du patient</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700 font-medium block mb-2">
                Nom du patient *
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Ex: Jean Dupont"
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.patientName ? "border-red-500" : "border-gray-300"
                } bg-white focus:outline-none focus:border-blue-500`}
              />
              {errors.patientName && <p className="text-red-600 text-xs mt-1">{errors.patientName}</p>}
            </div>

            <div>
              <label className="text-sm text-gray-700 font-medium block mb-2">Téléphone</label>
              <input
                type="tel"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="Ex: +225 07 12 34 56 78"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-gray-700 font-medium block mb-2">
                Email *
              </label>
              <input
                type="email"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                placeholder="Ex: jean@email.com"
                className={`w-full px-4 py-2 rounded-lg border ${
                  errors.patientEmail ? "border-red-500" : "border-gray-300"
                } bg-white focus:outline-none focus:border-blue-500`}
              />
              {errors.patientEmail && <p className="text-red-600 text-xs mt-1">{errors.patientEmail}</p>}
            </div>
          </div>
        </div>

        {/* Medications */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Médicaments</h2>
            {errors.medications && <p className="text-red-600 text-xs">{errors.medications}</p>}
          </div>

          {/* Add Medication Section */}
          <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-200">
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-700 font-medium block mb-2">Médicament</label>
                <div className="relative">
                  <input
                    type="text"
                    value={newMedName}
                    onChange={(e) => {
                      setNewMedName(e.target.value);
                      setShowMedDropdown(true);
                    }}
                    onFocus={() => setShowMedDropdown(true)}
                    placeholder="Saisir ou sélectionner un médicament"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-blue-500"
                  />
                  {showMedDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                      {commonMedications
                        .filter((med) =>
                          med.toLowerCase().includes(newMedName.toLowerCase())
                        )
                        .map((med) => (
                          <button
                            key={med}
                            type="button"
                            onClick={() => handleSelectMedication(med)}
                            className="w-full px-4 py-2 text-left hover:bg-blue-50 transition"
                          >
                            {med}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
                {errors.medName && <p className="text-red-600 text-xs mt-1">{errors.medName}</p>}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-sm text-gray-700 font-medium block mb-2">Dosage *</label>
                  <input
                    type="text"
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    placeholder="Ex: 500mg"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      errors.dosage ? "border-red-500" : "border-gray-300"
                    } bg-white focus:outline-none focus:border-blue-500`}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-700 font-medium block mb-2">Fréquence</label>
                  <select
                    value={newMedFrequency}
                    onChange={(e) => setNewMedFrequency(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-blue-500"
                  >
                    {frequencies.map((freq) => (
                      <option key={freq} value={freq}>
                        {freq}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-700 font-medium block mb-2">Durée</label>
                  <input
                    type="text"
                    value={newMedDuration}
                    onChange={(e) => setNewMedDuration(e.target.value)}
                    placeholder="Ex: 7 jours"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={addMedication}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter le médicament
              </button>
            </div>
          </div>

          {/* Medications List */}
          {medications.length > 0 && (
            <div className="space-y-2">
              {medications.map((med) => (
                <div key={med.id} className="bg-white rounded-lg p-4 border border-gray-200 flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                      <Pill className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{med.name}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {med.dosage}
                        </span>
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {med.frequency}
                        </span>
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {med.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMedication(med.id)}
                    className="ml-2 p-2 hover:bg-red-50 rounded-lg transition"
                  >
                    <X className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="px-6 py-4 border-b border-gray-100">
          <label className="text-sm text-gray-700 font-medium block mb-2">Notes supplémentaires</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: À prendre avec les repas, Éviter l'alcool, etc."
            rows={4}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex gap-3 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            Créer et envoyer
          </button>
        </div>
      </form>
    </div>
  );
}
