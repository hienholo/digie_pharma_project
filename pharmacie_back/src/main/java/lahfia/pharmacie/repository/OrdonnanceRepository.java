package lahfia.pharmacie.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import lahfia.pharmacie.models.Ordonnance;

public interface OrdonnanceRepository extends JpaRepository<Ordonnance, UUID> {
    List<Ordonnance> findByPatientIdOrderByCreatedAtDesc(UUID patientId);
    List<Ordonnance> findByMedecinIdOrderByCreatedAtDesc(UUID medecinId);
}
