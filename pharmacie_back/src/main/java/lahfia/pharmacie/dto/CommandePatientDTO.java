package lahfia.pharmacie.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/** Vue enrichie d'une commande pour le suivi côté patient (liste + timeline détaillée). */
public record CommandePatientDTO(
        UUID id,
        String statut,
        String modeObtention,
        String modePaiement,
        LocalDateTime createdAt,
        LocalDateTime preteAt,
        String pharmacieNom,
        String pharmacieAdresse,
        List<String> medicamentNoms,

        // Demande d'origine
        LocalDateTime demandeCreatedAt,
        Integer nbPharmaciesContactees,

        // Réponse de la pharmacie retenue
        LocalDateTime reponseConfirmeeAt,
        String reponseType,
        Double prix,

        // Livraison (null si retrait en pharmacie)
        UUID livraisonId,
        String livraisonStatut,
        LocalDateTime livraisonAssigneeAt,
        LocalDateTime livraisonPriseEnChargeAt,
        LocalDateTime livraisonLivreeAt,
        String livreurNom,
        String livreurPrenom,
        String livreurTelephone,
        Double livreurLatitude,
        Double livreurLongitude,
        String livreurTypeVehicule,
        Double livreurNoteMoyenne,
        Integer evaluationNote
) {}
