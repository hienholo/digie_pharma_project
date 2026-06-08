package lahfia.pharmacie.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lahfia.pharmacie.exception.ResourceNotFoundException;
import lahfia.pharmacie.models.Patient;
import lahfia.pharmacie.models.RappelMedicament;
import lahfia.pharmacie.repository.PatientRepository;
import lahfia.pharmacie.repository.RappelMedicamentRepository;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/rappels")
@RequiredArgsConstructor
public class RappelMedicamentController {

    private final RappelMedicamentRepository rappelRepo;
    private final PatientRepository patientRepo;

    /** Rappels du jour pour un patient */
    @GetMapping("/patient/{patientId}/jour")
    public ResponseEntity<List<RappelMedicament>> getJour(@PathVariable UUID patientId) {
        return ResponseEntity.ok(rappelRepo.findJour(patientId, LocalDate.now()));
    }

    /** Tous les rappels d'un patient */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<RappelMedicament>> getAll(@PathVariable UUID patientId) {
        return ResponseEntity.ok(rappelRepo.findByPatientIdOrderByHeureAsc(patientId));
    }

    record CreerRappelRequest(
        UUID patientId,
        String medicamentNom,
        String dose,
        String heure,
        Boolean recurrent,
        LocalDate dateRappel
    ) {}

    @PostMapping
    public ResponseEntity<RappelMedicament> creer(@RequestBody CreerRappelRequest req) {
        Patient patient = patientRepo.findById(req.patientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé"));
        boolean estRecurrent = req.recurrent() != null ? req.recurrent() : true;
        RappelMedicament rappel = RappelMedicament.builder()
                .patient(patient)
                .medicamentNom(req.medicamentNom())
                .dose(req.dose())
                .heure(req.heure())
                .recurrent(estRecurrent)
                .dateRappel(estRecurrent ? null : (req.dateRappel() != null ? req.dateRappel() : LocalDate.now()))
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(rappelRepo.save(rappel));
    }

    /** Marquer le rappel comme pris aujourd'hui */
    @PatchMapping("/{id}/marquer-pris")
    public ResponseEntity<RappelMedicament> marquerPris(@PathVariable UUID id) {
        RappelMedicament rappel = rappelRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rappel non trouvé"));
        rappel.setPrisDate(LocalDate.now());
        return ResponseEntity.ok(rappelRepo.save(rappel));
    }

    /** Annuler la prise (décocher) */
    @PatchMapping("/{id}/annuler-pris")
    public ResponseEntity<RappelMedicament> annulerPris(@PathVariable UUID id) {
        RappelMedicament rappel = rappelRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rappel non trouvé"));
        rappel.setPrisDate(null);
        return ResponseEntity.ok(rappelRepo.save(rappel));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable UUID id) {
        rappelRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
