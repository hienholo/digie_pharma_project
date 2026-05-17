package lahfia.pharmacie.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lahfia.pharmacie.enums.ModeObtention;
import lahfia.pharmacie.enums.ModePaiement;
import lahfia.pharmacie.enums.Statut;
import lahfia.pharmacie.enums.StatutDemande;
import lahfia.pharmacie.enums.TypeDestinataire;
import lahfia.pharmacie.enums.TypeEvenement;
import lahfia.pharmacie.exception.ResourceNotFoundException;
import lahfia.pharmacie.models.Commande;
import lahfia.pharmacie.models.CommandeMedicament;
import lahfia.pharmacie.models.Demande;
import lahfia.pharmacie.models.Medicament;
import lahfia.pharmacie.models.Pharmacie;
import lahfia.pharmacie.repository.CommandeRepository;
import lahfia.pharmacie.repository.MedicamentRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommandeService {

    private final CommandeRepository commandeRepository;
    private final MedicamentRepository medicamentRepository;
    private final DemandeService demandeService;
    private final PharmacieService pharmacieService;
    private final LivraisonService livraisonService;
    private final NotificationService notificationService;

    public Commande findById(UUID id) {
        return commandeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commande non trouvée : " + id));
    }

    public List<Commande> findByPharmacie(UUID pharmacieId) {
        return commandeRepository.findByPharmacieIdOrderByCreatedAtDesc(pharmacieId);
    }

    /**
     * Le patient valide sa commande après avoir choisi une pharmacie et un mode d'obtention.
     */
    @Transactional
    public Commande valider(UUID demandeId, UUID pharmacieId,
                             ModeObtention modeObtention,
                             ModePaiement modePaiement,
                             List<UUID> medicamentIds) {

        Demande demande = demandeService.findById(demandeId);
        Pharmacie pharmacie = pharmacieService.findById(pharmacieId);

        // Vérifier que la livraison est bien activée par la pharmacie si demandée
        if (modeObtention == ModeObtention.LIVRAISON && !pharmacie.getLivraisonActive()) {
            throw new IllegalStateException("Cette pharmacie ne propose pas la livraison.");
        }

        Commande commande = Commande.builder()
                .demande(demande)
                .pharmacie(pharmacie)
                .modeObtention(modeObtention)
                .modePaiement(modePaiement)
                .statut(Statut.EN_PREPARATION)
                .build();
        commande = commandeRepository.save(commande);

        // Ajouter les lignes de médicaments
        for (UUID medId : medicamentIds) {
            Medicament medicament = medicamentRepository.findById(medId)
                    .orElseThrow(() -> new ResourceNotFoundException("Médicament non trouvé : " + medId));
            commande.getMedicaments().add(
                    CommandeMedicament.builder()
                            .commande(commande)
                            .medicament(medicament)
                            .quantite(1)
                            .disponible(true)
                            .build()
            );
        }

        demande.setStatut(StatutDemande.VALIDEE);
        commandeRepository.save(commande);

        // Créer automatiquement la livraison si le mode le demande
        if (modeObtention == ModeObtention.LIVRAISON) {
            livraisonService.creer(commande);
        }

        notificationService.notifier(
                pharmacie.getId(),
                TypeDestinataire.PHARMACIE,
                TypeEvenement.COMMANDE_VALIDEE,
                "Une nouvelle commande a été validée par un patient."
        );
        notificationService.notifier(
                demande.getPatient().getId(),
                TypeDestinataire.PATIENT,
                TypeEvenement.COMMANDE_VALIDEE,
                "Votre commande a été validée. La pharmacie prépare votre commande."
        );

        return commande;
    }

    /**
     * La pharmacie marque la commande comme prête (retrait ou départ en livraison).
     */
    @Transactional
    public Commande marquerPrete(UUID commandeId) {
        Commande commande = findById(commandeId);
        commande.setStatut(Statut.PRETE);
        commandeRepository.save(commande);

        TypeEvenement evenement = commande.getModeObtention() == ModeObtention.RETRAIT
                ? TypeEvenement.RETRAIT_PRET
                : TypeEvenement.LIVRAISON_EN_COURS;

        String message = commande.getModeObtention() == ModeObtention.RETRAIT
                ? "Votre commande est prête. Vous pouvez la récupérer en pharmacie."
                : "Votre commande est en route.";

        notificationService.notifier(
                commande.getDemande().getPatient().getId(),
                TypeDestinataire.PATIENT,
                evenement,
                message
        );

        return commande;
    }

    /**
     * Clôturer la commande (récupérée ou livrée).
     */
    @Transactional
    public Commande terminer(UUID commandeId) {
        Commande commande = findById(commandeId);
        commande.setStatut(Statut.TERMINEE);
        return commandeRepository.save(commande);
    }
}
