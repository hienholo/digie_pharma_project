package lahfia.pharmacie.models;

import jakarta.persistence.*;
import lahfia.pharmacie.enums.StatutDemande;
import lahfia.pharmacie.enums.Type;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "demandes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Demande {


    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @JsonBackReference("patient-demandes")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordonnance_id")
    private Ordonnance ordonnance;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type;

    @Column(name = "medicament_recherche", length = 500)
    private String medicamentRecherche;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutDemande statut = StatutDemande.EN_COURS;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @JsonManagedReference("demande-reponses")
    @OneToMany(mappedBy = "demande", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DemandePharmacieReponse> reponses;
 
    @JsonManagedReference("demande-commande")
    @OneToOne(mappedBy = "demande", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Commande commande;
}
