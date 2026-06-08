package lahfia.pharmacie.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import lahfia.pharmacie.models.RappelMedicament;

public interface RappelMedicamentRepository extends JpaRepository<RappelMedicament, UUID> {

    /** Rappels du jour : récurrents OU non-récurrents dont la date = aujourd'hui */
    @Query("SELECT r FROM RappelMedicament r WHERE r.patient.id = :patientId " +
           "AND (r.recurrent = true OR r.dateRappel = :date) ORDER BY r.heure ASC")
    List<RappelMedicament> findJour(@Param("patientId") UUID patientId, @Param("date") LocalDate date);

    List<RappelMedicament> findByPatientIdOrderByHeureAsc(UUID patientId);
}
