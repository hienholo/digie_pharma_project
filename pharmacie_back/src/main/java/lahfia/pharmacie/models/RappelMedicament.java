package lahfia.pharmacie.models;

import java.time.LocalDate;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;

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

@Entity
@Table(name = "rappels_medicaments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RappelMedicament {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @JsonBackReference("patient-rappels")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "medicament_nom", nullable = false, length = 300)
    private String medicamentNom;

    @Column(name = "dose", length = 100)
    private String dose;

    /** Heure au format "HH:mm", ex : "08:00" */
    @Column(name = "heure", nullable = false, length = 10)
    private String heure;

    /** true = rappel quotidien répété chaque jour */
    @Column(name = "recurrent")
    @Builder.Default
    private boolean recurrent = true;

    /** Pertinent uniquement si recurrent = false */
    @Column(name = "date_rappel")
    private LocalDate dateRappel;

    /** Date à laquelle le médicament a été marqué comme pris (null = non pris) */
    @Column(name = "pris_date")
    private LocalDate prisDate;

    @JsonProperty("patientId")
    public UUID getPatientId() { return patient != null ? patient.getId() : null; }

    /** Pris aujourd'hui ? */
    @JsonProperty("pris")
    public boolean isPrisAujourdhui() {
        return prisDate != null && prisDate.isEqual(LocalDate.now());
    }
}
