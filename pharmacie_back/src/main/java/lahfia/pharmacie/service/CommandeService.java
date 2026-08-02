package lahfia.pharmacie.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lahfia.pharmacie.dto.CommandePatientDTO;
import lahfia.pharmacie.dto.CommandePharmacieDTO;
import lahfia.pharmacie.models.DemandePharmacieReponse;
import lahfia.pharmacie.models.Livraison;
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
import lahfia.pharmacie.models.Patient;
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
     * Noms des médicaments d'une commande. Le patient recherche le plus souvent en texte libre
     * (sans passer par le catalogue), donc `commande.medicaments` est vide dans ce cas : on
     * retombe alors sur le texte réel de la demande d'origine (recherche libre ou OCR ordonnance)
     * plutôt que d'afficher un intitulé générique.
     */
    private List<String> resolverNomsMedicaments(Commande c, Demande demande) {
        List<String> noms = new java.util.ArrayList<>();
        for (CommandeMedicament cm : c.getMedicaments()) {
            noms.add(cm.getMedicament().getNomCommercial());
        }
        if (!noms.isEmpty()) return noms;

        if (demande.getOrdonnance() != null && !demande.getOrdonnance().getMedicamentsOcr().isEmpty()) {
            for (var om : demande.getOrdonnance().getMedicamentsOcr()) {
                noms.add(om.getMedicament().getNomCommercial());
            }
            return noms;
        }
        if (demande.getMedicamentRecherche() != null && !demande.getMedicamentRecherche().isBlank()) {
            noms.add(demande.getMedicamentRecherche());
        }
        return noms;
    }

    public List<CommandePharmacieDTO> findByPharmacieDto(UUID pharmacieId) {
        List<Commande> commandes = commandeRepository.findByPharmacieIdOrderByCreatedAtDesc(pharmacieId);
        List<CommandePharmacieDTO> result = new java.util.ArrayList<>();
        for (Commande c : commandes) {
            Patient patient = c.getDemande().getPatient();
            List<String> noms = resolverNomsMedicaments(c, c.getDemande());
            result.add(new CommandePharmacieDTO(
                    c.getId(),
                    c.getStatut().name(),
                    c.getModeObtention().name(),
                    c.getModePaiement() != null ? c.getModePaiement().name() : null,
                    c.getCreatedAt(),
                    patient.getPrenom(),
                    patient.getNom(),
                    noms
            ));
        }
        return result;
    }

    /** Historique des commandes d'un patient, enrichi pour l'écran de suivi (timeline, livreur). */
    public List<CommandePatientDTO> findByPatientDto(UUID patientId) {
        List<Commande> commandes = commandeRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
        List<CommandePatientDTO> result = new java.util.ArrayList<>();
        for (Commande c : commandes) {
            Demande demande = c.getDemande();
            List<String> noms = resolverNomsMedicaments(c, demande);

            // Réponse de la pharmacie retenue pour cette commande (horodatage + type de réponse)
            DemandePharmacieReponse reponseRetenue = demande.getReponses().stream()
                    .filter(r -> r.getPharmacie().getId().equals(c.getPharmacie().getId()))
                    .filter(r -> r.getReponduAt() != null)
                    .findFirst().orElse(null);
            java.time.LocalDateTime reponseConfirmeeAt = reponseRetenue != null ? reponseRetenue.getReponduAt() : null;
            String reponseType = reponseRetenue != null && reponseRetenue.getReponse() != null
                    ? reponseRetenue.getReponse().name() : null;
            Double prix = reponseRetenue != null ? reponseRetenue.getPrix() : null;

            Livraison liv = c.getLivraison();

            result.add(new CommandePatientDTO(
                    c.getId(),
                    c.getStatut().name(),
                    c.getModeObtention().name(),
                    c.getModePaiement() != null ? c.getModePaiement().name() : null,
                    c.getCreatedAt(),
                    c.getPreteAt(),
                    c.getPharmacie().getNom(),
                    c.getPharmacie().getAdresse(),
                    noms,
                    demande.getCreatedAt(),
                    demande.getReponses().size(),
                    reponseConfirmeeAt,
                    reponseType,
                    prix,
                    liv != null ? liv.getId() : null,
                    liv != null ? liv.getStatut().name() : null,
                    liv != null ? liv.getAssigneeAt() : null,
                    liv != null ? liv.getPriseEnChargeAt() : null,
                    liv != null ? liv.getLivreeAt() : null,
                    liv != null && liv.getLivreur() != null ? liv.getLivreur().getNom() : null,
                    liv != null && liv.getLivreur() != null ? liv.getLivreur().getPrenom() : null,
                    liv != null && liv.getLivreur() != null ? liv.getLivreur().getTelephone() : null,
                    liv != null && liv.getLivreur() != null ? liv.getLivreur().getLatitude() : null,
                    liv != null && liv.getLivreur() != null ? liv.getLivreur().getLongitude() : null,
                    liv != null && liv.getLivreur() != null && liv.getLivreur().getTypeVehicule() != null
                            ? liv.getLivreur().getTypeVehicule().name() : null,
                    liv != null && liv.getLivreur() != null ? liv.getLivreur().getNoteMoyenne() : null,
                    liv != null ? liv.getEvaluationNote() : null
            ));
        }
        return result;
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
        commande.setPreteAt(java.time.LocalDateTime.now());
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
