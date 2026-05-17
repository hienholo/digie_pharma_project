package lahfia.pharmacie.service;

import java.util.List;

import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;

/**
 * Service OCR simplifié pour le MVP.
 * À remplacer par une intégration réelle (Google Vision, Tesseract, AWS Textract…).
 */
@Slf4j
@Service
public class OcrService {

    /**
     * Extrait les noms de médicaments depuis l'URL d'une image d'ordonnance.
     *
     * @param imageUrl URL de l'image stockée
     * @return liste des noms de médicaments détectés
     */
    public List<String> extraireMedicaments(String imageUrl) {
        log.info("[OCR] Analyse de l'ordonnance : {}", imageUrl);
        // TODO : intégrer un vrai moteur OCR
        // Exemple : appeler Google Cloud Vision API, puis parser le texte retourné
        // pour en extraire les noms de médicaments via regex ou NLP léger.
        return List.of();
    }
}
