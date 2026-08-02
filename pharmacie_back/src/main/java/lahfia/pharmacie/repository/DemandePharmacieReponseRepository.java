package lahfia.pharmacie.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import lahfia.pharmacie.models.DemandePharmacieReponse;

public interface DemandePharmacieReponseRepository extends JpaRepository<DemandePharmacieReponse, UUID> {

    // Requêtes explicites : la dérivation automatique de "...PharmacieId..." entre en conflit
    // avec le getter calculé DemandePharmacieReponse.getPharmacieId() (propriété JavaBean
    // "pharmacieId" sans attribut JPA correspondant), ce qui fait échouer la génération HQL.
    @Query("SELECT d FROM DemandePharmacieReponse d WHERE d.demande.id = :demandeId AND d.pharmacie.id = :pharmacieId")
    Optional<DemandePharmacieReponse> findByDemandeIdAndPharmacieId(@Param("demandeId") UUID demandeId, @Param("pharmacieId") UUID pharmacieId);

    @Query("SELECT d FROM DemandePharmacieReponse d WHERE d.demande.id = :demandeId")
    List<DemandePharmacieReponse> findByDemandeId(@Param("demandeId") UUID demandeId);

    @Query("SELECT d FROM DemandePharmacieReponse d WHERE d.pharmacie.id = :pharmacieId AND d.reponse IS NULL")
    List<DemandePharmacieReponse> findByPharmacieIdAndReponseIsNull(@Param("pharmacieId") UUID pharmacieId);
}
