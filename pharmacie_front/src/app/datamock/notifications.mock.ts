// Format UI — compatible PatientSpace
export type Notif = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  icon: "order" | "pharmacy" | "promo" | "system";
};

export const mockNotifications: Notif[] = [
  {
    id: "notif-001",
    title: "Commande prête",
    body: "Votre commande cmd-002 est prête à être retirée chez Pharmacie de l'Espérance.",
    time: "Il y a 5 min",
    read: false,
    icon: "order",
  },
  {
    id: "notif-002",
    title: "Réponse de pharmacie",
    body: "Pharmacie du Plateau a confirmé la disponibilité partielle de votre ordonnance.",
    time: "Il y a 30 min",
    read: false,
    icon: "pharmacy",
  },
  {
    id: "notif-003",
    title: "Doliprane 1000mg disponible",
    body: "Doliprane 1000mg disponible à 0.4 km · Pharmacie du Plateau ouverte.",
    time: "Hier, 14h20",
    read: true,
    icon: "promo",
  },
  {
    id: "notif-004",
    title: "Commande livrée",
    body: "Votre commande cmd-001 du 3 mai 2026 a été livrée avec succès. Merci !",
    time: "3 mai",
    read: true,
    icon: "order",
  },
  {
    id: "notif-005",
    title: "Mise à jour LAHFIA",
    body: "Nouvelles pharmacies partenaires disponibles dans votre quartier.",
    time: "1 mai",
    read: true,
    icon: "system",
  },
];

// Format MCD complet — entité Notification
export const mockNotificationsAPI = [
  {
    id: "notif-001",
    destinataireId: "pat-001",
    typeDestinataire: "PATIENT" as const,
    typeEvenement: "COMMANDE_PRETE" as const,
    message: "Votre commande cmd-002 est prête à être retirée chez Pharmacie de l'Espérance.",
    lue: false,
    createdAt: "2026-05-16T08:55:00Z",
  },
  {
    id: "notif-002",
    destinataireId: "pat-001",
    typeDestinataire: "PATIENT" as const,
    typeEvenement: "REPONSE_PHARMACIE" as const,
    message: "Pharmacie du Plateau a confirmé la disponibilité partielle de votre ordonnance.",
    lue: false,
    createdAt: "2026-05-16T08:30:00Z",
  },
  {
    id: "notif-003",
    destinataireId: "pat-001",
    typeDestinataire: "PATIENT" as const,
    typeEvenement: "REPONSE_PHARMACIE" as const,
    message: "Doliprane 1000mg disponible à 0.4 km · Pharmacie du Plateau ouverte.",
    lue: true,
    createdAt: "2026-05-15T14:20:00Z",
  },
  {
    id: "notif-004",
    destinataireId: "pat-001",
    typeDestinataire: "PATIENT" as const,
    typeEvenement: "LIVRAISON_TERMINEE" as const,
    message: "Votre commande cmd-001 du 3 mai 2026 a été livrée avec succès. Merci !",
    lue: true,
    createdAt: "2026-05-03T17:45:00Z",
  },
  {
    id: "notif-005",
    destinataireId: "pat-001",
    typeDestinataire: "PATIENT" as const,
    typeEvenement: "REPONSE_PHARMACIE" as const,
    message: "Nouvelles pharmacies partenaires disponibles dans votre quartier.",
    lue: true,
    createdAt: "2026-05-01T10:00:00Z",
  },
];
