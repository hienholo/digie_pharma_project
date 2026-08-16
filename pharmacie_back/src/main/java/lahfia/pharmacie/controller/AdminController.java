package lahfia.pharmacie.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lahfia.pharmacie.dto.AdminStatsDTO;
import lahfia.pharmacie.models.Admin;
import lahfia.pharmacie.service.AdminService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/admins")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    /**
     * POST /api/v1/admins
     * Création d'un compte admin (pas d'auto-inscription publique dans l'UI :
     * ce compte se crée une seule fois via cet endpoint, hors du parcours d'inscription visible).
     */
    @PostMapping
    public ResponseEntity<Admin> creer(@RequestBody Admin admin) {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.creer(admin));
    }

    /**
     * GET /api/v1/admins/stats
     * Statistiques globales de la plateforme (comptes par rôle/statut, volumes d'activité).
     */
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDTO> stats() {
        return ResponseEntity.ok(adminService.stats());
    }
}
