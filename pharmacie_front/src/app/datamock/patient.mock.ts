// Compte patient de test — à utiliser uniquement en développement

export const TEST_PATIENT = {
  id: "pat-001",
  nom: "Kouassi",
  prenom: "Konan",
  email: "konan.kouassi@gmail.com",
  password: "Test1234!",
  telephone: "+225 07 12 34 56 78",
  adresseLivraison: "Résidence Les Palmiers, Bâtiment C, Apt 12, Cocody, Abidjan",
  latitude: 5.3553,
  longitude: -3.9988,
};

// Liste complète de patients (format MCD)
export const mockPatients = [
  {
    id: "pat-001",
    nom: "Kouassi",
    prenom: "Konan",
    email: "konan.kouassi@gmail.com",
    telephone: "+225 07 12 34 56 78",
    adresseLivraison: "Résidence Les Palmiers, Bâtiment C, Apt 12, Cocody, Abidjan",
    latitude: 5.3553,
    longitude: -3.9988,
  },
  {
    id: "pat-002",
    nom: "Bamba",
    prenom: "Adjoua",
    email: "adjoua.bamba@gmail.com",
    telephone: "+225 05 98 76 54 32",
    adresseLivraison: "Cité Sicogi, Tour B, Apt 34, Yopougon, Abidjan",
    latitude: 5.3333,
    longitude: -4.0833,
  },
  {
    id: "pat-003",
    nom: "Kouamé",
    prenom: "Yao",
    email: "yao.kouame@gmail.com",
    telephone: "+225 07 55 44 33 22",
    adresseLivraison: "Villa 15, Rue des Jardins, Marcory, Abidjan",
    latitude: 5.3000,
    longitude: -3.9833,
  },
];

// Vue patients pour l'espace médecin (même données, utilisées dans DoctorPatientsList)
export const mockDoctorPatients = mockPatients;
