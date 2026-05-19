import { useState } from "react";
import { Calendar, Clock, User, Check, X, ChevronRight, Plus, MapPin, Phone } from "lucide-react";
import { mockAppointments } from "../datamock/doctor.mock";
import type { Appointment } from "../datamock/doctor.mock";

export function DoctorAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "confirmed">("all");

  const handleConfirmAppointment = (id: string) => {
    setAppointments(appointments.map((apt) =>
      apt.id === id ? { ...apt, status: "confirmed" as const } : apt
    ));
  };

  const handleCancelAppointment = (id: string) => {
    setAppointments(appointments.map((apt) =>
      apt.id === id ? { ...apt, status: "cancelled" as const } : apt
    ));
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filterStatus === "all") return true;
    return apt.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return { bg: "#FEF3C7", text: "#D97706" };
      case "confirmed":
        return { bg: "#DCFCE7", text: "#16A34A" };
      case "completed":
        return { bg: "#DBEAFE", text: "#0284C7" };
      case "cancelled":
        return { bg: "#FEE2E2", text: "#DC2626" };
      default:
        return { bg: "#F3F4F6", text: "#6B7280" };
    }
  };

  if (selectedAppointment) {
    const colors = getStatusColor(selectedAppointment.status);
    return (
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-blue-100">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: colors.bg }}>
              {selectedAppointment.patientName.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{selectedAppointment.patientName}</h1>
              <p className="text-sm text-gray-600 mt-1">Détails du rendez-vous</p>
            </div>
            <button
              onClick={() => setSelectedAppointment(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Retour
            </button>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Status Badge */}
          <div className="mb-6">
            <span
              className="px-4 py-2 rounded-full text-sm font-semibold"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              {selectedAppointment.status === "pending" && "En attente de confirmation"}
              {selectedAppointment.status === "confirmed" && "Confirmé"}
              {selectedAppointment.status === "completed" && "Complété"}
              {selectedAppointment.status === "cancelled" && "Annulé"}
            </span>
          </div>

          {/* Appointment Info */}
          <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">Informations</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold text-gray-900">{selectedAppointment.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Heure</p>
                  <p className="font-semibold text-gray-900">
                    {selectedAppointment.time} ({selectedAppointment.duration})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Contact</p>
                  <p className="font-semibold text-gray-900">{selectedAppointment.patientPhone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reason & Notes */}
          <div className="bg-white rounded-2xl p-6 mb-6 border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">Détails</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Motif de la consultation</p>
                <p className="font-medium text-gray-900">{selectedAppointment.reason}</p>
              </div>
              {selectedAppointment.notes && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Notes</p>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedAppointment.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {selectedAppointment.status === "pending" && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => {
                  handleConfirmAppointment(selectedAppointment.id);
                  setSelectedAppointment(null);
                }}
                className="bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                Confirmer
              </button>
              <button
                onClick={() => {
                  handleCancelAppointment(selectedAppointment.id);
                  setSelectedAppointment(null);
                }}
                className="bg-red-600 text-white rounded-lg py-3 font-medium hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Annuler
              </button>
            </div>
          )}

          {selectedAppointment.status === "confirmed" && (
            <button className="w-full bg-blue-600 text-white rounded-lg py-3 font-medium hover:bg-blue-700 transition">
              Voir le dossier du patient
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Filter & Create */}
      <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === "pending"
                ? "bg-amber-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            En attente
          </button>
          <button
            onClick={() => setFilterStatus("confirmed")}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === "confirmed"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Confirmés
          </button>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Créer RDV</span>
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-4">Créer un nouveau rendez-vous</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Nom du patient" className="px-3 py-2 border border-gray-300 rounded-lg" />
            <input type="date" className="px-3 py-2 border border-gray-300 rounded-lg" />
            <input type="time" className="px-3 py-2 border border-gray-300 rounded-lg" />
            <input type="text" placeholder="Motif de consultation" className="px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="flex gap-3 mt-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Créer
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Appointments List */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-100">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map((appointment) => {
              const colors = getStatusColor(appointment.status);
              return (
                <button
                  key={appointment.id}
                  onClick={() => setSelectedAppointment(appointment)}
                  className="w-full px-6 py-4 hover:bg-gray-50 transition text-left border-l-4 border-transparent hover:border-blue-600"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: colors.text }}>
                          {appointment.patientName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{appointment.patientName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{appointment.reason}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xs text-gray-500">{appointment.date}</p>
                      <p className="text-sm font-semibold text-gray-900">{appointment.time}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
                  </div>

                  {/* Status & Duration */}
                  <div className="flex items-center gap-2 mt-3">
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      {appointment.status === "pending" && "En attente"}
                      {appointment.status === "confirmed" && "Confirmé"}
                      {appointment.status === "completed" && "Complété"}
                      {appointment.status === "cancelled" && "Annulé"}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {appointment.duration}
                    </span>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500">Aucun rendez-vous trouvé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
