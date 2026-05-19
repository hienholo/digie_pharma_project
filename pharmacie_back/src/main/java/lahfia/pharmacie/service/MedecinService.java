package lahfia.pharmacie.service;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lahfia.pharmacie.enums.Specialite;
import lahfia.pharmacie.enums.StatutMedecin;
import lahfia.pharmacie.exception.ResourceNotFoundException;
import lahfia.pharmacie.models.DisponibiliteMedecin;
import lahfia.pharmacie.models.IndisponibilitePonctuelle;
import lahfia.pharmacie.models.Medecin;
import lahfia.pharmacie.repository.DisponibiliteMedecinRepository;
import lahfia.pharmacie.repository.IndisponibilitePonctuelleRepository;
import lahfia.pharmacie.repository.MedecinRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MedecinService {

    private final MedecinRepository medecinRepository;
    private final DisponibiliteMedecinRepository disponibiliteRepository;
    private final IndisponibilitePonctuelleRepository indisponibiliteRepository;
    private final PasswordEncoder passwordEncoder;
 
    public Medecin findById(UUID id) {
        return medecinRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin non trouvé : " + id));
    }
 
    // ── Inscription ────────────────────────────────────────────────────────────
 
    /**
     * Inscription d'un médecin. Le compte est créé en statut EN_ATTENTE_VALIDATION.
     * Un administrateur devra valider le numéro d'ordre avant activation.
     */
    @Transactional
    public Medecin inscrire(Medecin medecin) {
        if (medecinRepository.existsByEmail(medecin.getEmail())) {
            throw new IllegalArgumentException("Cet email est déjà utilisé.");
        }
        if (medecinRepository.existsByNumeroOrdre(medecin.getNumeroOrdre())) {
            throw new IllegalArgumentException("Ce numéro d'ordre est déjà enregistré.");
        }
        if (medecin.getPasswordHash() != null && !medecin.getPasswordHash().isBlank()) {
            medecin.setPasswordHash(passwordEncoder.encode(medecin.getPasswordHash()));
        }
        medecin.setStatut(StatutMedecin.EN_ATTENTE_VALIDATION);
        return medecinRepository.save(medecin);
    }
 
    /**
     * Validation du compte médecin par un administrateur.
     */
    @Transactional
    public Medecin validerInscription(UUID id) {
        Medecin medecin = findById(id);
        if (medecin.getStatut() != StatutMedecin.EN_ATTENTE_VALIDATION) {
            throw new IllegalStateException("Ce compte n'est pas en attente de validation.");
        }
        medecin.setStatut(StatutMedecin.ACTIF);
        return medecinRepository.save(medecin);
    }
 
    @Transactional
    public Medecin suspendre(UUID id) {
        Medecin medecin = findById(id);
        medecin.setStatut(StatutMedecin.SUSPENDU);
        return medecinRepository.save(medecin);
    }
 
    // ── Disponibilités récurrentes ─────────────────────────────────────────────
 
    public List<DisponibiliteMedecin> getDisponibilites(UUID medecinId) {
        return disponibiliteRepository.findByMedecinIdAndActifTrue(medecinId);
    }
 
    /**
     * Remplace intégralement les créneaux hebdomadaires du médecin.
     * Le médecin envoie sa grille complète depuis l'UI (cases cochées).
     */
    @Transactional
    public List<DisponibiliteMedecin> definirDisponibilites(UUID medecinId,
                                                              List<DisponibiliteMedecin> creneaux) {
        Medecin medecin = findById(medecinId);
        disponibiliteRepository.deleteByMedecinId(medecinId);
 
        creneaux.forEach(c -> {
            validerCreneau(c);
            c.setId(null);
            c.setMedecin(medecin);
            c.setActif(true);
        });
        return disponibiliteRepository.saveAll(creneaux);
    }
 
    /**
     * Active ou désactive un créneau spécifique sans tout remplacer.
     */
    @Transactional
    public DisponibiliteMedecin toggleCreneau(UUID creneauId, boolean actif) {
        DisponibiliteMedecin creneau = disponibiliteRepository.findById(creneauId)
                .orElseThrow(() -> new ResourceNotFoundException("Créneau non trouvé : " + creneauId));
        creneau.setActif(actif);
        return disponibiliteRepository.save(creneau);
    }
 
    /**
     * Vérifie si un médecin est disponible un jour donné
     * (créneaux actifs + pas d'indisponibilité ponctuelle).
     */
    public boolean estDisponibleLe(UUID medecinId, LocalDate date) {
        // 1. Vérifier qu'il n'y a pas d'indisponibilité ponctuelle
        List<IndisponibilitePonctuelle> absences =
                indisponibiliteRepository.findByMedecinIdAndDate(medecinId, date);
        if (!absences.isEmpty()) return false;
 
        // 2. Vérifier qu'il a au moins un créneau actif ce jour-là
        DayOfWeek jour = date.getDayOfWeek();
        List<DisponibiliteMedecin> creneaux =
                disponibiliteRepository.findByMedecinIdAndJourSemaineAndActifTrue(medecinId, jour);
        return !creneaux.isEmpty();
    }
 
    // ── Indisponibilités ponctuelles ───────────────────────────────────────────
 
    public List<IndisponibilitePonctuelle> getIndisponibilites(UUID medecinId) {
        return indisponibiliteRepository.findByMedecinId(medecinId);
    }
 
    @Transactional
    public IndisponibilitePonctuelle ajouterIndisponibilite(UUID medecinId,
                                                              LocalDate dateDebut,
                                                              LocalDate dateFin,
                                                              String motif) {
        if (dateDebut.isAfter(dateFin)) {
            throw new IllegalArgumentException("La date de début doit être avant la date de fin.");
        }
        Medecin medecin = findById(medecinId);
        return indisponibiliteRepository.save(
                IndisponibilitePonctuelle.builder()
                        .medecin(medecin)
                        .dateDebut(dateDebut)
                        .dateFin(dateFin)
                        .motif(motif)
                        .build()
        );
    }
 
    @Transactional
    public void supprimerIndisponibilite(UUID indisponibiliteId) {
        indisponibiliteRepository.deleteById(indisponibiliteId);
    }
 
    // ── Recherche ──────────────────────────────────────────────────────────────
 
    public List<Medecin> rechercherAProximite(Double latitude, Double longitude, Double rayonKm) {
        return medecinRepository.findMedecinsProches(latitude, longitude,
                rayonKm != null ? rayonKm : 10.0);
    }
 
    public List<Medecin> rechercherParSpecialite(Specialite specialite) {
        return medecinRepository.findBySpecialite(specialite);
    }
 
    // ── Privé ──────────────────────────────────────────────────────────────────
 
    private void validerCreneau(DisponibiliteMedecin c) {
        if (c.getHeureDebut() == null || c.getHeureFin() == null) {
            throw new IllegalArgumentException("Les heures de début et de fin sont obligatoires.");
        }
        if (!c.getHeureDebut().isBefore(c.getHeureFin())) {
            throw new IllegalArgumentException("L'heure de début doit être avant l'heure de fin.");
        }
    }

    @Transactional
    public List<Medecin> findAll() {
    return medecinRepository.findAll();
}
}
