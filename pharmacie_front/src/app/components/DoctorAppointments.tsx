import { useState } from "react";
import { Calendar, Clock, Phone, Check, X, ChevronRight, Plus } from "lucide-react";

interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  date: string;
  time: string;
  duration: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  reason: string;
  notes: string;
}

const STATUS_COLORS: Record<Appointment["status"], { bg: string; text: string }> = {
  pending:   { bg: "#FEF3C7", text: "#D97706" },
  confirmed: { bg: "#DCFCE7", text: "#16A34A" },
  completed: { bg: "#DBEAFE", text: "#0284C7" },
  cancelled: { bg: "#FEE2E2", text: "#DC2626" },
};

const STATUS_LABELS: Record<Appointment["status"], string> = {
  pending:   "En attente",
  confirmed: "Confirmé",
  completed: "Complété",
  cancelled: "Annulé",
};

export function DoctorAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | Appointment["status"]>("all");

  // Create form state
  const [newPatient, setNewPatient] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newReason, setNewReason] = useState("");

  const confirm = (id: string) =>
    setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: "confirmed" } : a));

  const cancel = (id: string) =>
    setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status: "cancelled" } : a));

  const createAppointment = () => {
    if (!newPatient.trim() || !newDate || !newTime) return;
    const apt: Appointment = {
      id: Date.now().toString(),
      patientName: newPatient,
      patientPhone: newPhone,
      date: new Date(newDate).toLocaleDateString("fr-FR"),
      time: newTime,
      duration: "30 min",
      status: "pending",
      reason: newReason || "Consultation",
      notes: "",
    };
    setAppointments((prev) => [apt, ...prev]);
    setNewPatient(""); setNewPhone(""); setNewDate(""); setNewTime(""); setNewReason("");
    setShowCreate(false);
  };

  const filtered = appointments.filter((a) => filterStatus === "all" || a.status === filterStatus);

  if (selected) {
    const colors = STATUS_COLORS[selected.status];
    return (
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-blue-100">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: colors.text }}>
              {selected.patientName.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{selected.patientName}</h1>
              <span className="inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: colors.bg, color: colors.text }}>
                {STATUS_LABELS[selected.status]}
              </span>
            </div>
            <button onClick={() => setSelected(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
              Retour
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold text-gray-900">{selected.date} à {selected.time} ({selected.duration})</p>
              </div>
            </div>
            {selected.patientPhone && (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-semibold text-gray-900">{selected.patientPhone}</p>
                </div>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600 mb-1">Motif</p>
              <p className="font-medium text-gray-900">{selected.reason}</p>
            </div>
          </div>

          {selected.status === "pending" && (
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { confirm(selected.id); setSelected(null); }}
                className="bg-green-600 text-white rounded-lg py-3 font-medium hover:bg-green-700 transition flex items-center justify-center gap-2">
                <Check className="w-5 h-5" /> Confirmer
              </button>
              <button onClick={() => { cancel(selected.id); setSelected(null); }}
                className="bg-red-600 text-white rounded-lg py-3 font-medium hover:bg-red-700 transition flex items-center justify-center gap-2">
                <X className="w-5 h-5" /> Annuler
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Filter & Create */}
      <div className="px-6 py-4 bg-white border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {(["all", "pending", "confirmed"] as const).map((f) => (
            <button key={f} onClick={() => setFilterStatus(f)}
              className={`px-4 py-2 rounded-lg font-medium transition text-sm ${
                filterStatus === f
                  ? f === "all" ? "bg-blue-600 text-white" : f === "pending" ? "bg-amber-600 text-white" : "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}>
              {f === "all" ? "Tous" : f === "pending" ? "En attente" : "Confirmés"}
            </button>
          ))}
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Créer RDV</span>
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-3">Nouveau rendez-vous</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" placeholder="Nom du patient *" value={newPatient} onChange={(e) => setNewPatient(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input type="tel" placeholder="Téléphone" value={newPhone} onChange={(e) => setNewPhone(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input type="text" placeholder="Motif de consultation" value={newReason} onChange={(e) => setNewReason(e.target.value)}
              className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div className="flex gap-3 mt-3">
            <button onClick={createAppointment} disabled={!newPatient.trim() || !newDate || !newTime}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm disabled:opacity-50">
              Créer
            </button>
            <button onClick={() => setShowCreate(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filtered.map((a) => {
              const colors = STATUS_COLORS[a.status];
              return (
                <button key={a.id} onClick={() => setSelected(a)}
                  className="w-full px-6 py-4 hover:bg-gray-50 transition text-left border-l-4 border-transparent hover:border-blue-600">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: colors.text }}>
                        {a.patientName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{a.patientName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{a.reason}</p>
                      </div>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <p className="text-xs text-gray-500">{a.date}</p>
                      <p className="text-sm font-semibold text-gray-900">{a.time}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 ml-2" />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-semibold px-2 py-1 rounded" style={{ backgroundColor: colors.bg, color: colors.text }}>
                      {STATUS_LABELS[a.status]}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {a.duration}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500">Aucun rendez-vous</p>
            <button onClick={() => setShowCreate(true)}
              className="mt-3 text-sm text-blue-600 hover:underline">
              Créer un premier RDV
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
