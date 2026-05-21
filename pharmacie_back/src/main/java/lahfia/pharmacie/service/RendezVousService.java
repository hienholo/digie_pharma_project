package lahfia.pharmacie.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lahfia.pharmacie.dto.RendezVousDTO;
import lahfia.pharmacie.enums.StatutRendezVous;
import lahfia.pharmacie.exception.ResourceNotFoundException;
import lahfia.pharmacie.models.Medecin;
import lahfia.pharmacie.models.Patient;
import lahfia.pharmacie.models.RendezVous;
import lahfia.pharmacie.repository.RendezVousRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RendezVousService {

    private final RendezVousRepository rendezVousRepository;
    private final PatientService patientService;
    private final MedecinService medecinService;

    public List<RendezVousDTO> findByMedecin(UUID medecinId) {
        List<RendezVous> rdvs = rendezVousRepository.findByMedecinIdOrderByDateRdvAscHeureAsc(medecinId);
        List<RendezVousDTO> dtos = new ArrayList<>();
        for (RendezVous r : rdvs) {
            dtos.add(toDTO(r));
        }
        return dtos;
    }

    public List<RendezVousDTO> findByPatient(UUID patientId) {
        List<RendezVous> rdvs = rendezVousRepository.findByPatientIdOrderByDateRdvAscHeureAsc(patientId);
        List<RendezVousDTO> dtos = new ArrayList<>();
        for (RendezVous r : rdvs) {
            dtos.add(toDTO(r));
        }
        return dtos;
    }

    @Transactional
    public RendezVousDTO creer(UUID patientId, UUID medecinId, String dateRdv, String heure, String motif) {
        Patient patient = patientService.findById(patientId);
        Medecin medecin = medecinService.findById(medecinId);
        RendezVous rdv = RendezVous.builder()
                .patient(patient)
                .medecin(medecin)
                .dateRdv(LocalDate.parse(dateRdv))
                .heure(heure)
                .motif(motif)
                .build();
        return toDTO(rendezVousRepository.save(rdv));
    }

    @Transactional
    public RendezVousDTO confirmer(UUID id) {
        RendezVous rdv = findEntityById(id);
        rdv.setStatut(StatutRendezVous.CONFIRME);
        return toDTO(rendezVousRepository.save(rdv));
    }

    @Transactional
    public RendezVousDTO annuler(UUID id) {
        RendezVous rdv = findEntityById(id);
        rdv.setStatut(StatutRendezVous.ANNULE);
        return toDTO(rendezVousRepository.save(rdv));
    }

    private RendezVous findEntityById(UUID id) {
        return rendezVousRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous non trouvé : " + id));
    }

    private RendezVousDTO toDTO(RendezVous r) {
        Patient p = r.getPatient();
        Medecin m = r.getMedecin();
        return new RendezVousDTO(
                r.getId(),
                r.getStatut().name(),
                r.getDateRdv().toString(),
                r.getHeure(),
                r.getMotif(),
                r.getCreatedAt(),
                p.getId(), p.getPrenom(), p.getNom(), p.getTelephone(),
                m.getId(), m.getPrenom(), m.getNom(), m.getSpecialite().name(), m.getAdresseCabinet()
        );
    }
}
