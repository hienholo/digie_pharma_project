package lahfia.pharmacie.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lahfia.pharmacie.enums.DisponibiliteStatut;
import lahfia.pharmacie.enums.StatutLivreur;
import lahfia.pharmacie.exception.ResourceNotFoundException;
import lahfia.pharmacie.models.Livreur;
import lahfia.pharmacie.repository.LivreurRepository;
import lombok.RequiredArgsConstructor;
 
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LivreurService {
 
    private final LivreurRepository livreurRepository;
 
    public Livreur findById(UUID id) {
        return livreurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Livreur non trouvé : " + id));
    }
 
    // ── Inscription & validation ───────────────────────────────────────────────
 
    @Transactional
    public Livreur inscrire(Livreur livreur) {
        if (livreurRepository.existsByEmail(livreur.getEmail())) {
            throw new IllegalArgumentException("Cet email est déjà utilisé.");
        }
        if (livreurRepository.existsByTelephone(livreur.getTelephone())) {
            throw new IllegalArgumentException("Ce numéro de téléphone est déjà utilisé.");
        }
        livreur.setStatut(StatutLivreur.EN_ATTENTE_VALIDATION);
        livreur.setDisponibiliteStatut(DisponibiliteStatut.HORS_LIGNE);
        return livreurRepository.save(livreur);
    }
 
    @Transactional
    public Livreur validerInscription(UUID id) {
        Livreur livreur = findById(id);
        if (livreur.getStatut() != StatutLivreur.EN_ATTENTE_VALIDATION) {
            throw new IllegalStateException("Ce compte n'est pas en attente de validation.");
        }
        livreur.setStatut(StatutLivreur.ACTIF);
        return livreurRepository.save(livreur);
    }
 
    @Transactional
    public Livreur suspendre(UUID id) {
        Livreur livreur = findById(id);
        livreur.setStatut(StatutLivreur.SUSPENDU);
        livreur.setDisponibiliteStatut(DisponibiliteStatut.HORS_LIGNE);
        return livreurRepository.save(livreur);
    }
 
    // ── Disponibilité & position ───────────────────────────────────────────────
 
    /**
     * Le livreur passe en ligne / hors ligne depuis son application.
     * Met aussi à jour sa position GPS.
     */
    @Transactional
    public Livreur changerDisponibilite(UUID id, DisponibiliteStatut nouveauStatut,
                                        Double latitude, Double longitude) {
        Livreur livreur = findById(id);
        if (livreur.getStatut() != StatutLivreur.ACTIF) {
            throw new IllegalStateException("Seul un livreur actif peut changer sa disponibilité.");
        }
        livreur.setDisponibiliteStatut(nouveauStatut);
        if (latitude != null) livreur.setLatitude(latitude);
        if (longitude != null) livreur.setLongitude(longitude);
        return livreurRepository.save(livreur);
    }
 
    /**
     * Mise à jour de la position GPS uniquement (appelée régulièrement par l'app mobile).
     */
    @Transactional
    public Livreur mettreAJourPosition(UUID id, Double latitude, Double longitude) {
        Livreur livreur = findById(id);
        livreur.setLatitude(latitude);
        livreur.setLongitude(longitude);
        return livreurRepository.save(livreur);
    }
 
    // ── Recherche ──────────────────────────────────────────────────────────────
 
    /**
     * Trouve les livreurs ACTIFS et DISPONIBLES proches d'un point GPS.
     * Utilisé par LivraisonService pour proposer un livreur.
     */
    public List<Livreur> rechercherDisponiblesProches(Double latitude, Double longitude, Double rayonKm) {
        return livreurRepository.findLivreursDisponiblesProches(
                latitude, longitude, rayonKm != null ? rayonKm : 5.0);
    }
 
    public List<Livreur> listerEnAttente() {
        return livreurRepository.findByStatut(StatutLivreur.EN_ATTENTE_VALIDATION);
    }

    public List<Livreur> findAll() {
    return livreurRepository.findAll();
}
}
 