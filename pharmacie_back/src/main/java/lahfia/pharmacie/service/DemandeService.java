package lahfia.pharmacie.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lahfia.pharmacie.dto.DemandeEnAttenteDTO;
import lahfia.pharmacie.enums.Reponse;
import lahfia.pharmacie.enums.StatutDemande;
import lahfia.pharmacie.enums.Type;
import lahfia.pharmacie.enums.TypeDestinataire;
import lahfia.pharmacie.enums.TypeEvenement;
import lahfia.pharmacie.exception.ResourceNotFoundException;
import lahfia.pharmacie.models.Demande;
import lahfia.pharmacie.models.DemandePharmacieReponse;
import lahfia.pharmacie.models.Ordonnance;
import lahfia.pharmacie.models.Patient;
import lahfia.pharmacie.models.Pharmacie;
import lahfia.pharmacie.repository.DemandePharmacieReponseRepository;
import lahfia.pharmacie.repository.DemandeRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DemandeService {

    private final DemandeRepository demandeRepository;
    private final DemandePharmacieReponseRepository reponseRepository;
    private final PatientService patientService;
    private final PharmacieService pharmacieService;
    private final NotificationService notificationService;

    public Demande findById(UUID id) {
        return demandeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Demande non trouvée : " + id));
    }

    public List<Demande> findByPatient(UUID patientId) {
        return demandeRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    /**
     * Crée une demande et l'envoie aux pharmacies proches.
     * Le patient peut chercher un médicament seul ou via une ordonnance.
     */
    @Transactional
    public Demande creerEtEnvoyer(UUID patientId, UUID ordonnanceId,
                                   Type type, Double rayonKm) {
        Patient patient = patientService.findById(patientId);

        Demande.DemandeBuilder builder = Demande.builder()
                .patient(patient)
                .type(type)
                .statut(StatutDemande.EN_COURS);

        if (ordonnanceId != null) {
            // La demande sera liée à l'ordonnance (type ORDONNANCE)
            // L'ordonnance elle-même porte les médicaments détectés
            builder.ordonnance(Ordonnance.builder().id(ordonnanceId).build());
        }

        Demande demande = demandeRepository.save(builder.build());

        // Trouver les pharmacies proches et créer une entrée de réponse par pharmacie
        List<Pharmacie> pharmaciesProches = pharmacieService.rechercherAProximite(
                patient.getLatitude(), patient.getLongitude(), rayonKm
        );

        for (Pharmacie pharmacie : pharmaciesProches) {
            reponseRepository.save(
                    DemandePharmacieReponse.builder()
                            .demande(demande)
                            .pharmacie(pharmacie)
                            .build()
            );
            // Notifier chaque pharmacie
            notificationService.notifier(
                    pharmacie.getId(),
                    TypeDestinataire.PHARMACIE,
                    TypeEvenement.DEMANDE_ENVOYEE,
                    "Nouvelle demande reçue d'un patient."
            );
        }

        // Confirmer l'envoi au patient
        notificationService.notifier(
                patientId,
                TypeDestinataire.PATIENT,
                TypeEvenement.DEMANDE_ENVOYEE,
                "Votre demande a été envoyée à " + pharmaciesProches.size() + " pharmacie(s)."
        );

        return demande;
    }

    /**
     * Une pharmacie répond à une demande : disponible / non disponible / partiel.
     */
    @Transactional
    public DemandePharmacieReponse repondre(UUID demandeId, UUID pharmacieId,
                                             Reponse reponse,
                                             String detailPartiel) {
        DemandePharmacieReponse entree = reponseRepository
                .findByDemandeIdAndPharmacieId(demandeId, pharmacieId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Aucune demande en attente pour cette pharmacie."));

        entree.setReponse(reponse);
        entree.setDetailPartiel(detailPartiel);
        entree.setReponduAt(LocalDateTime.now());
        reponseRepository.save(entree);

        // Mettre à jour le statut de la demande et notifier le patient
        Demande demande = findById(demandeId);
        demande.setStatut(StatutDemande.REPONSE_RECUE);
        demandeRepository.save(demande);

        notificationService.notifier(
                demande.getPatient().getId(),
                TypeDestinataire.PATIENT,
                TypeEvenement.REPONSE_PHARMACIE,
                "Une pharmacie a répondu à votre demande : " + reponse.name().toLowerCase() + "."
        );

        return entree;
    }

    /**
     * Retourne toutes les réponses reçues pour une demande donnée.
     */
    public List<DemandePharmacieReponse> getReponses(UUID demandeId) {
        return reponseRepository.findByDemandeId(demandeId);
    }

    /**
     * Retourne les demandes en attente de réponse pour une pharmacie donnée,
     * avec les informations patient et médicaments aplaties dans un DTO.
     */
    public List<DemandeEnAttenteDTO> getDemandesEnAttente(UUID pharmacieId) {
        return reponseRepository.findByPharmacieIdAndReponseIsNull(pharmacieId)
                .stream()
                .map(r -> {
                    Demande d = r.getDemande();
                    Patient p = d.getPatient();
                    Ordonnance ord = d.getOrdonnance();
                    List<String> meds = extractMedicamentNoms(ord);
                    return new DemandeEnAttenteDTO(
                            r.getId(),
                            d.getId(),
                            p.getPrenom(),
                            p.getNom(),
                            p.getTelephone(),
                            d.getType().name(),
                            ord != null ? ord.getId() : null,
                            ord != null ? ord.getImageUrl() : null,
                            meds,
                            d.getCreatedAt()
                    );
                })
                .collect(Collectors.toList());
    }

    private List<String> extractMedicamentNoms(Ordonnance ord) {
        if (ord == null) return List.of();
        List<String> noms = new java.util.ArrayList<>();
        for (lahfia.pharmacie.models.OrdonnanceMedicament om : ord.getMedicamentsOcr()) {
            noms.add(om.getMedicament().getNomCommercial());
        }
        if (noms.isEmpty()) {
            for (lahfia.pharmacie.models.LigneOrdonnance l : ord.getLignes()) {
                noms.add(l.getMedicament().getNomCommercial());
            }
        }
        return noms;
    }
}
