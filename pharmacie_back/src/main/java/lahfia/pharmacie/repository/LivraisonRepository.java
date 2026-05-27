package lahfia.pharmacie.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import lahfia.pharmacie.enums.StatutLivraison;
import lahfia.pharmacie.models.Livraison;

public interface LivraisonRepository extends JpaRepository<Livraison, UUID> {

    @Query("SELECT l FROM Livraison l WHERE l.commande.id = :commandeId")
    Optional<Livraison> findByCommandeId(@Param("commandeId") UUID commandeId);

    @Query("SELECT l FROM Livraison l WHERE l.livreur.id = :livreurId")
    List<Livraison> findByLivreurId(@Param("livreurId") UUID livreurId);

    @Query("SELECT l FROM Livraison l WHERE l.livreur.id = :livreurId AND l.statut = :statut")
    List<Livraison> findByLivreurIdAndStatut(@Param("livreurId") UUID livreurId, @Param("statut") StatutLivraison statut);

    List<Livraison> findByStatut(StatutLivraison statut);
}
