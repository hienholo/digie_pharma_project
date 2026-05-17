package lahfia.pharmacie.models;

import jakarta.persistence.*;
import lahfia.pharmacie.enums.TypeDestinataire;
import lahfia.pharmacie.enums.TypeEvenement;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Polymorphe : pointe vers un Patient ou une Pharmacie selon typeDestinataire
    @Column(name = "destinataire_id", nullable = false)
    private UUID destinataireId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_destinataire", nullable = false)
    private TypeDestinataire typeDestinataire;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_evenement", nullable = false)
    private TypeEvenement typeEvenement;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(nullable = false)
    private Boolean lue = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
