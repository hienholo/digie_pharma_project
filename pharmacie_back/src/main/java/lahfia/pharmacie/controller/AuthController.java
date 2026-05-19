package lahfia.pharmacie.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lahfia.pharmacie.dto.LoginRequest;
import lahfia.pharmacie.dto.LoginResponse;
import lahfia.pharmacie.service.AuthService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/v1/auth/login
     * Body : { "email": "...", "password": "...", "role": "PATIENT|MEDECIN|PHARMACIE|LIVREUR" }
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }
}
