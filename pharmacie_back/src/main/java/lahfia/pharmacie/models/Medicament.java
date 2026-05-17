package lahfia.pharmacie.models;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "medicaments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Medicament {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "nom_commercial", nullable = false)
    private String nomCommercial;

    @Column(name = "nom_generique")
    private String nomGenerique;

    private String dosage;
    private String forme;
}
