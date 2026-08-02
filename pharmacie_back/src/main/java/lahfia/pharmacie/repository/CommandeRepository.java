package lahfia.pharmacie.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import lahfia.pharmacie.models.Commande;

public interface CommandeRepository extends JpaRepository<Commande, UUID> {
    List<Commande> findByPharmacieIdOrderByCreatedAtDesc(UUID pharmacieId);

    @Query("SELECT c FROM Commande c WHERE c.demande.patient.id = :patientId ORDER BY c.createdAt DESC")
    List<Commande> findByPatientIdOrderByCreatedAtDesc(@Param("patientId") UUID patientId);
}
