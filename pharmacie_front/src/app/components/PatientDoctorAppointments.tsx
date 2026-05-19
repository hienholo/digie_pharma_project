import { useState } from "react";
import { Search, MapPin, Star, Calendar, Clock, Check, ChevronRight, User, Phone, ChevronLeft } from "lucide-react";
import { mockDoctors, timeSlots } from "../datamock/doctor.mock";
import type { Doctor, TimeSlot } from "../datamock/doctor.mock";

export function PatientDoctorAppointments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentConfirmed, setAppointmentConfirmed] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const filteredDoctors = mockDoctors.filter((doctor) =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calendrier functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateForComparison = (date: Date) => {
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateSelect = (day: number) => {
    if (!isDateDisabled(day)) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      setSelectedDate(formatDateForComparison(date));
    }
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const handleConfirmAppointment = () => {
    if (selectedDate && selectedTime && selectedDoctor) {
      setAppointmentConfirmed(true);
      setTimeout(() => {
        setAppointmentConfirmed(false);
        setSelectedDoctor(null);
        setSelectedDate("");
        setSelectedTime("");
      }, 3000);
    }
  };

  if (appointmentConfirmed && selectedDoctor) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Rendez-vous confirmé!</h2>
          <p className="text-gray-600">
            Votre RDV avec le <strong>{selectedDoctor.name}</strong> a été confirmé.
          </p>
          <div className="bg-blue-50 rounded-2xl p-4 text-left space-y-2">
            <p className="text-sm">
              <strong>Date :</strong> {selectedDate} à {selectedTime}
            </p>
            <p className="text-sm">
              <strong>Docteur :</strong> {selectedDoctor.name}
            </p>
            <p className="text-sm">
              <strong>Spécialité :</strong> {selectedDoctor.specialty}
            </p>
            <p className="text-sm">
              <strong>Lieu :</strong> {selectedDoctor.location}
            </p>
            <p className="text-sm">
              <strong>Tarif :</strong> {selectedDoctor.price} DA
            </p>
          </div>
          <p className="text-sm text-gray-500">Une confirmation a été envoyée à votre email.</p>
        </div>
      </div>
    );
  }

  if (selectedDoctor && selectedDate) {
    return (
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Doctor Info */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-blue-200">
          <button
            onClick={() => {
              setSelectedDate("");
              setSelectedTime("");
            }}
            className="mb-4 text-blue-600 hover:underline font-medium flex items-center gap-1"
          >
            ← Retour
          </button>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
              {selectedDoctor.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{selectedDoctor.name}</h1>
              <p className="text-sm text-gray-600 mt-1">{selectedDoctor.specialty}</p>
              <div className="flex items-center gap-2 mt-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-gray-900">
                  {selectedDoctor.rating} ({selectedDoctor.reviews} avis)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Time Selection */}
        <div className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Sélectionnez une heure</h2>
          <p className="text-sm text-gray-600 mb-4 font-medium">{selectedDate}</p>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot.time}
                onClick={() => setSelectedTime(slot.time)}
                disabled={!slot.available}
                className={`py-3 px-2 rounded-lg font-medium text-sm transition ${
                  selectedTime === slot.time
                    ? "bg-blue-600 text-white"
                    : slot.available
                    ? "border border-gray-300 text-gray-700 hover:border-blue-600"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>

          {selectedTime && (
            <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3">Résumé du rendez-vous</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Docteur :</strong> {selectedDoctor.name}
                </p>
                <p>
                  <strong>Spécialité :</strong> {selectedDoctor.specialty}
                </p>
                <p>
                  <strong>Date & Heure :</strong> {selectedDate} à {selectedTime}
                </p>
                <p>
                  <strong>Lieu :</strong> {selectedDoctor.location}
                </p>
                <p className="border-t border-blue-200 pt-2 mt-2">
                  <strong className="text-lg">Tarif :</strong> {selectedDoctor.price} DA
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setSelectedDate("");
                setSelectedTime("");
              }}
              className="px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirmAppointment}
              disabled={!selectedTime}
              className="px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            >
              Confirmer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedDoctor) {
    return (
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Doctor Header */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-blue-200">
          <button
            onClick={() => setSelectedDoctor(null)}
            className="mb-4 text-blue-600 hover:underline font-medium"
          >
            ← Retour aux docteurs
          </button>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
              {selectedDoctor.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{selectedDoctor.name}</h1>
              <p className="text-sm text-gray-600 mt-1">{selectedDoctor.specialty}</p>
              <div className="flex items-center gap-2 mt-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-gray-900">
                  {selectedDoctor.rating} ({selectedDoctor.reviews} avis)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Details */}
        <div className="p-6 space-y-4">
          {/* Location & Distance */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Localisation</p>
              <p className="font-medium text-gray-900">
                {selectedDoctor.location} ({selectedDoctor.distance})
              </p>
            </div>
          </div>

          {/* Next Available */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">Prochaine disponibilité</p>
              <p className="font-medium text-gray-900">{selectedDoctor.nextAvailable}</p>
            </div>
          </div>

          {/* Price */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-3">
            <span className="text-2xl font-bold text-gray-900">{selectedDoctor.price} DA</span>
            <span className="text-sm text-gray-500">par consultation</span>
          </div>

          {/* Date Selection Calendar */}
          <div>
            <label className="text-sm text-gray-700 font-medium block mb-3">Sélectionnez une date</label>
            
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4 bg-white rounded-xl p-4 border border-gray-200">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="flex-1 text-center">
                <h3 className="font-semibold text-gray-900">
                  {currentMonth.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                </h3>
              </div>

              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              {/* Days of week */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: getFirstDayOfMonth(currentMonth) }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                
                {Array.from({ length: getDaysInMonth(currentMonth) }).map((_, i) => {
                  const day = i + 1;
                  const disabled = isDateDisabled(day);
                  const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                  const dateStr = formatDateForComparison(date);
                  const isSelected = selectedDate === dateStr;
                  const isToday = new Date().toDateString() === date.toDateString();

                  return (
                    <button
                      key={day}
                      onClick={() => handleDateSelect(day)}
                      disabled={disabled}
                      className={`aspect-square rounded-lg font-medium text-sm transition flex items-center justify-center relative ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : isToday
                          ? "bg-blue-100 text-blue-700 border border-blue-300"
                          : disabled
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "border border-gray-200 text-gray-700 hover:bg-blue-50"
                      }`}
                    >
                      {day}
                      {isToday && !disabled && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-current rounded-full"></span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Today button */}
              <button
                onClick={goToToday}
                className="w-full mt-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition border border-blue-200"
              >
                Aller à aujourd'hui
              </button>
            </div>

            {selectedDate && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm">
                <p className="text-gray-700">
                  Date sélectionnée : <strong>{selectedDate}</strong>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Search */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Chercher un médecin</h2>
        <form className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2.5">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Specialty, doctor name…"
            className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
          />
        </form>
      </div>

      {/* Doctors List */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-100">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <button
                key={doctor.id}
                onClick={() => setSelectedDoctor(doctor)}
                className="w-full px-4 py-4 hover:bg-gray-50 transition text-left border-l-4 border-transparent hover:border-blue-600"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold shrink-0">
                    {doctor.name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                      <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        {doctor.price} DA
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{doctor.specialty}</p>

                    {/* Rating & Location */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {doctor.rating} ({doctor.reviews})
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {doctor.distance}
                      </span>
                    </div>

                    {/* Next Available */}
                    <div className="flex items-center gap-1 mt-2 text-xs text-blue-600 font-medium">
                      <Clock className="w-3 h-3" />
                      {doctor.nextAvailable}
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
                </div>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <p className="text-gray-500">Aucun médecin trouvé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
