package lahfia.pharmacie.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import lahfia.pharmacie.models.RendezVous;

public interface RendezVousRepository extends JpaRepository<RendezVous, UUID> {
    List<RendezVous> findByMedecinIdOrderByDateRdvAscHeureAsc(UUID medecinId);
    List<RendezVous> findByPatientIdOrderByDateRdvAscHeureAsc(UUID patientId);
}
