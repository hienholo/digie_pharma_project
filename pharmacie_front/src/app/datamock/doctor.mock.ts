// Format UI — compatible DoctorDashboard, DoctorPatientsList, DoctorAppointments, PatientDoctorAppointments

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  lastVisit: string;
  nextAppointment: string;
  conditions: string[];
  medications: string[];
}

export interface Appointment {
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

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  location: string;
  distance: string;
  nextAvailable: string;
  price: number;
  available: boolean;
  image?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export const mockPatients: Patient[] = [
  {
    id: "pat-001",
    name: "Konan Kouassi",
    phone: "+225 07 12 34 56 78",
    email: "konan.kouassi@gmail.com",
    lastVisit: "5 jours",
    nextAppointment: "Lundi 18 mai 2026",
    conditions: ["Diabète type 2", "Hypertension"],
    medications: ["Metformine 850mg", "Amlodipine 5mg"],
  },
  {
    id: "pat-002",
    name: "Adjoua Bamba",
    phone: "+225 05 98 76 54 32",
    email: "adjoua.bamba@gmail.com",
    lastVisit: "2 semaines",
    nextAppointment: "Mercredi 20 mai 2026",
    conditions: ["Asthme"],
    medications: ["Salbutamol", "Béclométasone"],
  },
  {
    id: "pat-003",
    name: "Yao Kouamé",
    phone: "+225 07 55 44 33 22",
    email: "yao.kouame@gmail.com",
    lastVisit: "1 mois",
    nextAppointment: "Pas de RDV",
    conditions: ["Hypercholestérolémie"],
    medications: ["Atorvastatine 20mg"],
  },
];

export const mockAppointments: Appointment[] = [
  {
    id: "rdv-001",
    patientName: "Konan Kouassi",
    patientPhone: "+225 07 12 34 56 78",
    date: "16/05/2026",
    time: "09:00",
    duration: "30 min",
    status: "confirmed",
    reason: "Suivi diabète et hypertension",
    notes: "Apporter derniers résultats glycémie",
  },
  {
    id: "rdv-002",
    patientName: "Adjoua Bamba",
    patientPhone: "+225 05 98 76 54 32",
    date: "16/05/2026",
    time: "10:00",
    duration: "30 min",
    status: "confirmed",
    reason: "Renouvellement traitement asthme",
    notes: "A apporter bilan spirométrie",
  },
  {
    id: "rdv-003",
    patientName: "Yao Kouamé",
    patientPhone: "+225 07 55 44 33 22",
    date: "16/05/2026",
    time: "11:00",
    duration: "45 min",
    status: "pending",
    reason: "Consultation générale — bilan annuel",
    notes: "",
  },
  {
    id: "rdv-004",
    patientName: "Konan Kouassi",
    patientPhone: "+225 07 12 34 56 78",
    date: "18/05/2026",
    time: "14:00",
    duration: "30 min",
    status: "pending",
    reason: "Contrôle tension artérielle",
    notes: "",
  },
];

export const mockDoctors: Doctor[] = [
  {
    id: "med-001",
    name: "Dr. Brou Konan",
    specialty: "Médecin généraliste",
    rating: 4.8,
    reviews: 127,
    location: "Plateau, Abidjan",
    distance: "0.4 km",
    nextAvailable: "Aujourd'hui 14:00",
    price: 15000,
    available: true,
  },
  {
    id: "med-002",
    name: "Dr. Marie-Claire Diomandé",
    specialty: "Cardiologue",
    rating: 4.9,
    reviews: 89,
    location: "Cocody, Abidjan",
    distance: "2.1 km",
    nextAvailable: "Demain 09:00",
    price: 25000,
    available: true,
  },
  {
    id: "med-003",
    name: "Dr. Koffi Yapo",
    specialty: "Dermatologue",
    rating: 4.7,
    reviews: 156,
    location: "Plateau, Abidjan",
    distance: "3.4 km",
    nextAvailable: "Mercredi 10:00",
    price: 20000,
    available: true,
  },
  {
    id: "med-004",
    name: "Dr. Aya Coulibaly",
    specialty: "Pédiatre",
    rating: 4.6,
    reviews: 203,
    location: "Abobo, Abidjan",
    distance: "5.2 km",
    nextAvailable: "Jeudi 15:00",
    price: 18000,
    available: true,
  },
];

export const timeSlots: TimeSlot[] = [
  { time: "08:00", available: true  },
  { time: "09:00", available: false },
  { time: "10:00", available: false },
  { time: "11:00", available: false },
  { time: "12:00", available: true  },
  { time: "14:00", available: false },
  { time: "15:00", available: true  },
  { time: "16:00", available: true  },
  { time: "17:00", available: true  },
];
