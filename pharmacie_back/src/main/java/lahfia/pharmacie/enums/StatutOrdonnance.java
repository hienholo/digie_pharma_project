package lahfia.pharmacie.enums;

public enum StatutOrdonnance {
    EN_ATTENTE_OCR,  // Upload patient, OCR en cours
    ANALYSEE,        // OCR terminé, en attente de confirmation patient
    CORRIGEE,        // Corrigée manuellement par le patient
    NUMERIQUE        // Rédigée directement par un médecin sur la plateforme
}
