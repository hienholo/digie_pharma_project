package lahfia.pharmacie.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import lahfia.pharmacie.models.Patient;

public interface PatientRepository extends JpaRepository<Patient, UUID> {
    boolean existsByTelephone(String telephone);
}
