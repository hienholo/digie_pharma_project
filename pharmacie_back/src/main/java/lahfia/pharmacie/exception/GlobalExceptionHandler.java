package lahfia.pharmacie.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(erreur(ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erreur(ex.getMessage()));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleConflict(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(erreur(ex.getMessage()));
    }

    /** Doublon (email, téléphone, numéro d'ordre…) ou valeur NULL interdite. */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrity(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(erreur(messageContrainte(ex)));
    }

    /** Violation de contrainte déclenchée au commit (Hibernate / Bean Validation). */
    @ExceptionHandler(TransactionSystemException.class)
    public ResponseEntity<Map<String, Object>> handleTransactionSystem(TransactionSystemException ex) {
        Throwable cause = ex.getMostSpecificCause();
        if (cause instanceof DataIntegrityViolationException dive) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(erreur(messageContrainte(dive)));
        }
        if (cause instanceof jakarta.validation.ConstraintViolationException cve) {
            String detail = cve.getConstraintViolations().stream()
                    .map(v -> v.getPropertyPath() + " : " + v.getMessage())
                    .reduce("", (a, b) -> a.isEmpty() ? b : a + ", " + b);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erreur("Validation échouée : " + detail));
        }
        log.error("Erreur transaction : {}", cause.getMessage(), cause);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(erreur("Données invalides."));
    }

    /**
     * Erreurs explicitement levées avec un statut précis (ex : login invalide, 401).
     * Sans ce handler, elles tombaient dans handleGeneric() et perdaient leur statut
     * et leur message réel au profit d'un générique "Une erreur interne est survenue.".
     */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatus(ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode())
                .body(erreur(ex.getReason() != null ? ex.getReason() : "Requête invalide."));
    }

    /** JSON malformé ou champ attendu absent. */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleBadJson(HttpMessageNotReadableException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(erreur("Format de la requête invalide ou champ manquant."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        log.error("Erreur interne : {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(erreur("Une erreur interne est survenue."));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private String messageContrainte(DataIntegrityViolationException ex) {
        String cause = ex.getMostSpecificCause().getMessage();
        if (cause == null) return "Cette valeur existe déjà ou un champ requis est vide.";
        String lower = cause.toLowerCase();
        if (lower.contains("foreign key")) return "Impossible de supprimer : des données sont encore rattachées à ce compte.";
        if (lower.contains("email"))           return "Cet email est déjà utilisé.";
        if (lower.contains("telephone"))       return "Ce numéro de téléphone est déjà utilisé.";
        if (lower.contains("numero_ordre"))    return "Ce numéro d'ordre médecin est déjà enregistré.";
        if (lower.contains("numero_identite")) return "Ce numéro de pièce d'identité est déjà enregistré.";
        if (lower.contains("not-null") || lower.contains("not null") || lower.contains("null value"))
            return "Un champ obligatoire est vide.";
        if (lower.contains("unique") || lower.contains("duplicate") || lower.contains("already exists"))
            return "Cette valeur existe déjà.";
        return "Contrainte de données violée.";
    }

    private Map<String, Object> erreur(String message) {
        return Map.of(
                "timestamp", LocalDateTime.now().toString(),
                "message", message
        );
    }
}
