package lahfia.pharmacie.models;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "commande_medicaments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CommandeMedicament {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @JsonBackReference("commande-medicaments")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "commande_id", nullable = false)
    private Commande commande;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medicament_id", nullable = false)
    private Medicament medicament;

    @Column(nullable = false)
    private Integer quantite;

    @Column(nullable = false)
    private Boolean disponible = true;
}
