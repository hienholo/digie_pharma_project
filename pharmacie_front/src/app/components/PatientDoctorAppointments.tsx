import { useState, useEffect } from "react";
import { Search, MapPin, Calendar, Clock, ChevronRight, ChevronLeft, AlertCircle, RefreshCw } from "lucide-react";
import type { MedecinAPI, RendezVousAPI } from "../lib/types";
import { medecinsApi, rendezVousApi } from "../lib/api";

type Props = { patientId: string };

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

const STATUT_COLORS: Record<string, { bg: string; text: string }> = {
  EN_ATTENTE: { bg: "#FEF3C7", text: "#D97706" },
  CONFIRME:   { bg: "#DCFCE7", text: "#16A34A" },
  COMPLETE:   { bg: "#DBEAFE", text: "#0284C7" },
  ANNULE:     { bg: "#FEE2E2", text: "#DC2626" },
};
const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente", CONFIRME: "Confirmé",
  COMPLETE: "Complété",    ANNULE: "Annulé",
};

export function PatientDoctorAppointments({ patientId }: Props) {
  const [activeTab, setActiveTab] = useState<"book" | "list">("list");

  // ── Mes RDV ──────────────────────────────────────────────────────────────────
  const [mesRdvs, setMesRdvs]   = useState<RendezVousAPI[]>([]);
  const [rdvLoading, setRdvLoading] = useState(false);

  const loadMesRdvs = () => {
    if (!patientId) return;
    setRdvLoading(true);
    rendezVousApi.getByPatient(patientId)
      .then(setMesRdvs)
      .catch(console.error)
      .finally(() => setRdvLoading(false));
  };

  useEffect(() => { loadMesRdvs(); }, [patientId]);

  // ── Réservation ───────────────────────────────────────────────────────────────
  const [doctors, setDoctors]           = useState<MedecinAPI[]>([]);
  const [docLoading, setDocLoading]     = useState(true);
  const [searchTerm, setSearchTerm]     = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<MedecinAPI | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [motif, setMotif]               = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [submitError, setSubmitError]   = useState<string | null>(null);

  useEffect(() => {
    medecinsApi.getAll()
      .then((all) => setDoctors(all.filter((d) => d.statut === "ACTIF")))
      .catch(console.error)
      .finally(() => setDocLoading(false));
  }, []);

  const filteredDoctors = doctors.filter((d) =>
    `Dr. ${d.prenom} ${d.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (SPECIALITE_LABELS[d.specialite] ?? d.specialite).toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // ── Calendrier helpers ────────────────────────────────────────────────────────
  const daysInMonth    = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = (new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() + 6) % 7;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const formatDateShort = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

  const isoDate = (day: number) =>
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toISOString().slice(0, 10);

  const isDisabled = (day: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return d < today;
  };

  // ── Confirmer la réservation ──────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime || !selectedDoctor || !patientId) return;
    setSubmitting(true); setSubmitError(null);
    try {
      const rdv = await rendezVousApi.creer({
        patientId,
        medecinId: selectedDoctor.id,
        dateRdv: selectedDate,
        heure: selectedTime,
        motif: motif || undefined,
      });
      setMesRdvs((prev) => [rdv, ...prev]);
      // Reset booking form et aller sur "Mes RDV"
      setSelectedDoctor(null); setSelectedDate(""); setSelectedTime(""); setMotif("");
      setActiveTab("list");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Erreur lors de la prise de RDV");
    } finally {
      setSubmitting(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // ONGLET : MES RDV
  // ────────────────────────────────────────────────────────────────────────────
  const renderListTab = () => (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between">
        <p className="font-semibold text-gray-900 text-sm">
          {mesRdvs.length > 0 ? `${mesRdvs.length} rendez-vous` : "Mes rendez-vous"}
        </p>
        <button onClick={loadMesRdvs} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-400">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {rdvLoading ? (
          <div className="flex items-center justify-center p-12 text-gray-500">Chargement…</div>
        ) : mesRdvs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-gray-500">Aucun rendez-vous</p>
            <button onClick={() => setActiveTab("book")}
              className="mt-3 text-sm text-blue-600 hover:underline font-medium">
              Prendre un rendez-vous
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {mesRdvs.map((r) => {
              const colors = STATUT_COLORS[r.statut] ?? STATUT_COLORS.EN_ATTENTE;
              return (
                <div key={r.id} className="px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold shrink-0">
                      {r.medecinPrenom.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">Dr. {r.medecinPrenom} {r.medecinNom}</p>
                      <p className="text-xs text-gray-500">{SPECIALITE_LABELS[r.medecinSpecialite] ?? r.medecinSpecialite}</p>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDateShort(r.dateRdv)}
                        </span>
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {r.heure}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: colors.bg, color: colors.text }}>
                          {STATUT_LABELS[r.statut]}
                        </span>
                      </div>
                      {r.motif && (
                        <p className="text-xs text-gray-500 mt-1 italic">"{r.motif}"</p>
                      )}
                      {r.medecinAdresse && (
                        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {r.medecinAdresse}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // ────────────────────────────────────────────────────────────────────────────
  // ONGLET : RÉSERVER — heure + motif
  // ────────────────────────────────────────────────────────────────────────────
  if (selectedDoctor && selectedDate) {
    return (
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 border-b border-blue-200">
          <button onClick={() => { setSelectedDate(""); setSelectedTime(""); setSubmitError(null); }}
            className="mb-3 text-blue-600 hover:underline font-medium flex items-center gap-1 text-sm">
            ← Retour au calendrier
          </button>
          <p className="font-semibold text-gray-900">Dr. {selectedDoctor.prenom} {selectedDoctor.nom}</p>
          <p className="text-sm text-gray-600">{formatDate(selectedDate)}</p>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <h2 className="font-semibold text-gray-900 mb-3">Choisir une heure</h2>
            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map((s) => (
                <button key={s.time} onClick={() => setSelectedTime(s.time)}
                  className={`py-3 rounded-xl font-medium text-sm transition border ${
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
              placeholder="Ex : Consultation, renouvellement ordonnance…"
              rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-blue-500 resize-none" />
          </div>

          {selectedTime && (
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-sm">
              <p className="font-medium text-gray-900">Dr. {selectedDoctor.prenom} {selectedDoctor.nom}</p>
              <p className="text-gray-600">{formatDate(selectedDate)} à {selectedTime}</p>
            </div>
          )}

          {submitError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" /> {submitError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { setSelectedDate(""); setSelectedTime(""); }}
              className="py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition text-sm">
              Annuler
            </button>
            <button onClick={handleConfirm} disabled={!selectedTime || submitting}
              className="py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition text-sm">
              {submitting ? "Envoi…" : "Confirmer"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ONGLET : RÉSERVER — calendrier
  // ────────────────────────────────────────────────────────────────────────────
  if (selectedDoctor) {
    return (
      <div className="flex-1 flex flex-col overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 border-b border-blue-200">
          <button onClick={() => setSelectedDoctor(null)}
            className="mb-3 text-blue-600 hover:underline font-medium text-sm">
            ← Retour aux médecins
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
              {selectedDoctor.prenom.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-gray-900">Dr. {selectedDoctor.prenom} {selectedDoctor.nom}</p>
              <p className="text-sm text-gray-600">{SPECIALITE_LABELS[selectedDoctor.specialite] ?? selectedDoctor.specialite}</p>
            </div>
          </div>
        </div>

        <div className="p-5">
          <p className="text-sm font-medium text-gray-700 mb-3">Choisir une date</p>

          <div className="flex items-center justify-between mb-3 bg-white rounded-xl p-3 border border-gray-200">
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <span className="font-semibold text-gray-900 capitalize text-sm">
              {currentMonth.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
            </span>
            <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="grid grid-cols-7 mb-1">
              {["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"].map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const disabled = isDisabled(day);
                const iso = isoDate(day);
                const isSelected = selectedDate === iso;
                const isToday = new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
                return (
                  <button key={day} onClick={() => !disabled && setSelectedDate(iso)} disabled={disabled}
                    className={`aspect-square rounded-lg text-xs font-medium transition flex items-center justify-center ${
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
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // VUE PRINCIPALE avec onglets
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Onglets */}
      <div className="bg-white border-b border-gray-200 flex">
        <button onClick={() => setActiveTab("list")}
          className={`flex-1 py-3.5 text-sm font-semibold transition border-b-2 ${
            activeTab === "list" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}>
          Mes RDV
          {mesRdvs.filter((r) => r.statut === "EN_ATTENTE" || r.statut === "CONFIRME").length > 0 && (
            <span className="ml-1.5 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
              {mesRdvs.filter((r) => r.statut === "EN_ATTENTE" || r.statut === "CONFIRME").length}
            </span>
          )}
        </button>
        <button onClick={() => setActiveTab("book")}
          className={`flex-1 py-3.5 text-sm font-semibold transition border-b-2 ${
            activeTab === "book" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}>
          Prendre RDV
        </button>
      </div>

      {/* Contenu onglet Mes RDV */}
      {activeTab === "list" && renderListTab()}

      {/* Contenu onglet Prendre RDV */}
      {activeTab === "book" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white px-4 pt-3 pb-3 border-b border-gray-200">
            <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Spécialité ou nom…"
                className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {docLoading ? (
              <div className="flex items-center justify-center p-12 text-gray-500">Chargement…</div>
            ) : filteredDoctors.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {filteredDoctors.map((d) => (
                  <button key={d.id} onClick={() => setSelectedDoctor(d)}
                    className="w-full px-4 py-4 hover:bg-gray-50 transition text-left border-l-4 border-transparent hover:border-blue-600">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold shrink-0">
                        {d.prenom.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">Dr. {d.prenom} {d.nom}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{SPECIALITE_LABELS[d.specialite] ?? d.specialite}</p>
                        {d.adresseCabinet && (
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {d.adresseCabinet}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-500">Aucun médecin disponible</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
