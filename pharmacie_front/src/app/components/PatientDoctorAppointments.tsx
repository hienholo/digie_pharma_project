import { useState, useEffect } from "react";
import { Search, MapPin, Calendar, Clock, Check, ChevronRight, ChevronLeft, AlertCircle } from "lucide-react";
import type { MedecinAPI, RendezVousAPI } from "../lib/types";
import { medecinsApi, rendezVousApi, session } from "../lib/api";

interface TimeSlot { time: string; }

const TIME_SLOTS: TimeSlot[] = [
  { time: "08:00" }, { time: "09:00" }, { time: "10:00" }, { time: "11:00" },
  { time: "12:00" }, { time: "14:00" }, { time: "15:00" }, { time: "16:00" }, { time: "17:00" },
];

const SPECIALITE_LABELS: Record<string, string> = {
  GENERALISTE: "Médecin généraliste", CARDIOLOGUE: "Cardiologue",
  DERMATOLOGUE: "Dermatologue",       PEDIATRE: "Pédiatre",
  GYNECOLOGUE: "Gynécologue",         OPHTALMOLOGUE: "Ophtalmologue",
  ORL: "ORL",                         PNEUMOLOGUE: "Pneumologue",
  NEUROLOGUE: "Neurologue",           AUTRE: "Spécialiste",
};

export function PatientDoctorAppointments() {
  const patientId = session.getUserId();

  const [doctors, setDoctors]           = useState<MedecinAPI[]>([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<MedecinAPI | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [motif, setMotif]               = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [submitError, setSubmitError]   = useState<string | null>(null);
  const [confirmed, setConfirmed]       = useState<RendezVousAPI | null>(null);

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

  // ── Calendrier ──────────────────────────────────────────────────────────────
  const daysInMonth    = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = (new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() + 6) % 7;

  const formatDate = (d: Date) =>
    d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

  const isDisabled = (day: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return d < today;
  };

  const isoDate = (day: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
  };

  // ── Confirmation ─────────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime || !selectedDoctor || !patientId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const rdv = await rendezVousApi.creer({
        patientId,
        medecinId: selectedDoctor.id,
        dateRdv: selectedDate,      // "YYYY-MM-DD"
        heure: selectedTime,
        motif: motif || undefined,
      });
      setConfirmed(rdv);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Erreur lors de la prise de RDV");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Écran succès ─────────────────────────────────────────────────────────────
  if (confirmed && selectedDoctor) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Rendez-vous pris !</h2>
          <div className="bg-blue-50 rounded-2xl p-4 text-left space-y-2 text-sm">
            <p><strong>Médecin :</strong> Dr. {confirmed.medecinPrenom} {confirmed.medecinNom}</p>
            <p><strong>Spécialité :</strong> {SPECIALITE_LABELS[confirmed.medecinSpecialite] ?? confirmed.medecinSpecialite}</p>
            <p><strong>Date :</strong> {formatDate(new Date(confirmed.dateRdv))} à {confirmed.heure}</p>
            {confirmed.medecinAdresse && <p><strong>Cabinet :</strong> {confirmed.medecinAdresse}</p>}
            {confirmed.motif && <p><strong>Motif :</strong> {confirmed.motif}</p>}
          </div>
          <p className="text-sm text-gray-500">Le médecin confirmera votre rendez-vous prochainement.</p>
          <button
            onClick={() => { setConfirmed(null); setSelectedDoctor(null); setSelectedDate(""); setSelectedTime(""); setMotif(""); }}
            className="w-full py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition text-sm font-medium">
            Prendre un autre RDV
          </button>
        </div>
      </div>
    );
  }

  // ── Sélection heure + motif ───────────────────────────────────────────────────
  if (selectedDoctor && selectedDate) {
    return (
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-blue-200">
          <button onClick={() => { setSelectedDate(""); setSelectedTime(""); setSubmitError(null); }}
            className="mb-4 text-blue-600 hover:underline font-medium flex items-center gap-1 text-sm">
            ← Retour au calendrier
          </button>
          <p className="font-semibold text-gray-900">Dr. {selectedDoctor.prenom} {selectedDoctor.nom}</p>
          <p className="text-sm text-gray-600">{formatDate(new Date(selectedDate))}</p>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <h2 className="font-semibold text-gray-900 mb-3">Choisir une heure</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {TIME_SLOTS.map((s) => (
                <button key={s.time} onClick={() => setSelectedTime(s.time)}
                  className={`py-3 px-2 rounded-xl font-medium text-sm transition border ${
                    selectedTime === s.time
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50"
                  }`}>
                  {s.time}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Motif (facultatif)</label>
            <textarea value={motif} onChange={(e) => setMotif(e.target.value)}
              placeholder="Ex : Consultation générale, renouvellement ordonnance…"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-blue-500 resize-none" />
          </div>

          {selectedTime && (
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 text-sm space-y-1">
              <p className="font-semibold text-gray-900 mb-1">Résumé</p>
              <p><strong>Médecin :</strong> Dr. {selectedDoctor.prenom} {selectedDoctor.nom}</p>
              <p><strong>Date :</strong> {formatDate(new Date(selectedDate))} à {selectedTime}</p>
              {selectedDoctor.adresseCabinet && <p><strong>Cabinet :</strong> {selectedDoctor.adresseCabinet}</p>}
            </div>
          )}

          {submitError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { setSelectedDate(""); setSelectedTime(""); }}
              className="px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition text-sm">
              Annuler
            </button>
            <button onClick={handleConfirm} disabled={!selectedTime || submitting}
              className="px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition text-sm">
              {submitting ? "Envoi…" : "Confirmer le RDV"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Calendrier ───────────────────────────────────────────────────────────────
  if (selectedDoctor) {
    return (
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-blue-200">
          <button onClick={() => setSelectedDoctor(null)}
            className="mb-4 text-blue-600 hover:underline font-medium text-sm">
            ← Retour aux médecins
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
              {selectedDoctor.prenom.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dr. {selectedDoctor.prenom} {selectedDoctor.nom}</h1>
              <p className="text-sm text-gray-600">{SPECIALITE_LABELS[selectedDoctor.specialite] ?? selectedDoctor.specialite}</p>
              {selectedDoctor.adresseCabinet && (
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> {selectedDoctor.adresseCabinet}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          <label className="text-sm font-medium text-gray-700 block mb-3">Choisir une date</label>

          <div className="flex items-center justify-between mb-3 bg-white rounded-xl p-3 border border-gray-200">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="font-semibold text-gray-900 capitalize">
              {currentMonth.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
            </span>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="grid grid-cols-7 mb-1">
              {["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"].map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const disabled = isDisabled(day);
                const iso = isoDate(day);
                const isSelected = selectedDate === iso;
                const isToday = new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
                return (
                  <button key={day} onClick={() => !disabled && setSelectedDate(iso)} disabled={disabled}
                    className={`aspect-square rounded-lg text-sm font-medium transition flex items-center justify-center ${
                      isSelected ? "bg-blue-600 text-white"
                        : isToday ? "bg-blue-100 text-blue-700 border border-blue-300"
                        : disabled ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-700 hover:bg-blue-50 border border-transparent hover:border-blue-200"
                    }`}>
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedDate && (
            <p className="mt-3 text-sm text-blue-700 bg-blue-50 px-4 py-2 rounded-lg">
              Date sélectionnée : <strong>{formatDate(new Date(selectedDate))}</strong>
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Liste médecins ───────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Prendre rendez-vous</h2>
        <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2.5">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Spécialité ou nom du médecin…"
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
                    <div className="flex items-center gap-1 mt-1.5 text-xs text-blue-600 font-medium">
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
