package lahfia.pharmacie.models;

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
 * Ligne d'une ordonnance rédigée par un médecin.
 * Porte les informations cliniques précises (posologie, durée, instructions).
 *
 * Distinct de OrdonnanceMedicament qui est le résultat de l'OCR
 * sur une ordonnance papier uploadée par le patient.
 */
@Entity
@Table(name = "lignes_ordonnance")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LigneOrdonnance {
 
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
 
    @JsonBackReference("ordonnance-lignes")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ordonnance_id", nullable = false)
    private Ordonnance ordonnance;
 
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "medicament_id", nullable = false)
    private Medicament medicament;
 
    @Column(nullable = false)
    private Integer quantite;
 
    // Ex : "1 comprimé matin et soir"
    private String posologie;
 
    // Ex : "7 jours"
    private String duree;
 
    // Instructions complémentaires : "à prendre pendant les repas", "ne pas conduire"
    @Column(length = 500)
    private String instructions;
}
 
