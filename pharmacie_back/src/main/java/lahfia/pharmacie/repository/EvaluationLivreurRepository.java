package lahfia.pharmacie.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import lahfia.pharmacie.models.EvaluationLivreur;

public interface EvaluationLivreurRepository extends JpaRepository<EvaluationLivreur, UUID> {

    @Query("SELECT e FROM EvaluationLivreur e WHERE e.livraison.id = :livraisonId")
    Optional<EvaluationLivreur> findByLivraisonId(@Param("livraisonId") UUID livraisonId);
}
