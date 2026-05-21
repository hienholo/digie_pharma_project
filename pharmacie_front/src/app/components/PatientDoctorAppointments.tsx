import { useState, useEffect } from "react";
import { Search, MapPin, Calendar, Clock, Check, ChevronRight, ChevronLeft } from "lucide-react";
import type { MedecinAPI } from "../lib/types";
import { medecinsApi } from "../lib/api";

interface TimeSlot { time: string; available: boolean; }

const TIME_SLOTS: TimeSlot[] = [
  { time: "08:00", available: true  },
  { time: "09:00", available: true  },
  { time: "10:00", available: true  },
  { time: "11:00", available: true  },
  { time: "12:00", available: true  },
  { time: "14:00", available: true  },
  { time: "15:00", available: true  },
  { time: "16:00", available: true  },
  { time: "17:00", available: true  },
];

const SPECIALITE_LABELS: Record<string, string> = {
  GENERALISTE: "Médecin généraliste",
  CARDIOLOGUE: "Cardiologue",
  DERMATOLOGUE: "Dermatologue",
  PEDIATRE: "Pédiatre",
  GYNECOLOGUE: "Gynécologue",
  OPHTALMOLOGUE: "Ophtalmologue",
  ORL: "ORL",
  PNEUMOLOGUE: "Pneumologue",
  NEUROLOGUE: "Neurologue",
  AUTRE: "Spécialiste",
};

export function PatientDoctorAppointments() {
  const [doctors, setDoctors] = useState<MedecinAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<MedecinAPI | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    medecinsApi.getAll()
      .then((all) => setDoctors(all.filter((d) => d.statut === "ACTIF")))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = doctors.filter((d) =>
    `Dr. ${d.prenom} ${d.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (SPECIALITE_LABELS[d.specialite] ?? d.specialite).toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getDaysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();

  const formatDate = (date: Date) =>
    date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

  const isDateDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateSelect = (day: number) => {
    if (!isDateDisabled(day)) {
      setSelectedDate(formatDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)));
    }
  };

  const handleConfirm = () => {
    if (selectedDate && selectedTime && selectedDoctor) {
      setConfirmed(true);
      setTimeout(() => {
        setConfirmed(false); setSelectedDoctor(null);
        setSelectedDate(""); setSelectedTime("");
      }, 3000);
    }
  };

  if (confirmed && selectedDoctor) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Rendez-vous confirmé !</h2>
          <div className="bg-blue-50 rounded-2xl p-4 text-left space-y-2 text-sm">
            <p><strong>Docteur :</strong> Dr. {selectedDoctor.prenom} {selectedDoctor.nom}</p>
            <p><strong>Spécialité :</strong> {SPECIALITE_LABELS[selectedDoctor.specialite] ?? selectedDoctor.specialite}</p>
            <p><strong>Date :</strong> {selectedDate} à {selectedTime}</p>
            {selectedDoctor.adresseCabinet && <p><strong>Cabinet :</strong> {selectedDoctor.adresseCabinet}</p>}
          </div>
          <p className="text-sm text-gray-500">Le médecin vous confirmera votre rendez-vous.</p>
        </div>
      </div>
    );
  }

  if (selectedDoctor && selectedDate) {
    return (
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-blue-200">
          <button onClick={() => { setSelectedDate(""); setSelectedTime(""); }}
            className="mb-4 text-blue-600 hover:underline font-medium flex items-center gap-1">
            ← Retour
          </button>
          <h1 className="text-xl font-bold text-gray-900">Dr. {selectedDoctor.prenom} {selectedDoctor.nom}</h1>
          <p className="text-sm text-gray-600 mt-1">{SPECIALITE_LABELS[selectedDoctor.specialite] ?? selectedDoctor.specialite}</p>
        </div>

        <div className="p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Sélectionnez une heure — {selectedDate}</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {TIME_SLOTS.map((slot) => (
              <button key={slot.time} onClick={() => setSelectedTime(slot.time)} disabled={!slot.available}
                className={`py-3 px-2 rounded-lg font-medium text-sm transition ${
                  selectedTime === slot.time
                    ? "bg-blue-600 text-white"
                    : slot.available
                    ? "border border-gray-300 text-gray-700 hover:border-blue-600"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}>
                {slot.time}
              </button>
            ))}
          </div>

          {selectedTime && (
            <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200 text-sm space-y-1">
              <p className="font-semibold text-gray-900 mb-2">Résumé du rendez-vous</p>
              <p><strong>Docteur :</strong> Dr. {selectedDoctor.prenom} {selectedDoctor.nom}</p>
              <p><strong>Date :</strong> {selectedDate} à {selectedTime}</p>
              {selectedDoctor.adresseCabinet && <p><strong>Cabinet :</strong> {selectedDoctor.adresseCabinet}</p>}
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button onClick={() => { setSelectedDate(""); setSelectedTime(""); }}
              className="px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition">
              Annuler
            </button>
            <button onClick={handleConfirm} disabled={!selectedTime}
              className="px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
              Confirmer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedDoctor) {
    const firstDay = (getFirstDayOfMonth(currentMonth) + 6) % 7;
    const daysInMonth = getDaysInMonth(currentMonth);

    return (
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-blue-200">
          <button onClick={() => setSelectedDoctor(null)}
            className="mb-4 text-blue-600 hover:underline font-medium">
            ← Retour aux médecins
          </button>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
              {selectedDoctor.prenom.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dr. {selectedDoctor.prenom} {selectedDoctor.nom}</h1>
              <p className="text-sm text-gray-600 mt-1">{SPECIALITE_LABELS[selectedDoctor.specialite] ?? selectedDoctor.specialite}</p>
              {selectedDoctor.adresseCabinet && (
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {selectedDoctor.adresseCabinet}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <label className="text-sm text-gray-700 font-medium block mb-3">Sélectionnez une date</label>

          <div className="flex items-center justify-between mb-4 bg-white rounded-xl p-4 border border-gray-200">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h3 className="font-semibold text-gray-900">
              {currentMonth.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
            </h3>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-gray-500 py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`e-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const disabled = isDateDisabled(day);
                const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                const dateStr = formatDate(date);
                const isSelected = selectedDate === dateStr;
                const isToday = new Date().toDateString() === date.toDateString();
                return (
                  <button key={day} onClick={() => handleDateSelect(day)} disabled={disabled}
                    className={`aspect-square rounded-lg font-medium text-sm transition flex items-center justify-center ${
                      isSelected ? "bg-blue-600 text-white"
                        : isToday ? "bg-blue-100 text-blue-700 border border-blue-300"
                        : disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "border border-gray-200 text-gray-700 hover:bg-blue-50"
                    }`}>
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Chercher un médecin</h2>
        <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2.5">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Spécialité, nom du médecin…"
            className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-12 text-gray-500">Chargement…</div>
        ) : filtered.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filtered.map((d) => (
              <button key={d.id} onClick={() => setSelectedDoctor(d)}
                className="w-full px-4 py-4 hover:bg-gray-50 transition text-left border-l-4 border-transparent hover:border-blue-600">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold shrink-0">
                    {d.prenom.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">Dr. {d.prenom} {d.nom}</h3>
                    <p className="text-sm text-gray-600 mt-0.5">{SPECIALITE_LABELS[d.specialite] ?? d.specialite}</p>
                    {d.adresseCabinet && (
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {d.adresseCabinet}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-2 text-xs text-blue-600 font-medium">
                      <Clock className="w-3 h-3" /> Sur rendez-vous
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500">Aucun médecin disponible</p>
          </div>
        )}
      </div>
    </div>
  );
}
