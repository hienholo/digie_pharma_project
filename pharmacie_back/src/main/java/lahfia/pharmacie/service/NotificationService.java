package lahfia.pharmacie.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lahfia.pharmacie.enums.TypeDestinataire;
import lahfia.pharmacie.enums.TypeEvenement;
import lahfia.pharmacie.models.Notification;
import lahfia.pharmacie.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public List<Notification> findByDestinataire(UUID destinataireId) {
        return notificationRepository.findByDestinataireIdOrderByCreatedAtDesc(destinataireId);
    }

    public List<Notification> findNonLues(UUID destinataireId) {
        return notificationRepository.findByDestinataireIdAndLueFalseOrderByCreatedAtDesc(destinataireId);
    }

    public long compterNonLues(UUID destinataireId) {
        return notificationRepository.countByDestinataireIdAndLueFalse(destinataireId);
    }

    /**
     * Crée et persiste une notification. Appelé par tous les autres services.
     */
    @Transactional
    public Notification notifier(UUID destinataireId,
                                  TypeDestinataire typeDestinataire,
                                  TypeEvenement typeEvenement,
                                  String message) {
        Notification notification = Notification.builder()
                .destinataireId(destinataireId)
                .typeDestinataire(typeDestinataire)
                .typeEvenement(typeEvenement)
                .message(message)
                .lue(false)
                .build();
        return notificationRepository.save(notification);
    }

    /**
     * Marquer une notification comme lue.
     */
    @Transactional
    public void marquerLue(UUID notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setLue(true);
            notificationRepository.save(n);
        });
    }

    /**
     * Marquer toutes les notifications d'un destinataire comme lues.
     */
    @Transactional
    public void marquerToutesLues(UUID destinataireId) {
        List<Notification> nonLues = findNonLues(destinataireId);
        nonLues.forEach(n -> n.setLue(true));
        notificationRepository.saveAll(nonLues);
    }
}
