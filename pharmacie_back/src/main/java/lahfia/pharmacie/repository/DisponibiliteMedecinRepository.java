package lahfia.pharmacie.repository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import lahfia.pharmacie.models.DisponibiliteMedecin;
 
public interface DisponibiliteMedecinRepository extends JpaRepository<DisponibiliteMedecin, UUID> {
    List<DisponibiliteMedecin> findByMedecinIdAndActifTrue(UUID medecinId);
    List<DisponibiliteMedecin> findByMedecinIdAndJourSemaineAndActifTrue(UUID medecinId, DayOfWeek jour);
    void deleteByMedecinId(UUID medecinId);
}