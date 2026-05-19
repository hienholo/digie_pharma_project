package lahfia.pharmacie.models;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lahfia.pharmacie.enums.DisponibiliteStatut;
import lahfia.pharmacie.enums.StatutLivreur;
import lahfia.pharmacie.enums.TypeAffiliation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
 
@Entity
@Table(name = "livreurs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Livreur {
 
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
 
    @Column(nullable = false)
    private String nom;
 
    @Column(nullable = false)
    private String prenom;
 
    @Column(unique = true, nullable = false)
    private String telephone;
 
    @Column(unique = true, nullable = false)
    private String email;
 
    // Numéro de pièce d'identité ou permis de conduire
    @Column(name = "numero_identite", unique = true)
    private String numeroIdentite;
 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutLivreur statut = StatutLivreur.EN_ATTENTE_VALIDATION;
 
    @Enumerated(EnumType.STRING)
    @Column(name = "type_affiliation", nullable = false)
    private TypeAffiliation typeAffiliation = TypeAffiliation.INDEPENDANT;
 
    // Null si INDEPENDANT
    @Column(name = "partenaire_logistique_id")
    private UUID partenaireLogistiqueId;
 
    @Enumerated(EnumType.STRING)
    @Column(name = "disponibilite_statut", nullable = false)
    private DisponibiliteStatut disponibiliteStatut = DisponibiliteStatut.HORS_LIGNE;
 
    // Position GPS courante (mise à jour à chaque prise/fin de service)
    private Double latitude;
    private Double longitude;

    @JsonProperty(value = "password", access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "password_hash")
    private String passwordHash;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
 
    @JsonManagedReference("livreur-livraisons")
    @OneToMany(mappedBy = "livreur", fetch = FetchType.LAZY)
    private List<Livraison> livraisons;
}
 
