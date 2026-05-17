package lahfia.pharmacie.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "pharmacies")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Pharmacie {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String adresse;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    private String telephone;

    @Column(name = "livraison_active", nullable = false)
    private Boolean livraisonActive = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @JsonManagedReference("pharmacie-reponses")
    @OneToMany(mappedBy = "pharmacie", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DemandePharmacieReponse> reponses;
 
    @JsonManagedReference("pharmacie-commandes")
    @OneToMany(mappedBy = "pharmacie", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Commande> commandes;
}
