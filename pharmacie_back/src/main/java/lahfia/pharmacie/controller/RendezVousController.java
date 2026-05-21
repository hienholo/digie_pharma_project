package lahfia.pharmacie.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lahfia.pharmacie.dto.RendezVousDTO;
import lahfia.pharmacie.service.RendezVousService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/rendez-vous")
@RequiredArgsConstructor
public class RendezVousController {

    private final RendezVousService rendezVousService;

    @GetMapping("/medecin/{medecinId}")
    public ResponseEntity<List<RendezVousDTO>> getByMedecin(@PathVariable UUID medecinId) {
        return ResponseEntity.ok(rendezVousService.findByMedecin(medecinId));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<RendezVousDTO>> getByPatient(@PathVariable UUID patientId) {
        return ResponseEntity.ok(rendezVousService.findByPatient(patientId));
    }

    @PostMapping
    public ResponseEntity<RendezVousDTO> creer(@RequestBody CreerRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                rendezVousService.creer(body.patientId(), body.medecinId(), body.dateRdv(), body.heure(), body.motif())
        );
    }

    @PatchMapping("/{id}/confirmer")
    public ResponseEntity<RendezVousDTO> confirmer(@PathVariable UUID id) {
        return ResponseEntity.ok(rendezVousService.confirmer(id));
    }

    @PatchMapping("/{id}/annuler")
    public ResponseEntity<RendezVousDTO> annuler(@PathVariable UUID id) {
        return ResponseEntity.ok(rendezVousService.annuler(id));
    }

    record CreerRequest(UUID patientId, UUID medecinId, String dateRdv, String heure, String motif) {}
}
