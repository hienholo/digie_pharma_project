package lahfia.pharmacie.models;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "ordonnance_medicaments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrdonnanceMedicament {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @JsonBackReference("ordonnance-ocr")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ordonnance_id", nullable = false)
    private Ordonnance ordonnance;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medicament_id", nullable = false)
    private Medicament medicament;

    private String quantite;

    @Column(name = "corrige_manuellement", nullable = false)
    private Boolean corrigeManuellement = false;
}
