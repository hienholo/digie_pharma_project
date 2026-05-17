package lahfia.pharmacie.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import lahfia.pharmacie.models.LigneOrdonnance;
 
public interface LigneOrdonnanceRepository extends JpaRepository<LigneOrdonnance, UUID> {
    List<LigneOrdonnance> findByOrdonnanceId(UUID ordonnanceId);
}