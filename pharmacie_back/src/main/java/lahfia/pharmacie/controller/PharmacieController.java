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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lahfia.pharmacie.models.Pharmacie;
import lahfia.pharmacie.service.PharmacieService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/pharmacies")
@RequiredArgsConstructor
public class PharmacieController {

    private final PharmacieService pharmacieService;

    @GetMapping("/{id}")
    public ResponseEntity<Pharmacie> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(pharmacieService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Pharmacie> creer(@RequestBody Pharmacie pharmacie) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pharmacieService.creer(pharmacie));
    }

    /**
     * GET /api/v1/pharmacies/proximite?lat=48.8566&lng=2.3522&rayon=5
     */
    @GetMapping("/proximite")
    public ResponseEntity<List<Pharmacie>> rechercherProximite(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(required = false) Double rayon) {
        return ResponseEntity.ok(pharmacieService.rechercherAProximite(lat, lng, rayon));
    }

    @PatchMapping("/{id}/livraison")
    public ResponseEntity<Pharmacie> toggleLivraison(
            @PathVariable UUID id,
            @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(pharmacieService.toggleLivraison(id, body.get("actif")));
    }

    @GetMapping
    public ResponseEntity<List<Pharmacie>> getAll() {
        return ResponseEntity.ok(pharmacieService.findAll());
    }

    /** DELETE /api/v1/pharmacies/{id} — suppression admin. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable UUID id) {
        pharmacieService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}
