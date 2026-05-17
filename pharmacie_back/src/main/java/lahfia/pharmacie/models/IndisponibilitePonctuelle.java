package lahfia.pharmacie.models;

import java.time.LocalDate;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
 
/**
 * Indisponibilité ponctuelle d'un médecin (congé, absence, jour férié…).
 * Prend le dessus sur les créneaux récurrents de DisponibiliteMedecin.
 */
@Entity
@Table(name = "indisponibilites_ponctuelles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class IndisponibilitePonctuelle {
 
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
 
     @JsonBackReference("medecin-indisponibilites")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medecin_id", nullable = false)
    private Medecin medecin;
 
    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;
 
    @Column(name = "date_fin", nullable = false)
    private LocalDate dateFin;
 
    private String motif;
}
 
