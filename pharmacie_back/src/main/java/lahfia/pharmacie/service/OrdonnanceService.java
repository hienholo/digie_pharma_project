package lahfia.pharmacie.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import lahfia.pharmacie.enums.StatutOrdonnance;
import lahfia.pharmacie.exception.ResourceNotFoundException;
import lahfia.pharmacie.models.Medicament;
import lahfia.pharmacie.models.Ordonnance;
import lahfia.pharmacie.models.OrdonnanceMedicament;
import lahfia.pharmacie.models.Patient;
import lahfia.pharmacie.repository.MedicamentRepository;
import lahfia.pharmacie.repository.OrdonnanceRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrdonnanceService {

    private final OrdonnanceRepository ordonnanceRepository;
    private final MedicamentRepository medicamentRepository;
    private final PatientService patientService;
    private final StockageService stockageService;
    private final OcrService ocrService;

    public Ordonnance findById(UUID id) {
        return ordonnanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ordonnance non trouvée : " + id));
    }

    public List<Ordonnance> findAll() {
    return ordonnanceRepository.findAll();
}

    public List<Ordonnance> findByPatient(UUID patientId) {
        return ordonnanceRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    /**
     * Téléverse l'image, lance l'OCR et pré-remplit les médicaments détectés.
     */
    @Transactional
    public Ordonnance soumettre(UUID patientId, MultipartFile image) {
        Patient patient = patientService.findById(patientId);

        // 1. Stocker l'image
        String imageUrl = stockageService.stocker(image);

        // 2. Créer l'ordonnance
        Ordonnance ordonnance = Ordonnance.builder()
                .patient(patient)
                .imageUrl(imageUrl)
                .statut(StatutOrdonnance.EN_ATTENTE_OCR)
                .build();
        ordonnance = ordonnanceRepository.save(ordonnance);

        // 3. Lancer l'OCR (asynchrone en production, synchrone ici pour le MVP)
        List<String> nomsDetectes = ocrService.extraireMedicaments(imageUrl);

        // 4. Pré-remplir les médicaments détectés
        for (String nom : nomsDetectes) {
            Medicament medicament = medicamentRepository
                    .findByNomCommercialIgnoreCase(nom)
                    .orElseGet(() -> creerMedicamentInconnu(nom));

            OrdonnanceMedicament ligne = OrdonnanceMedicament.builder()
                    .ordonnance(ordonnance)
                    .medicament(medicament)
                    .corrigeManuellement(false)
                    .build();
            ordonnance.getMedicamentsOcr().add(ligne);
        }

        ordonnance.setStatut(StatutOrdonnance.ANALYSEE);
        return ordonnanceRepository.save(ordonnance);
    }

    /**
     * Permet au patient de corriger manuellement les médicaments détectés.
     */
    @Transactional
    public Ordonnance corrigerMedicaments(UUID ordonnanceId, List<UUID> medicamentIds) {
        Ordonnance ordonnance = findById(ordonnanceId);

        // Remplacer les lignes existantes par la correction manuelle
        ordonnance.getMedicamentsOcr().clear();
        for (UUID medId : medicamentIds) {
            Medicament medicament = medicamentRepository.findById(medId)
                    .orElseThrow(() -> new ResourceNotFoundException("Médicament non trouvé : " + medId));

            OrdonnanceMedicament ligne = OrdonnanceMedicament.builder()
                    .ordonnance(ordonnance)
                    .medicament(medicament)
                    .corrigeManuellement(true)
                    .build();
            ordonnance.getMedicamentsOcr().add(ligne);
        }

        ordonnance.setStatut(StatutOrdonnance.CORRIGEE);
        return ordonnanceRepository.save(ordonnance);
    }

    private Medicament creerMedicamentInconnu(String nom) {
        return medicamentRepository.save(
                Medicament.builder().nomCommercial(nom).build()
        );
    }
}
