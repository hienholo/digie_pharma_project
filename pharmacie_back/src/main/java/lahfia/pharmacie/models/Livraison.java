package lahfia.pharmacie.models;

import jakarta.persistence.*;
import lombok.*;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.UUID;

import lahfia.pharmacie.enums.AssigneeType;
import lahfia.pharmacie.enums.Statut;
import lahfia.pharmacie.enums.StatutLivraison;

@Entity
@Table(name = "livraisons")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Livraison {

     @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
 
    @JsonBackReference("commande-livraison")
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "commande_id", nullable = false, unique = true)
    private Commande commande;
 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutLivraison statut = StatutLivraison.EN_ATTENTE_LIVREUR;
 
    // Null jusqu'à ce qu'un livreur soit assigné
    @JsonBackReference("livreur-livraisons")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "livreur_id")
    private Livreur livreur;
 
    // Adresse de livraison au moment de la commande (snapshot)
    @Column(name = "adresse_livraison")
    private String adresseLivraison;
 
    @Column(name = "note_livraison", length = 500)
    private String noteLivraison;
 
    // Horodatages des transitions
    @Column(name = "assignee_at")
    private LocalDateTime assigneeAt;
 
    @Column(name = "prise_en_charge_at")
    private LocalDateTime priseEnChargeAt;
 
    @Column(name = "livree_at")
    private LocalDateTime livreeAt;
 
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @JsonProperty("commandeId")
    public UUID getCommandeId() { return commande != null ? commande.getId() : null; }

    @JsonProperty("livreurId")
    public UUID getLivreurId() { return livreur != null ? livreur.getId() : null; }
}
