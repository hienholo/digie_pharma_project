import { useState } from "react";
import { Search, Plus, Phone, Mail, Calendar, FileText, ChevronRight, Pill } from "lucide-react";
import { mockPatients } from "../datamock/doctor.mock";
import type { Patient } from "../datamock/doctor.mock";

export function DoctorPatientsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const filteredPatients = mockPatients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  if (selectedPatient) {
    return (
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Patient Header */}
        <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 border-b border-red-100">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
              {selectedPatient.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{selectedPatient.name}</h1>
              <p className="text-sm text-gray-600 mt-1">Dossier médical</p>
            </div>
            <button
              onClick={() => setSelectedPatient(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Retour
            </button>
          </div>
        </div>

        {/* Patient Details */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Contact Info */}
          <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">Informations de contact</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <a href={`tel:${selectedPatient.phone}`} className="text-blue-600 hover:underline">
                  {selectedPatient.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <a href={`mailto:${selectedPatient.email}`} className="text-blue-600 hover:underline">
                  {selectedPatient.email}
                </a>
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">Historique médical</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Conditions</p>
                {selectedPatient.conditions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.conditions.map((condition) => (
                      <span
                        key={condition}
                        className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Aucune condition spécifique enregistrée</p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Médicaments actuels</p>
                <div className="flex flex-wrap gap-2">
                  {selectedPatient.medications.map((med) => (
                    <span
                      key={med}
                      className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                    >
                      <Pill className="w-4 h-4" />
                      {med}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Appointments */}
          <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">Rendez-vous</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Dernier RDV</p>
                  <p className="text-sm text-gray-600">{selectedPatient.lastVisit}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                <Calendar className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium text-gray-900">Prochain RDV</p>
                  <p className="text-sm text-gray-600">{selectedPatient.nextAppointment}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button className="bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 transition">
              <Calendar className="w-5 h-5 mx-auto mb-1" />
              Planifier RDV
            </button>
            <button className="bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition">
              <FileText className="w-5 h-5 mx-auto mb-1" />
              Ordonnance
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Search Bar */}
      <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un patient par nom ou numéro..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 outline-none"
        />
        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Ajouter</span>
        </button>
      </div>

      {/* Patients List */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-100">
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <button
                key={patient.id}
                onClick={() => setSelectedPatient(patient)}
                className="w-full px-6 py-4 hover:bg-gray-50 transition text-left border-l-4 border-transparent hover:border-red-600"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center font-bold">
                        {patient.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{patient.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{patient.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs text-gray-500">Dernier RDV</p>
                    <p className="text-sm font-medium text-gray-900">{patient.lastVisit}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {patient.conditions.slice(0, 2).map((condition) => (
                    <span key={condition} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">
                      {condition}
                    </span>
                  ))}
                  {patient.medications.length > 0 && (
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                      {patient.medications.length} médoc.
                    </span>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <p className="text-gray-500">Aucun patient trouvé</p>
              <button
                onClick={() => setSearchTerm("")}
                className="text-red-600 hover:underline text-sm mt-2"
              >
                Réinitialiser la recherche
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
