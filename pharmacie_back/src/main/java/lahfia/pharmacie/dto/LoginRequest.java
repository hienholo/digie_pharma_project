package lahfia.pharmacie.dto;

public record LoginRequest(
        String email,
        String password,
        String role   // PATIENT | MEDECIN | PHARMACIE | LIVREUR
) {}
