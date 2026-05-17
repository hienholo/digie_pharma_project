package lahfia.pharmacie.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lahfia.pharmacie.enums.Source;
import lahfia.pharmacie.enums.StatutMedecin;
import lahfia.pharmacie.enums.StatutOrdonnance;
import lahfia.pharmacie.exception.ResourceNotFoundException;
import lahfia.pharmacie.models.LigneOrdonnance;
import lahfia.pharmacie.models.Medecin;
import lahfia.pharmacie.models.Medicament;
import lahfia.pharmacie.models.Ordonnance;
import lahfia.pharmacie.models.Patient;
import lahfia.pharmacie.repository.LigneOrdonnanceRepository;
import lahfia.pharmacie.repository.MedicamentRepository;
import lahfia.pharmacie.repository.OrdonnanceRepository;

import java.util.List;
import java.util.UUID;
 
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrdonnanceNumeriqueService {
 
    private final OrdonnanceRepository ordonnanceRepository;
    private final LigneOrdonnanceRepository ligneRepository;
    private final MedicamentRepository medicamentRepository;
    private final MedecinService medecinService;
    private final PatientService patientService;
 
    public Ordonnance findById(UUID id) {
        return ordonnanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ordonnance non trouvée : " + id));
    }
 
    public List<Ordonnance> findByMedecin(UUID medecinId) {
        return ordonnanceRepository.findByMedecinIdOrderByCreatedAtDesc(medecinId);
    }
 
    public List<LigneOrdonnance> getLignes(UUID ordonnanceId) {
        return ligneRepository.findByOrdonnanceId(ordonnanceId);
    }
 
    /**
     * Un médecin rédige une ordonnance numérique pour un patient.
     * Vérifie que le médecin est ACTIF avant d'autoriser la rédaction.
     */
    @Transactional
    public Ordonnance rediger(UUID medecinId, UUID patientId, List<LigneRequest> lignesRequest) {
        Medecin medecin = medecinService.findById(medecinId);
        if (medecin.getStatut() != StatutMedecin.ACTIF) {
            throw new IllegalStateException("Seul un médecin actif peut rédiger une ordonnance.");
        }
 
        Patient patient = patientService.findById(patientId);
 
        // Créer l'ordonnance numérique
        Ordonnance ordonnance = Ordonnance.builder()
                .patient(patient)
                .medecin(medecin)
                .source(Source.MEDECIN)
                .statut(StatutOrdonnance.NUMERIQUE)
                .build();
        ordonnance = ordonnanceRepository.save(ordonnance);
 
        // Ajouter les lignes
        for (LigneRequest req : lignesRequest) {
            Medicament medicament = medicamentRepository.findById(req.medicamentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Médicament non trouvé : " + req.medicamentId()));
 
            ordonnance.getLignes().add(
                    ligneRepository.save(
                            LigneOrdonnance.builder()
                                    .ordonnance(ordonnance)
                                    .medicament(medicament)
                                    .quantite(req.quantite())
                                    .posologie(req.posologie())
                                    .duree(req.duree())
                                    .instructions(req.instructions())
                                    .build()
                    )
            );
        }
 
        return ordonnanceRepository.save(ordonnance);
    }
 
    /**
     * Modifier les lignes d'une ordonnance numérique (avant que le patient ne l'utilise).
     */
    @Transactional
    public Ordonnance modifierLignes(UUID ordonnanceId, UUID medecinId,
                                      List<LigneRequest> lignesRequest) {
        Ordonnance ordonnance = findById(ordonnanceId);
 
        if (!ordonnance.getMedecin().getId().equals(medecinId)) {
            throw new IllegalStateException("Vous n'êtes pas l'auteur de cette ordonnance.");
        }
        if (ordonnance.getSource() != Source.MEDECIN) {
            throw new IllegalStateException("Seules les ordonnances numériques peuvent être modifiées.");
        }
 
        // Remplacer toutes les lignes
        ligneRepository.deleteAll(ordonnance.getLignes());
        ordonnance.getLignes().clear();
 
        for (LigneRequest req : lignesRequest) {
            Medicament medicament = medicamentRepository.findById(req.medicamentId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Médicament non trouvé : " + req.medicamentId()));
 
            ordonnance.getLignes().add(
                    ligneRepository.save(
                            LigneOrdonnance.builder()
                                    .ordonnance(ordonnance)
                                    .medicament(medicament)
                                    .quantite(req.quantite())
                                    .posologie(req.posologie())
                                    .duree(req.duree())
                                    .instructions(req.instructions())
                                    .build()
                    )
            );
        }
 
        return ordonnanceRepository.save(ordonnance);
    }
 
    // DTO interne pour les lignes d'une ordonnance numérique
    public record LigneRequest(
            UUID medicamentId,
            Integer quantite,
            String posologie,
            String duree,
            String instructions
    ) {}
}
