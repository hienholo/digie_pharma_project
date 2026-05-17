package lahfia.pharmacie.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lahfia.pharmacie.models.Notification;
import lahfia.pharmacie.service.NotificationService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/destinataire/{destinataireId}")
    public ResponseEntity<List<Notification>> getByDestinataire(@PathVariable UUID destinataireId) {
        return ResponseEntity.ok(notificationService.findByDestinataire(destinataireId));
    }

    @GetMapping("/destinataire/{destinataireId}/non-lues")
    public ResponseEntity<List<Notification>> getNonLues(@PathVariable UUID destinataireId) {
        return ResponseEntity.ok(notificationService.findNonLues(destinataireId));
    }

    @GetMapping("/destinataire/{destinataireId}/count")
    public ResponseEntity<Map<String, Long>> compterNonLues(@PathVariable UUID destinataireId) {
        return ResponseEntity.ok(Map.of("count", notificationService.compterNonLues(destinataireId)));
    }

    @PatchMapping("/{id}/lire")
    public ResponseEntity<Void> marquerLue(@PathVariable UUID id) {
        notificationService.marquerLue(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/destinataire/{destinataireId}/lire-tout")
    public ResponseEntity<Void> marquerToutesLues(@PathVariable UUID destinataireId) {
        notificationService.marquerToutesLues(destinataireId);
        return ResponseEntity.noContent().build();
    }
}
