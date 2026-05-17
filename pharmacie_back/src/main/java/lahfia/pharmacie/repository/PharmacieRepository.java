package lahfia.pharmacie.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import lahfia.pharmacie.models.Pharmacie;

public interface PharmacieRepository extends JpaRepository<Pharmacie, UUID> {

    /**
     * Recherche les pharmacies dans un rayon donné (km) via la formule de Haversine.
     * Compatible PostgreSQL.
     */
    @Query(value = """
            SELECT * FROM pharmacies p
            WHERE (6371 * acos(
                cos(radians(:lat)) * cos(radians(p.latitude)) *
                cos(radians(p.longitude) - radians(:lng)) +
                sin(radians(:lat)) * sin(radians(p.latitude))
            )) <= :rayonKm
            ORDER BY (6371 * acos(
                cos(radians(:lat)) * cos(radians(p.latitude)) *
                cos(radians(p.longitude) - radians(:lng)) +
                sin(radians(:lat)) * sin(radians(p.latitude))
            )) ASC
            """, nativeQuery = true)
    List<Pharmacie> findPharmaciesProches(
            @Param("lat") Double latitude,
            @Param("lng") Double longitude,
            @Param("rayonKm") Double rayonKm
    );
}
