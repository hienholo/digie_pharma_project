package lahfia.pharmacie.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import lahfia.pharmacie.models.DemandePharmacieReponse;

public interface DemandePharmacieReponseRepository extends JpaRepository<DemandePharmacieReponse, UUID> {
    Optional<DemandePharmacieReponse> findByDemandeIdAndPharmacieId(UUID demandeId, UUID pharmacieId);
    List<DemandePharmacieReponse> findByDemandeId(UUID demandeId);
    List<DemandePharmacieReponse> findByPharmacieIdAndReponseIsNull(UUID pharmacieId);
}
