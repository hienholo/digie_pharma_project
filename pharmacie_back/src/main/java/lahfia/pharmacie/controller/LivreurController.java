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

import lahfia.pharmacie.enums.DisponibiliteStatut;
import lahfia.pharmacie.models.Livreur;
import lahfia.pharmacie.service.LivreurService;
import lombok.RequiredArgsConstructor;
 
@RestController
@RequestMapping("/api/v1/livreurs")
@RequiredArgsConstructor
public class LivreurController {
 
    private final LivreurService livreurService;
 
    // ── Profil ────────────────────────────────────────────────────────────────
 
    @GetMapping("/{id}")
    public ResponseEntity<Livreur> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(livreurService.findById(id));
    }
 
    /**
     * POST /api/v1/livreurs/inscription
     */
    @PostMapping("/inscription")
    public ResponseEntity<Livreur> inscrire(@RequestBody Livreur livreur) {
        return ResponseEntity.status(HttpStatus.CREATED).body(livreurService.inscrire(livreur));
    }
 
    /**
     * PATCH /api/v1/livreurs/{id}/valider — admin uniquement
     */
    @PatchMapping("/{id}/valider")
    public ResponseEntity<Livreur> valider(@PathVariable UUID id) {
        return ResponseEntity.ok(livreurService.validerInscription(id));
    }
 
    @PatchMapping("/{id}/suspendre")
    public ResponseEntity<Livreur> suspendre(@PathVariable UUID id) {
        return ResponseEntity.ok(livreurService.suspendre(id));
    }
 
    /**
     * GET /api/v1/livreurs/en-attente — admin uniquement
     */
    @GetMapping("/en-attente")
    public ResponseEntity<List<Livreur>> listerEnAttente() {
        return ResponseEntity.ok(livreurService.listerEnAttente());
    }
 
    // ── Disponibilité & position ───────────────────────────────────────────────
 
    /**
     * PATCH /api/v1/livreurs/{id}/disponibilite
     * Le livreur passe en ligne, hors ligne ou en course.
     * Body : { "statut": "DISPONIBLE", "latitude": 48.85, "longitude": 2.35 }
     */
    @PatchMapping("/{id}/disponibilite")
    public ResponseEntity<Livreur> changerDisponibilite(
            @PathVariable UUID id,
            @RequestBody DisponibiliteRequest body) {
        return ResponseEntity.ok(livreurService.changerDisponibilite(
                id, body.statut(), body.latitude(), body.longitude()));
    }
 
    /**
     * PATCH /api/v1/livreurs/{id}/position
     * Mise à jour GPS en temps réel (appelée fréquemment par l'app mobile).
     * Body : { "latitude": 48.85, "longitude": 2.35 }
     */
    @PatchMapping("/{id}/position")
    public ResponseEntity<Livreur> mettreAJourPosition(
            @PathVariable UUID id,
            @RequestBody Map<String, Double> body) {
        return ResponseEntity.ok(livreurService.mettreAJourPosition(
                id, body.get("latitude"), body.get("longitude")));
    }
 
    /**
     * GET /api/v1/livreurs/disponibles?lat=&lng=&rayon=
     * Livreurs disponibles proches d'un point (usage pharmacie/admin).
     */
    @GetMapping("/disponibles")
    public ResponseEntity<List<Livreur>> rechercherDisponibles(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(required = false) Double rayon) {
        return ResponseEntity.ok(livreurService.rechercherDisponiblesProches(lat, lng, rayon));
    }

    @GetMapping
    public ResponseEntity<List<Livreur>> getAll() {
        return ResponseEntity.ok(livreurService.findAll());
    }

    /** DELETE /api/v1/livreurs/{id} — suppression admin. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable UUID id) {
        livreurService.supprimer(id);
        return ResponseEntity.noContent().build();
    }

    record DisponibiliteRequest(
            DisponibiliteStatut statut,
            Double latitude,
            Double longitude
    ) {}
}