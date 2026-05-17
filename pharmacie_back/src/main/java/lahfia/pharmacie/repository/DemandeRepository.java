package lahfia.pharmacie.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import lahfia.pharmacie.models.Demande;

public interface DemandeRepository extends JpaRepository<Demande, UUID> {
    List<Demande> findByPatientIdOrderByCreatedAtDesc(UUID patientId);
}
