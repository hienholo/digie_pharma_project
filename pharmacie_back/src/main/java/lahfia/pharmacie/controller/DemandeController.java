package lahfia.pharmacie.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lahfia.pharmacie.dto.DemandeEnAttenteDTO;
import lahfia.pharmacie.enums.Reponse;
import lahfia.pharmacie.enums.Type;
import lahfia.pharmacie.models.Demande;
import lahfia.pharmacie.models.DemandePharmacieReponse;
import lahfia.pharmacie.service.DemandeService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/demandes")
@RequiredArgsConstructor
public class DemandeController {

    private final DemandeService demandeService;

    @GetMapping("/{id}")
    public ResponseEntity<Demande> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(demandeService.findById(id));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Demande>> getByPatient(@PathVariable UUID patientId) {
        return ResponseEntity.ok(demandeService.findByPatient(patientId));
    }

    /**
     * GET /api/v1/demandes/pharmacie/{pharmacieId}/en-attente
     * Toutes les demandes non encore traitées par une pharmacie.
     */
    @GetMapping("/pharmacie/{pharmacieId}/en-attente")
    public ResponseEntity<List<DemandeEnAttenteDTO>> getEnAttenteParPharmacie(
            @PathVariable UUID pharmacieId) {
        return ResponseEntity.ok(demandeService.getDemandesEnAttente(pharmacieId));
    }

    /**
     * GET /api/v1/demandes/{id}/reponses
     * Toutes les réponses reçues pour une demande (côté patient).
     */
    @GetMapping("/{id}/reponses")
    public ResponseEntity<List<DemandePharmacieReponse>> getReponses(@PathVariable UUID id) {
        return ResponseEntity.ok(demandeService.getReponses(id));
    }

    /**
     * POST /api/v1/demandes
     * Body : { "patientId", "ordonnanceId" (nullable), "type", "rayonKm" (nullable) }
     */
    @PostMapping
    public ResponseEntity<Demande> creer(@RequestBody CreerDemandeRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                demandeService.creerEtEnvoyer(
                        body.patientId(),
                        body.ordonnanceId(),
                        body.type(),
                        body.rayonKm(),
                        body.medicamentRecherche(),
                        body.latitude(),
                        body.longitude()
                )
        );
    }

    /**
     * POST /api/v1/demandes/{demandeId}/repondre
     * Appelé par la pharmacie.
     * Body : { "pharmacieId", "reponse", "detailPartiel" (nullable) }
     */
    @PostMapping("/{demandeId}/repondre")
    public ResponseEntity<DemandePharmacieReponse> repondre(
            @PathVariable UUID demandeId,
            @RequestBody RepondreRequest body) {
        return ResponseEntity.ok(
                demandeService.repondre(demandeId, body.pharmacieId(), body.reponse(), body.detailPartiel())
        );
    }

    record CreerDemandeRequest(
            UUID patientId,
            UUID ordonnanceId,
            Type type,
            Double rayonKm,
            String medicamentRecherche,
            Double latitude,
            Double longitude
    ) {}

    record RepondreRequest(
            UUID pharmacieId,
            Reponse reponse,
            String detailPartiel
    ) {}
}
