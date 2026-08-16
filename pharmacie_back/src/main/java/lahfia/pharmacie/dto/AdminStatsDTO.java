package lahfia.pharmacie.dto;

public record AdminStatsDTO(
        long totalPatients,
        long totalPharmacies,
        long pharmaciesLivraisonActive,
        long totalLivreurs,
        long livreursActifs,
        long livreursEnAttente,
        long livreursSuspendus,
        long totalMedecins,
        long medecinsActifs,
        long medecinsEnAttente,
        long medecinsSuspendus,
        long totalDemandes,
        long totalCommandes,
        long totalLivraisons
) {}
