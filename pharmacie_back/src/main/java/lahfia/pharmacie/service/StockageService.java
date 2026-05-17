package lahfia.pharmacie.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import lombok.extern.slf4j.Slf4j;

/**
 * Service de stockage d'images pour le MVP.
 * À remplacer par une intégration cloud (S3, Google Cloud Storage, Cloudinary…).
 */
@Slf4j
@Service
public class StockageService {

    /**
     * Stocke un fichier uploadé et retourne son URL publique.
     *
     * @param fichier fichier à stocker
     * @return URL publique de l'image
     */
    public String stocker(MultipartFile fichier) {
        String nom = UUID.randomUUID() + "_" + fichier.getOriginalFilename();
        log.info("[STOCKAGE] Fichier à stocker : {}", nom);
        // TODO : uploader vers S3 / GCS / Cloudinary et retourner l'URL réelle
        return "https://storage.lahfia.com/ordonnances/" + nom;
    }
}
