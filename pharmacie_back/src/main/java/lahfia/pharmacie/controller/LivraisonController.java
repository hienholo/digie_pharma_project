package lahfia.pharmacie.controller;


import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lahfia.pharmacie.models.EvaluationLivreur;
import lahfia.pharmacie.models.Livraison;
import lahfia.pharmacie.service.LivraisonService;
import lombok.RequiredArgsConstructor;
 
@RestController
@RequestMapping("/api/v1/livraisons")
@RequiredArgsConstructor
public class LivraisonController {
 
    private final LivraisonService livraisonService;
 
    @GetMapping("/{id}")
    public ResponseEntity<Livraison> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(livraisonService.findById(id));
    }
 
    @GetMapping("/commande/{commandeId}")
    public ResponseEntity<Livraison> getByCommande(@PathVariable UUID commandeId) {
        return ResponseEntity.ok(livraisonService.findByCommande(commandeId));
    }
 
    @GetMapping("/livreur/{livreurId}")
    public ResponseEntity<List<Livraison>> getByLivreur(@PathVariable UUID livreurId) {
        return ResponseEntity.ok(livraisonService.findByLivreur(livreurId));
    }
 
    @GetMapping("/livreur/{livreurId}/active")
    public ResponseEntity<List<Livraison>> getCourseActive(@PathVariable UUID livreurId) {
        return ResponseEntity.ok(livraisonService.findCourseActive(livreurId));
    }
 
    /**
     * GET /api/v1/livraisons/en-attente — pharmacie/admin
     * Livraisons sans livreur assigné.
     */
    @GetMapping("/en-attente")
    public ResponseEntity<List<Livraison>> getEnAttente() {
        return ResponseEntity.ok(livraisonService.findEnAttente());
    }
 
    /**
     * PATCH /api/v1/livraisons/{id}/assigner/{livreurId}
     * Assignation manuelle par la pharmacie ou un admin.
     */
    @PatchMapping("/{id}/assigner/{livreurId}")
    public ResponseEntity<Livraison> assignerLivreur(
            @PathVariable UUID id,
            @PathVariable UUID livreurId) {
        return ResponseEntity.ok(livraisonService.assignerLivreur(id, livreurId));
    }
 
    /**
     * PATCH /api/v1/livraisons/{id}/assigner-auto
     * Assignation automatique : prend le livreur disponible le plus proche.
     */
    @PatchMapping("/{id}/assigner-auto")
    public ResponseEntity<Livraison> assignerAutomatiquement(@PathVariable UUID id) {
        return ResponseEntity.ok(livraisonService.assignerAutomatiquement(id));
    }
 
    /**
     * PATCH /api/v1/livraisons/{id}/prendre-en-charge
     * Le livreur confirme qu'il a récupéré la commande à la pharmacie.
     * Body : { "livreurId": "..." }
     */
    @PatchMapping("/{id}/prendre-en-charge")
    public ResponseEntity<Livraison> prendreEnCharge(
            @PathVariable UUID id,
            @RequestBody LivreurActionRequest body) {
        return ResponseEntity.ok(livraisonService.prendreEnCharge(id, body.livreurId()));
    }
 
    /**
     * PATCH /api/v1/livraisons/{id}/confirmer
     * Le livreur confirme la livraison effectuée.
     * Body : { "livreurId": "...", "note": "Laissé en boîte aux lettres" }
     */
    @PatchMapping("/{id}/confirmer")
    public ResponseEntity<Livraison> confirmer(
            @PathVariable UUID id,
            @RequestBody ConfirmerRequest body) {
        return ResponseEntity.ok(livraisonService.confirmerLivraison(id, body.livreurId(), body.note()));
    }
 
    /**
     * PATCH /api/v1/livraisons/{id}/echec
     * Le livreur signale un échec de livraison.
     * Body : { "livreurId": "...", "note": "Patient absent" }
     */
    @PatchMapping("/{id}/echec")
    public ResponseEntity<Livraison> signalerEchec(
            @PathVariable UUID id,
            @RequestBody ConfirmerRequest body) {
        return ResponseEntity.ok(livraisonService.signalerEchec(id, body.livreurId(), body.note()));
    }
 
    /**
     * POST /api/v1/livraisons/{id}/evaluer
     * Le patient note le livreur après une livraison terminée.
     * Body : { "patientId": "...", "note": 5, "commentaire": "..." (nullable) }
     */
    @PostMapping("/{id}/evaluer")
    public ResponseEntity<EvaluationLivreur> evaluer(
            @PathVariable UUID id,
            @RequestBody EvaluerRequest body) {
        return ResponseEntity.ok(livraisonService.evaluer(id, body.patientId(), body.note(), body.commentaire()));
    }

    record LivreurActionRequest(UUID livreurId) {}
    record ConfirmerRequest(UUID livreurId, String note) {}
    record EvaluerRequest(UUID patientId, int note, String commentaire) {}
}