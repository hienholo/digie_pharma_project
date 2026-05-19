package lahfia.pharmacie.dto;

public record LoginResponse(
        String id,
        String role,
        String nom,
        String prenom
) {}
