package lahfia.pharmacie.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lahfia.pharmacie.exception.ResourceNotFoundException;
import lahfia.pharmacie.models.Pharmacie;
import lahfia.pharmacie.repository.PharmacieRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PharmacieService {

    private final PharmacieRepository pharmacieRepository;

    // Rayon de recherche par défaut en kilomètres
    private static final double RAYON_DEFAUT_KM = 5.0;

    public Pharmacie findById(UUID id) {
        return pharmacieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pharmacie non trouvée : " + id));
    }

    /**
     * Recherche les pharmacies dans un rayon donné autour d'un point GPS.
     * Utilise la formule de Haversine via une requête JPQL native.
     */
    public List<Pharmacie> rechercherAProximite(Double latitude, Double longitude, Double rayonKm) {
        double rayon = (rayonKm != null) ? rayonKm : RAYON_DEFAUT_KM;
        return pharmacieRepository.findPharmaciesProches(latitude, longitude, rayon);
    }

    @Transactional
    public Pharmacie creer(Pharmacie pharmacie) {
        return pharmacieRepository.save(pharmacie);
    }

    @Transactional
    public Pharmacie toggleLivraison(UUID id, boolean actif) {
        Pharmacie pharmacie = findById(id);
        pharmacie.setLivraisonActive(actif);
        return pharmacieRepository.save(pharmacie);
    }
    
    @Transactional
    public List<Pharmacie> findAll() {
    return pharmacieRepository.findAll();
}
}
