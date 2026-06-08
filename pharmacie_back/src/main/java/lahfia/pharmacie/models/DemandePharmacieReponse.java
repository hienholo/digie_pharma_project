package lahfia.pharmacie.models;

import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lahfia.pharmacie.enums.Reponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "demande_pharmacie_reponses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DemandePharmacieReponse {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @JsonBackReference("demande-reponses")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "demande_id", nullable = false)
    private Demande demande;
 
    @JsonBackReference("pharmacie-reponses")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pharmacie_id", nullable = false)
    private Pharmacie pharmacie;

    @Enumerated(EnumType.STRING)
    private Reponse reponse;

    // Précision des produits disponibles si réponse partielle
    @Column(name = "detail_partiel", length = 1000)
    private String detailPartiel;

    @Column(name = "repondu_at")
    private LocalDateTime reponduAt;

    @JsonProperty("pharmacieId")
    public UUID getPharmacieId() { return pharmacie != null ? pharmacie.getId() : null; }

    @JsonProperty("pharmacieNom")
    public String getPharmacieNom() { return pharmacie != null ? pharmacie.getNom() : null; }

    @JsonProperty("pharmacieAdresse")
    public String getPharmacieAdresse() { return pharmacie != null ? pharmacie.getAdresse() : null; }

    @JsonProperty("pharmacieTelephone")
    public String getPharmaciePhone() { return pharmacie != null ? pharmacie.getTelephone() : null; }

    @JsonProperty("demandeId")
    public UUID getDemandeId() { return demande != null ? demande.getId() : null; }
}
