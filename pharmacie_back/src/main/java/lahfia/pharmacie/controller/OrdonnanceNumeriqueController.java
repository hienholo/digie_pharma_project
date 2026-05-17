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
import org.springframework.web.bind.annotation.RestController;

import lahfia.pharmacie.models.LigneOrdonnance;
import lahfia.pharmacie.models.Ordonnance;
import lahfia.pharmacie.service.OrdonnanceNumeriqueService;
import lahfia.pharmacie.service.OrdonnanceNumeriqueService.LigneRequest;
import lombok.RequiredArgsConstructor;
 
@RestController
@RequestMapping("/api/v1/ordonnances-numeriques")
@RequiredArgsConstructor
public class OrdonnanceNumeriqueController {
 
    private final OrdonnanceNumeriqueService ordonnanceNumeriqueService;
 
    @GetMapping("/{id}")
    public ResponseEntity<Ordonnance> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ordonnanceNumeriqueService.findById(id));
    }
 
    @GetMapping("/{id}/lignes")
    public ResponseEntity<List<LigneOrdonnance>> getLignes(@PathVariable UUID id) {
        return ResponseEntity.ok(ordonnanceNumeriqueService.getLignes(id));
    }
 
    @GetMapping("/medecin/{medecinId}")
    public ResponseEntity<List<Ordonnance>> getByMedecin(@PathVariable UUID medecinId) {
        return ResponseEntity.ok(ordonnanceNumeriqueService.findByMedecin(medecinId));
    }
 
    /**
     * POST /api/v1/ordonnances-numeriques
     * Le médecin rédige une ordonnance pour un patient.
     *
     * Body :
     * {
     *   "medecinId": "...",
     *   "patientId": "...",
     *   "lignes": [
     *     {
     *       "medicamentId": "...",
     *       "quantite": 2,
     *       "posologie": "1 comprimé matin et soir",
     *       "duree": "7 jours",
     *       "instructions": "À prendre pendant les repas"
     *     }
     *   ]
     * }
     */
    @PostMapping
    public ResponseEntity<Ordonnance> rediger(@RequestBody RedigerRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ordonnanceNumeriqueService.rediger(body.medecinId(), body.patientId(), body.lignes())
        );
    }
 
    /**
     * PUT /api/v1/ordonnances-numeriques/{id}/lignes
     * Modifier les lignes d'une ordonnance numérique (médecin auteur seulement).
     */
    @PutMapping("/{id}/lignes")
    public ResponseEntity<Ordonnance> modifierLignes(
            @PathVariable UUID id,
            @RequestBody ModifierLignesRequest body) {
        return ResponseEntity.ok(
                ordonnanceNumeriqueService.modifierLignes(id, body.medecinId(), body.lignes())
        );
    }
 
    record RedigerRequest(UUID medecinId, UUID patientId, List<LigneRequest> lignes) {}
    record ModifierLignesRequest(UUID medecinId, List<LigneRequest> lignes) {}
}
