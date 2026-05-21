package lahfia.pharmacie.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record RendezVousDTO(
    UUID id,
    String statut,
    String dateRdv,
    String heure,
    String motif,
    LocalDateTime createdAt,
    UUID patientId,
    String patientPrenom,
    String patientNom,
    String patientTelephone,
    UUID medecinId,
    String medecinPrenom,
    String medecinNom,
    String medecinSpecialite,
    String medecinAdresse
) {}
