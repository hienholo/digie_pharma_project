package lahfia.pharmacie.models;

import jakarta.persistence.*;
import lombok.*;
 
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonBackReference;
 
/**
 * Représente un créneau de disponibilité récurrent hebdomadaire.
 * Exemple : LUNDI de 09:00 à 12:00.
 *
 * Pour les indisponibilités ponctuelles (congés, absences),
 * voir IndisponibilitePonctuelle.
 */
@Entity
@Table(
    name = "disponibilites_medecin",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"medecin_id", "jour_semaine", "heure_debut"}
    )
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DisponibiliteMedecin {
 
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
 
    @JsonBackReference("medecin-disponibilites")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medecin_id", nullable = false)
    private Medecin medecin;

    @Enumerated(EnumType.STRING)
    @Column(name = "jour_semaine", nullable = false)
    private DayOfWeek jourSemaine;
 
    @Column(name = "heure_debut", nullable = false)
    private LocalTime heureDebut;
 
    @Column(name = "heure_fin", nullable = false)
    private LocalTime heureFin;
 
    @Column(nullable = false)
    private Boolean actif = true;
}
 
