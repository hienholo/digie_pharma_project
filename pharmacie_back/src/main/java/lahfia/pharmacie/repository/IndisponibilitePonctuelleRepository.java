package lahfia.pharmacie.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import lahfia.pharmacie.models.IndisponibilitePonctuelle;
 
public interface IndisponibilitePonctuelleRepository extends JpaRepository<IndisponibilitePonctuelle, UUID> {
 
    List<IndisponibilitePonctuelle> findByMedecinId(UUID medecinId);
 
    @Query("""
            SELECT i FROM IndisponibilitePonctuelle i
            WHERE i.medecin.id = :medecinId
            AND i.dateDebut <= :date
            AND i.dateFin >= :date
            """)
    List<IndisponibilitePonctuelle> findByMedecinIdAndDate(
            @Param("medecinId") UUID medecinId,
            @Param("date") LocalDate date
    );
}