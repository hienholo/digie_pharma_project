package lahfia.pharmacie.enums;


    public enum StatutLivraison {
        EN_ATTENTE_LIVREUR,   // Commande prête, livreur pas encore assigné
        ASSIGNEE,             // Livreur assigné, pas encore parti
        EN_COURS,             // Livreur en route
        LIVREE,
        ECHEC
    }