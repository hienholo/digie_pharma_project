package lahfia.pharmacie.models;

import jakarta.persistence.*;
import lahfia.pharmacie.enums.ModeObtention;
import lahfia.pharmacie.enums.ModePaiement;
import lahfia.pharmacie.enums.Statut;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "commandes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Commande {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @JsonBackReference("demande-commande")
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "demande_id", nullable = false, unique = true)
    private Demande demande;
 
    @JsonBackReference("pharmacie-commandes")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pharmacie_id", nullable = false)
    private Pharmacie pharmacie;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode_obtention", nullable = false)
    private ModeObtention modeObtention;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Statut statut = Statut.EN_PREPARATION;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode_paiement")
    private ModePaiement modePaiement;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @JsonManagedReference("commande-medicaments")
    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CommandeMedicament> medicaments;
 
    @JsonManagedReference("commande-livraison")
    @OneToOne(mappedBy = "commande", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Livraison livraison;
}
