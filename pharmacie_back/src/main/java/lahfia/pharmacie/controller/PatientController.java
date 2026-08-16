package lahfia.pharmacie.controller;

import java.util.List;
import java.util.Map;
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

import lahfia.pharmacie.models.Patient;
import lahfia.pharmacie.service.PatientService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping("/{id}")
    public ResponseEntity<Patient> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(patientService.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<Patient>> getAll() {
        return ResponseEntity.ok(patientService.findAll());
    }

    @PostMapping
    public ResponseEntity<Patient> creer(@RequestBody Patient patient) {
        return ResponseEntity.status(HttpStatus.CREATED).body(patientService.creer(patient));
    }

    @PatchMapping("/{id}/localisation")
    public ResponseEntity<Patient> mettreAJourLocalisation(
            @PathVariable UUID id,
            @RequestBody Map<String, Double> body) {
        return ResponseEntity.ok(
                patientService.mettreAJourLocalisation(id, body.get("latitude"), body.get("longitude"))
        );
    }

    @PatchMapping("/{id}/mesures")
    public ResponseEntity<Patient> mettreAJourMesures(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(patientService.mettreAJourMesures(id, body));
    }

    /** DELETE /api/v1/patients/{id} — suppression admin. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable UUID id) {
        patientService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}
