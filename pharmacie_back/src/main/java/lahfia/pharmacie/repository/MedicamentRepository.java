package lahfia.pharmacie.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import lahfia.pharmacie.models.Medicament;

public interface MedicamentRepository extends JpaRepository<Medicament, UUID> {
    Optional<Medicament> findByNomCommercialIgnoreCase(String nomCommercial);
}
