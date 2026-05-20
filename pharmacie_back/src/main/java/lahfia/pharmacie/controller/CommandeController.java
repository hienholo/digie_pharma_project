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

import lahfia.pharmacie.dto.CommandePharmacieDTO;
import lahfia.pharmacie.enums.ModeObtention;
import lahfia.pharmacie.enums.ModePaiement;
import lahfia.pharmacie.models.Commande;
import lahfia.pharmacie.service.CommandeService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/commandes")
@RequiredArgsConstructor
public class CommandeController {

    private final CommandeService commandeService;

    @GetMapping("/{id}")
    public ResponseEntity<Commande> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(commandeService.findById(id));
    }

    @GetMapping("/pharmacie/{pharmacieId}")
    public ResponseEntity<List<Commande>> getByPharmacie(@PathVariable UUID pharmacieId) {
        return ResponseEntity.ok(commandeService.findByPharmacie(pharmacieId));
    }

    @GetMapping("/pharmacie/{pharmacieId}/detail")
    public ResponseEntity<List<CommandePharmacieDTO>> getByPharmacieDetail(@PathVariable UUID pharmacieId) {
        return ResponseEntity.ok(commandeService.findByPharmacieDto(pharmacieId));
    }

    /**
     * POST /api/v1/commandes
     * Le patient valide sa commande après avoir choisi une pharmacie.
     * Body : { "demandeId", "pharmacieId", "modeObtention", "modePaiement", "medicamentIds" }
     */
    @PostMapping
    public ResponseEntity<Commande> valider(@RequestBody ValiderCommandeRequest body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                commandeService.valider(
                        body.demandeId(),
                        body.pharmacieId(),
                        body.modeObtention(),
                        body.modePaiement(),
                        body.medicamentIds()
                )
        );
    }

    /**
     * PATCH /api/v1/commandes/{id}/prete
     * La pharmacie signale que la commande est prête.
     */
    @PatchMapping("/{id}/prete")
    public ResponseEntity<Commande> marquerPrete(@PathVariable UUID id) {
        return ResponseEntity.ok(commandeService.marquerPrete(id));
    }

    /**
     * PATCH /api/v1/commandes/{id}/terminer
     * Clôturer la commande (récupérée ou livrée).
     */
    @PatchMapping("/{id}/terminer")
    public ResponseEntity<Commande> terminer(@PathVariable UUID id) {
        return ResponseEntity.ok(commandeService.terminer(id));
    }

    record ValiderCommandeRequest(
            UUID demandeId,
            UUID pharmacieId,
            ModeObtention modeObtention,
            ModePaiement modePaiement,
            List<UUID> medicamentIds
    ) {}
}
