package lahfia.pharmacie.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record DemandeEnAttenteDTO(
        UUID reponseId,
        UUID demandeId,
        String patientPrenom,
        String patientNom,
        String patientTelephone,
        String type,
        String medicamentRecherche,
        UUID ordonnanceId,
        String ordonnanceImageUrl,
        List<String> medicamentNoms,
        LocalDateTime createdAt
) {}
