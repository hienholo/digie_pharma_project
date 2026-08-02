package lahfia.pharmacie.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lahfia.pharmacie.enums.DisponibiliteStatut;
import lahfia.pharmacie.enums.StatutLivraison;
import lahfia.pharmacie.enums.StatutLivreur;
import lahfia.pharmacie.enums.TypeDestinataire;
import lahfia.pharmacie.enums.TypeEvenement;
import lahfia.pharmacie.exception.ResourceNotFoundException;
import lahfia.pharmacie.models.Commande;
import lahfia.pharmacie.models.EvaluationLivreur;
import lahfia.pharmacie.models.Livraison;
import lahfia.pharmacie.models.Livreur;
import lahfia.pharmacie.models.Patient;
import lahfia.pharmacie.models.Pharmacie;
import lahfia.pharmacie.repository.EvaluationLivreurRepository;
import lahfia.pharmacie.repository.LivraisonRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LivraisonService {

    private final LivraisonRepository livraisonRepository;
    private final EvaluationLivreurRepository evaluationLivreurRepository;
    private final LivreurService livreurService;
    private final NotificationService notificationService;
 
    public Livraison findById(UUID id) {
        return livraisonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Livraison non trouvée : " + id));
    }
 
    public Livraison findByCommande(UUID commandeId) {
        return livraisonRepository.findByCommandeId(commandeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Aucune livraison pour la commande : " + commandeId));
    }
 
    public List<Livraison> findByLivreur(UUID livreurId) {
        return livraisonRepository.findByLivreurId(livreurId);
    }
 
    public List<Livraison> findCourseActive(UUID livreurId) {
        return livraisonRepository.findByLivreurIdAndStatut(livreurId, StatutLivraison.EN_COURS);
    }
 
    public List<Livraison> findEnAttente() {
        return livraisonRepository.findByStatut(StatutLivraison.EN_ATTENTE_LIVREUR);
    }
 
    // ── Création ───────────────────────────────────────────────────────────────
 
    /**
     * Crée une livraison lors de la validation d'une commande en mode LIVRAISON.
     * Appelé automatiquement par CommandeService.
     */
    @Transactional
    public Livraison creer(Commande commande) {
        // Snapshot de l'adresse patient au moment de la commande
        Patient patient = commande.getDemande().getPatient();
        String adresse = patient.getLatitude() + "," + patient.getLongitude();
 
        Livraison livraison = Livraison.builder()
                .commande(commande)
                .statut(StatutLivraison.EN_ATTENTE_LIVREUR)
                .adresseLivraison(adresse)
                .build();
        return livraisonRepository.save(livraison);
    }
 
    // ── Assignation ────────────────────────────────────────────────────────────
 
    /**
     * Assigne manuellement un livreur à une livraison (par la pharmacie ou un admin).
     */
    @Transactional
    public Livraison assignerLivreur(UUID livraisonId, UUID livreurId) {
        Livraison livraison = findById(livraisonId);
        Livreur livreur = livreurService.findById(livreurId);
 
        if (livreur.getStatut() != StatutLivreur.ACTIF) {
            throw new IllegalStateException("Ce livreur n'est pas actif.");
        }
        if (livreur.getDisponibiliteStatut() != DisponibiliteStatut.DISPONIBLE) {
            throw new IllegalStateException("Ce livreur n'est pas disponible.");
        }
 
        livraison.setLivreur(livreur);
        livraison.setStatut(StatutLivraison.ASSIGNEE);
        livraison.setAssigneeAt(LocalDateTime.now());
        livraisonRepository.save(livraison);
 
        // Passer le livreur en "EN_COURSE"
        livreurService.changerDisponibilite(
                livreurId,
                DisponibiliteStatut.EN_COURSE,
                livreur.getLatitude(),
                livreur.getLongitude()
        );
 
        notificationService.notifier(
                livraison.getCommande().getDemande().getPatient().getId(),
                TypeDestinataire.PATIENT,
                TypeEvenement.LIVRAISON_EN_COURS,
                "Un livreur a été assigné à votre commande."
        );
 
        return livraison;
    }
 
    /**
     * Propose automatiquement le livreur disponible le plus proche de la pharmacie.
     */
    @Transactional
    public Livraison assignerAutomatiquement(UUID livraisonId) {
        Livraison livraison = findById(livraisonId);
        Pharmacie pharmacie = livraison.getCommande().getPharmacie();
 
        List<Livreur> candidats = livreurService.rechercherDisponiblesProches(
                pharmacie.getLatitude(), pharmacie.getLongitude(), 5.0);
 
        if (candidats.isEmpty()) {
            throw new IllegalStateException(
                    "Aucun livreur disponible à proximité de la pharmacie.");
        }
 
        // Prendre le plus proche (premier résultat, déjà trié par distance)
        return assignerLivreur(livraisonId, candidats.get(0).getId());
    }
 
    // ── Cycle de vie ───────────────────────────────────────────────────────────
 
    /**
     * Le livreur confirme qu'il a pris en charge la commande à la pharmacie.
     */
    @Transactional
    public Livraison prendreEnCharge(UUID livraisonId, UUID livreurId) {
        Livraison livraison = findById(livraisonId);
        verifierLivreurAutorise(livraison, livreurId);
 
        livraison.setStatut(StatutLivraison.EN_COURS);
        livraison.setPriseEnChargeAt(LocalDateTime.now());
        livraisonRepository.save(livraison);
 
        notificationService.notifier(
                livraison.getCommande().getDemande().getPatient().getId(),
                TypeDestinataire.PATIENT,
                TypeEvenement.LIVRAISON_EN_COURS,
                "Le livreur est en route avec votre commande."
        );
 
        return livraison;
    }
 
    /**
     * Le livreur confirme la livraison effectuée.
     */
    @Transactional
    public Livraison confirmerLivraison(UUID livraisonId, UUID livreurId, String note) {
        Livraison livraison = findById(livraisonId);
        verifierLivreurAutorise(livraison, livreurId);
 
        livraison.setStatut(StatutLivraison.LIVREE);
        livraison.setLivreeAt(LocalDateTime.now());
        livraison.setNoteLivraison(note);
        livraisonRepository.save(livraison);
 
        // Remettre le livreur disponible
        livreurService.changerDisponibilite(
                livreurId,
                DisponibiliteStatut.DISPONIBLE,
                null, null
        );
 
        notificationService.notifier(
                livraison.getCommande().getDemande().getPatient().getId(),
                TypeDestinataire.PATIENT,
                TypeEvenement.LIVRAISON_TERMINEE,
                "Votre commande a été livrée. Merci d'utiliser LAHFIA !"
        );
 
        return livraison;
    }
 
    /**
     * Signaler un échec de livraison (absent, adresse introuvable…).
     */
    @Transactional
    public Livraison signalerEchec(UUID livraisonId, UUID livreurId, String note) {
        Livraison livraison = findById(livraisonId);
        verifierLivreurAutorise(livraison, livreurId);
 
        livraison.setStatut(StatutLivraison.ECHEC);
        livraison.setNoteLivraison(note);
        livraisonRepository.save(livraison);
 
        // Remettre le livreur disponible
        livreurService.changerDisponibilite(
                livreurId,
                DisponibiliteStatut.DISPONIBLE,
                null, null
        );
 
        notificationService.notifier(
                livraison.getCommande().getDemande().getPatient().getId(),
                TypeDestinataire.PATIENT,
                TypeEvenement.LIVRAISON_TERMINEE,
                "La livraison a échoué. Veuillez contacter la pharmacie."
        );
 
        return livraison;
    }

    /**
     * Le patient note le livreur après une livraison confirmée (une seule évaluation par livraison).
     */
    @Transactional
    public EvaluationLivreur evaluer(UUID livraisonId, UUID patientId, int note, String commentaire) {
        Livraison livraison = findById(livraisonId);

        if (livraison.getStatut() != StatutLivraison.LIVREE) {
            throw new IllegalStateException("Cette livraison n'est pas encore terminée.");
        }
        if (livraison.getLivreur() == null) {
            throw new IllegalStateException("Aucun livreur assigné à cette livraison.");
        }
        UUID proprietaire = livraison.getCommande().getDemande().getPatient().getId();
        if (!proprietaire.equals(patientId)) {
            throw new IllegalStateException("Cette livraison n'appartient pas à ce patient.");
        }
        if (evaluationLivreurRepository.findByLivraisonId(livraisonId).isPresent()) {
            throw new IllegalStateException("Cette livraison a déjà été évaluée.");
        }
        if (note < 1 || note > 5) {
            throw new IllegalArgumentException("La note doit être comprise entre 1 et 5.");
        }

        EvaluationLivreur evaluation = EvaluationLivreur.builder()
                .livraison(livraison)
                .livreur(livraison.getLivreur())
                .note(note)
                .commentaire(commentaire)
                .build();
        return evaluationLivreurRepository.save(evaluation);
    }

    // ── Privé ──────────────────────────────────────────────────────────────────
 
    private void verifierLivreurAutorise(Livraison livraison, UUID livreurId) {
        if (livraison.getLivreur() == null ||
                !livraison.getLivreur().getId().equals(livreurId)) {
            throw new IllegalStateException("Vous n'êtes pas le livreur assigné à cette livraison.");
        }
    }
}