package lahfia.pharmacie.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import lahfia.pharmacie.enums.StatutLivraison;
import lahfia.pharmacie.models.Livraison;

public interface LivraisonRepository extends JpaRepository<Livraison, UUID> {
    Optional<Livraison> findByCommandeId(UUID commandeId);
    List<Livraison> findByLivreurId(UUID livreurId);
    List<Livraison> findByLivreurIdAndStatut(UUID livreurId, StatutLivraison statut);
    List<Livraison> findByStatut(StatutLivraison statut);
}
