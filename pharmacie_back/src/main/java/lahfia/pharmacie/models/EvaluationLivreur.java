package lahfia.pharmacie.models;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Note laissée par un patient à un livreur après une livraison confirmée (une seule par livraison). */
@Entity
@Table(name = "evaluations_livreur")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EvaluationLivreur {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @JsonBackReference("livraison-evaluation")
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "livraison_id", nullable = false, unique = true)
    private Livraison livraison;

    @JsonBackReference("livreur-evaluations")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "livreur_id", nullable = false)
    private Livreur livreur;

    @Column(nullable = false)
    private Integer note; // 1 à 5

    @Column(length = 500)
    private String commentaire;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
