package lahfia.pharmacie.controller;

import java.time.LocalDate;
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
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lahfia.pharmacie.enums.Specialite;
import lahfia.pharmacie.models.DisponibiliteMedecin;
import lahfia.pharmacie.models.IndisponibilitePonctuelle;
import lahfia.pharmacie.models.Medecin;
import lahfia.pharmacie.service.MedecinService;
import lombok.RequiredArgsConstructor;
 
@RestController
@RequestMapping("/api/v1/medecins")
@RequiredArgsConstructor
public class MedecinController {
 
    private final MedecinService medecinService;
 
    // ── Profil ────────────────────────────────────────────────────────────────
 
    @GetMapping("/{id}")
    public ResponseEntity<Medecin> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(medecinService.findById(id));
    }
 
    @GetMapping
    public ResponseEntity<List<Medecin>> getAll() {
        return ResponseEntity.ok(medecinService.findAll());
    }

    /** DELETE /api/v1/medecins/{id} — suppression admin. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable UUID id) {
        medecinService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * POST /api/v1/medecins/inscription
     * Inscription d'un nouveau médecin (statut EN_ATTENTE_VALIDATION).
     */
    @PostMapping("/inscription")
    public ResponseEntity<Medecin> inscrire(@RequestBody Medecin medecin) {
        return ResponseEntity.status(HttpStatus.CREATED).body(medecinService.inscrire(medecin));
    }
 
    /**
     * PATCH /api/v1/medecins/{id}/valider
     * Réservé à l'administration : active le compte après vérification du numéro d'ordre.
     */
    @PatchMapping("/{id}/valider")
    public ResponseEntity<Medecin> valider(@PathVariable UUID id) {
        return ResponseEntity.ok(medecinService.validerInscription(id));
    }
 
    @PatchMapping("/{id}/suspendre")
    public ResponseEntity<Medecin> suspendre(@PathVariable UUID id) {
        return ResponseEntity.ok(medecinService.suspendre(id));
    }
 
    /**
     * GET /api/v1/medecins/proximite?lat=&lng=&rayon=
     */
    @GetMapping("/proximite")
    public ResponseEntity<List<Medecin>> rechercherProximite(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(required = false) Double rayon) {
        return ResponseEntity.ok(medecinService.rechercherAProximite(lat, lng, rayon));
    }
 
    @GetMapping("/specialite/{specialite}")
    public ResponseEntity<List<Medecin>> rechercherParSpecialite(
            @PathVariable Specialite specialite) {
        return ResponseEntity.ok(medecinService.rechercherParSpecialite(specialite));
    }
 
    // ── Disponibilités récurrentes ─────────────────────────────────────────────
 
    @GetMapping("/{id}/disponibilites")
    public ResponseEntity<List<DisponibiliteMedecin>> getDisponibilites(@PathVariable UUID id) {
        return ResponseEntity.ok(medecinService.getDisponibilites(id));
    }
 
    /**
     * PUT /api/v1/medecins/{id}/disponibilites
     * Remplace toute la grille hebdomadaire (cases cochées côté UI).
     * Body : liste de { "jourSemaine": "MONDAY", "heureDebut": "09:00", "heureFin": "12:00" }
     */
    @PutMapping("/{id}/disponibilites")
    public ResponseEntity<List<DisponibiliteMedecin>> definirDisponibilites(
            @PathVariable UUID id,
            @RequestBody List<DisponibiliteMedecin> creneaux) {
        return ResponseEntity.ok(medecinService.definirDisponibilites(id, creneaux));
    }
 
    /**
     * PATCH /api/v1/medecins/creneaux/{creneauId}
     * Active ou désactive un créneau individuel.
     * Body : { "actif": true }
     */
    @PatchMapping("/creneaux/{creneauId}")
    public ResponseEntity<DisponibiliteMedecin> toggleCreneau(
            @PathVariable UUID creneauId,
            @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(medecinService.toggleCreneau(creneauId, body.get("actif")));
    }
 
    /**
     * GET /api/v1/medecins/{id}/disponible?date=2025-06-10
     */
    @GetMapping("/{id}/disponible")
    public ResponseEntity<Map<String, Boolean>> estDisponible(
            @PathVariable UUID id,
            @RequestParam LocalDate date) {
        return ResponseEntity.ok(Map.of("disponible", medecinService.estDisponibleLe(id, date)));
    }
 
    // ── Indisponibilités ponctuelles ───────────────────────────────────────────
 
    @GetMapping("/{id}/indisponibilites")
    public ResponseEntity<List<IndisponibilitePonctuelle>> getIndisponibilites(@PathVariable UUID id) {
        return ResponseEntity.ok(medecinService.getIndisponibilites(id));
    }
 
    /**
     * POST /api/v1/medecins/{id}/indisponibilites
     * Body : { "dateDebut": "2025-08-01", "dateFin": "2025-08-15", "motif": "Congés" }
     */
    @PostMapping("/{id}/indisponibilites")
    public ResponseEntity<IndisponibilitePonctuelle> ajouterIndisponibilite(
            @PathVariable UUID id,
            @RequestBody IndisponibiliteRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                medecinService.ajouterIndisponibilite(id, body.dateDebut(), body.dateFin(), body.motif())
        );
    }
 
    @DeleteMapping("/indisponibilites/{indisponibiliteId}")
    public ResponseEntity<Void> supprimerIndisponibilite(@PathVariable UUID indisponibiliteId) {
        medecinService.supprimerIndisponibilite(indisponibiliteId);
        return ResponseEntity.noContent().build();
    }
 
    record IndisponibiliteRequest(LocalDate dateDebut, LocalDate dateFin, String motif) {}
}
