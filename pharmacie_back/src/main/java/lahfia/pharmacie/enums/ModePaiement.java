package lahfia.pharmacie.enums;


public enum ModePaiement {
    A_LA_LIVRAISON,
    WAVE,
    ORANGE_MONEY,
    MTN_MONEY,
    // Conservé pour compatibilité avec les commandes déjà enregistrées (ancienne valeur
    // générique "paiement en ligne" avant l'introduction des mobile money spécifiques).
    EN_LIGNE
}
