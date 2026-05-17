package lahfia.pharmacie.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import lahfia.pharmacie.enums.Specialite;
import lahfia.pharmacie.enums.StatutMedecin;
import lahfia.pharmacie.models.Medecin;
 
public interface MedecinRepository extends JpaRepository<Medecin, UUID> {
 
    boolean existsByEmail(String email);
    boolean existsByNumeroOrdre(String numeroOrdre);
    Optional<Medecin> findByEmail(String email);
 
    List<Medecin> findByStatut(StatutMedecin statut);
    List<Medecin> findBySpecialite(Specialite specialite);
 
    @Query(value = """
            SELECT * FROM medecins m
            WHERE m.statut = 'ACTIF'
            AND (6371 * acos(
                cos(radians(:lat)) * cos(radians(m.latitude)) *
                cos(radians(m.longitude) - radians(:lng)) +
                sin(radians(:lat)) * sin(radians(m.latitude))
            )) <= :rayonKm
            ORDER BY (6371 * acos(
                cos(radians(:lat)) * cos(radians(m.latitude)) *
                cos(radians(m.longitude) - radians(:lng)) +
                sin(radians(:lat)) * sin(radians(m.latitude))
            )) ASC
            """, nativeQuery = true)
    List<Medecin> findMedecinsProches(
            @Param("lat") Double latitude,
            @Param("lng") Double longitude,
            @Param("rayonKm") Double rayonKm
    );
}
