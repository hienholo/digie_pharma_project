package lahfia.pharmacie.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import lahfia.pharmacie.models.Ordonnance;
import lahfia.pharmacie.service.OrdonnanceService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/ordonnances")
@RequiredArgsConstructor
public class OrdonnanceController {

    private final OrdonnanceService ordonnanceService;

    @GetMapping("/{id}")
    public ResponseEntity<Ordonnance> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ordonnanceService.findById(id));
    }

    @GetMapping
    public ResponseEntity<List<Ordonnance>> getAll() {
        return ResponseEntity.ok(ordonnanceService.findAll());
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Ordonnance>> getByPatient(@PathVariable UUID patientId) {
        return ResponseEntity.ok(ordonnanceService.findByPatient(patientId));
    }

    /**
     * POST /api/v1/ordonnances/soumettre
     * Multipart : champ "image" + param "patientId"
     */
    @PostMapping("/soumettre")
    public ResponseEntity<Ordonnance> soumettre(
            @RequestParam UUID patientId,
            @RequestParam("image") MultipartFile image) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ordonnanceService.soumettre(patientId, image));
    }

    /**
     * PUT /api/v1/ordonnances/{id}/corriger
     * Body : { "medicamentIds": ["uuid1", "uuid2"] }
     */
    @PutMapping("/{id}/corriger")
    public ResponseEntity<Ordonnance> corriger(
            @PathVariable UUID id,
            @RequestBody CorrectionRequest body) {
        return ResponseEntity.ok(ordonnanceService.corrigerMedicaments(id, body.medicamentIds()));
    }

    record CorrectionRequest(List<UUID> medicamentIds) {}
}
