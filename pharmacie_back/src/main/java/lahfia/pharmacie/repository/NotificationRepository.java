package lahfia.pharmacie.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import lahfia.pharmacie.models.Notification;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByDestinataireIdOrderByCreatedAtDesc(UUID destinataireId);
    List<Notification> findByDestinataireIdAndLueFalseOrderByCreatedAtDesc(UUID destinataireId);
    long countByDestinataireIdAndLueFalse(UUID destinataireId);
}
