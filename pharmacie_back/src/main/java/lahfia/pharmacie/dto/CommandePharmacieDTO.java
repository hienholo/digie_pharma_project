package lahfia.pharmacie.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record CommandePharmacieDTO(
        UUID id,
        String statut,
        String modeObtention,
        String modePaiement,
        LocalDateTime createdAt,
        String patientPrenom,
        String patientNom,
        List<String> medicamentNoms
) {}
