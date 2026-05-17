package lahfia.pharmacie.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import lahfia.pharmacie.enums.DisponibiliteStatut;
import lahfia.pharmacie.enums.StatutLivreur;
import lahfia.pharmacie.models.Livreur;

public interface LivreurRepository extends JpaRepository<Livreur, UUID>{

    boolean existsByEmail(String email);
    boolean existsByTelephone(String telephone);
    Optional<Livreur> findByEmail(String email);
 
    List<Livreur> findByStatut(StatutLivreur statut);
 
    List<Livreur> findByStatutAndDisponibiliteStatut(
            StatutLivreur statut,
            DisponibiliteStatut disponibiliteStatut
    );
 
    /**
     * Livreurs ACTIFS et DISPONIBLES dans un rayon donné (Haversine).
     */
    @Query(value = """
            SELECT * FROM livreurs l
            WHERE l.statut = 'ACTIF'
            AND l.disponibilite_statut = 'DISPONIBLE'
            AND l.latitude IS NOT NULL
            AND l.longitude IS NOT NULL
            AND (6371 * acos(
                cos(radians(:lat)) * cos(radians(l.latitude)) *
                cos(radians(l.longitude) - radians(:lng)) +
                sin(radians(:lat)) * sin(radians(l.latitude))
            )) <= :rayonKm
            ORDER BY (6371 * acos(
                cos(radians(:lat)) * cos(radians(l.latitude)) *
                cos(radians(l.longitude) - radians(:lng)) +
                sin(radians(:lat)) * sin(radians(l.latitude))
            )) ASC
            """, nativeQuery = true)
    List<Livreur> findLivreursDisponiblesProches(
            @Param("lat") Double latitude,
            @Param("lng") Double longitude,
            @Param("rayonKm") Double rayonKm
    );
}
