// Entité Medicament — MCD LAHFIA

export interface Medicament {
  id: string;
  nomCommercial: string;
  nomGenerique: string;
  forme: string;
  dosage: string;
  instructions: string;
}

export const mockMedicaments: Medicament[] = [
  {
    id: "mdc-001",
    nomCommercial: "Doliprane 1000mg",
    nomGenerique: "Paracétamol",
    forme: "Comprimé",
    dosage: "1000 mg",
    instructions: "1 comprimé toutes les 6 à 8 heures. Ne pas dépasser 3 g/jour.",
  },
  {
    id: "mdc-002",
    nomCommercial: "Amoxicilline 500mg",
    nomGenerique: "Amoxicilline",
    forme: "Gélule",
    dosage: "500 mg",
    instructions: "1 gélule 3 fois par jour pendant 7 jours. À prendre au cours des repas.",
  },
  {
    id: "mdc-003",
    nomCommercial: "Vitamine D3 1000 UI",
    nomGenerique: "Cholécalciférol",
    forme: "Comprimé à croquer",
    dosage: "1000 UI",
    instructions: "1 comprimé par jour, de préférence le matin avec un repas.",
  },
  {
    id: "mdc-004",
    nomCommercial: "Aspirine 500mg",
    nomGenerique: "Acide acétylsalicylique",
    forme: "Comprimé effervescent",
    dosage: "500 mg",
    instructions: "1 à 2 comprimés dissous dans un grand verre d'eau. Espacer les prises d'au moins 4 heures.",
  },
  {
    id: "mdc-005",
    nomCommercial: "Paracétamol 500mg",
    nomGenerique: "Paracétamol",
    forme: "Comprimé",
    dosage: "500 mg",
    instructions: "1 à 2 comprimés toutes les 4 à 6 heures selon douleur. Ne pas dépasser 8 comprimés/jour.",
  },
  {
    id: "mdc-006",
    nomCommercial: "Vitamine C 500mg",
    nomGenerique: "Acide ascorbique",
    forme: "Comprimé effervescent",
    dosage: "500 mg",
    instructions: "1 comprimé par jour dissous dans un verre d'eau, de préférence le matin.",
  },
];
