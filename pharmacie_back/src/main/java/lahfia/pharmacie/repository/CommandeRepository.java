package lahfia.pharmacie.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import lahfia.pharmacie.models.Commande;

public interface CommandeRepository extends JpaRepository<Commande, UUID> {
    List<Commande> findByPharmacieIdOrderByCreatedAtDesc(UUID pharmacieId);
}
