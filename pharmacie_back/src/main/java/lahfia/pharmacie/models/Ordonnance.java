package lahfia.pharmacie.models;

import jakarta.persistence.*;
import lombok.*;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import lahfia.pharmacie.enums.Source;
import lahfia.pharmacie.enums.StatutOrdonnance;

@Entity
@Table(name = "ordonnances")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Ordonnance {


     @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
 
    @JsonBackReference("patient-ordonnances")
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;
 
    // Null si l'ordonnance est rédigée par un médecin (source = MEDECIN)
    @Column(name = "image_url")
    private String imageUrl;
 
    // Null si l'ordonnance vient d'un upload patient (source = UPLOAD)
    @JsonBackReference("medecin-ordonnances")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medecin_id")
    private Medecin medecin;
 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Source source;
 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutOrdonnance statut = StatutOrdonnance.EN_ATTENTE_OCR;
 
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
 
    // Médicaments détectés par OCR (flux upload patient)
    @JsonManagedReference("ordonnance-ocr")
    @OneToMany(mappedBy = "ordonnance", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OrdonnanceMedicament> medicamentsOcr = new ArrayList<>();
 
    // Lignes rédigées par le médecin (flux médecin)
    @JsonManagedReference("ordonnance-lignes")
    @OneToMany(mappedBy = "ordonnance", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<LigneOrdonnance> lignes = new ArrayList<>();

    // Le champ "medecin" ci-dessus est exclu du JSON par @JsonBackReference (évite la boucle
    // avec Medecin.ordonnances). Ces getters calculés exposent les infos utiles à l'affichage
    // patient (vue détail d'ordonnance) sans casser la sérialisation.
    @JsonProperty("medecinNom")
    public String getMedecinNom() { return medecin != null ? medecin.getNom() : null; }

    @JsonProperty("medecinPrenom")
    public String getMedecinPrenom() { return medecin != null ? medecin.getPrenom() : null; }

    @JsonProperty("medecinSpecialite")
    public String getMedecinSpecialite() { return medecin != null && medecin.getSpecialite() != null ? medecin.getSpecialite().name() : null; }

    @JsonProperty("medecinNumeroOrdre")
    public String getMedecinNumeroOrdre() { return medecin != null ? medecin.getNumeroOrdre() : null; }
}
