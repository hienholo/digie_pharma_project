package lahfia.pharmacie.models;

import jakarta.persistence.*;
import lahfia.pharmacie.enums.Specialite;
import lombok.*;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lahfia.pharmacie.enums.StatutMedecin;
 
@Entity
@Table(name = "medecins")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Medecin {
 
 
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
 
    // Numéro d'ordre professionnel (RPPS en France, équivalent local selon pays)
    @Column(name = "numero_ordre", unique = true, nullable = false)
    private String numeroOrdre;
 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Specialite specialite = Specialite.GENERALISTE;
 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutMedecin statut = StatutMedecin.EN_ATTENTE_VALIDATION;
 
    @Column(name = "adresse_cabinet")
    private String adresseCabinet;
    private Double latitude;
    private Double longitude;

    @JsonProperty(value = "password", access = JsonProperty.Access.WRITE_ONLY)
    @Column(name = "password_hash")
    private String passwordHash;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
 
    @JsonManagedReference("medecin-disponibilites")
    @OneToMany(mappedBy = "medecin", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DisponibiliteMedecin> disponibilites;

    @JsonManagedReference("medecin-indisponibilites")
    @OneToMany(mappedBy = "medecin", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<IndisponibilitePonctuelle> indisponibilites;

    @JsonManagedReference("medecin-ordonnances")
    @OneToMany(mappedBy = "medecin", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Ordonnance> ordonnances;
}
