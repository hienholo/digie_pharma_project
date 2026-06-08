package lahfia.pharmacie.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

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

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicate(DataIntegrityViolationException ex) {
        String detail = getRootCauseMessage(ex).toLowerCase();
        String message;
        if (detail.contains("email")) {
            message = "Cet email est déjà utilisé.";
        } else if (detail.contains("telephone")) {
            message = "Ce numéro de téléphone est déjà utilisé.";
        } else if (detail.contains("numero_ordre") || detail.contains("numeroordre")) {
            message = "Ce numéro d'ordre est déjà utilisé.";
        } else if (detail.contains("duplicate") || detail.contains("unique") || detail.contains("already exists")) {
            message = "Cette valeur est déjà utilisée (doublon).";
        } else {
            log.error("Violation contrainte BD : {}", ex.getMessage());
            message = "Données invalides ou en doublon.";
        }
        return ResponseEntity.status(HttpStatus.CONFLICT).body(erreur(message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        log.error("Erreur interne : {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(erreur("Une erreur interne est survenue."));
    }

    private String getRootCauseMessage(Throwable ex) {
        Throwable cause = ex;
        while (cause.getCause() != null) {
            cause = cause.getCause();
        }
        return cause.getMessage() != null ? cause.getMessage() : "";
    }

    private Map<String, Object> erreur(String message) {
        return Map.of(
                "timestamp", LocalDateTime.now().toString(),
                "message", message
        );
    }
}
