package lahfia.pharmacie.service;

import java.util.List;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lahfia.pharmacie.dto.AdminStatsDTO;
import lahfia.pharmacie.enums.StatutLivreur;
import lahfia.pharmacie.enums.StatutMedecin;
import lahfia.pharmacie.exception.ResourceNotFoundException;
import lahfia.pharmacie.models.Admin;
import lahfia.pharmacie.models.Livreur;
import lahfia.pharmacie.models.Medecin;
import lahfia.pharmacie.repository.AdminRepository;
import lahfia.pharmacie.repository.CommandeRepository;
import lahfia.pharmacie.repository.DemandeRepository;
import lahfia.pharmacie.repository.LivraisonRepository;
import lahfia.pharmacie.repository.LivreurRepository;
import lahfia.pharmacie.repository.MedecinRepository;
import lahfia.pharmacie.repository.PatientRepository;
import lahfia.pharmacie.repository.PharmacieRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final PatientRepository patientRepository;
    private final PharmacieRepository pharmacieRepository;
    private final LivreurRepository livreurRepository;
    private final MedecinRepository medecinRepository;
    private final DemandeRepository demandeRepository;
    private final CommandeRepository commandeRepository;
    private final LivraisonRepository livraisonRepository;

    public Admin findById(UUID id) {
        return adminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin non trouvé : " + id));
    }

    @Transactional
    public Admin creer(Admin admin) {
        if (adminRepository.findByEmail(admin.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Cet email est déjà utilisé.");
        }
        if (admin.getPasswordHash() != null && !admin.getPasswordHash().isBlank()) {
            admin.setPasswordHash(passwordEncoder.encode(admin.getPasswordHash()));
        }
        return adminRepository.save(admin);
    }

    /** Statistiques agrégées pour le tableau de bord admin — calculées à la volée, jamais mises en cache. */
    public AdminStatsDTO stats() {
        List<Livreur> livreurs = livreurRepository.findAll();
        List<Medecin> medecins = medecinRepository.findAll();

        return new AdminStatsDTO(
                patientRepository.count(),
                pharmacieRepository.count(),
                pharmacieRepository.findAll().stream().filter(p -> Boolean.TRUE.equals(p.getLivraisonActive())).count(),
                livreurs.size(),
                livreurs.stream().filter(l -> l.getStatut() == StatutLivreur.ACTIF).count(),
                livreurs.stream().filter(l -> l.getStatut() == StatutLivreur.EN_ATTENTE_VALIDATION).count(),
                livreurs.stream().filter(l -> l.getStatut() == StatutLivreur.SUSPENDU).count(),
                medecins.size(),
                medecins.stream().filter(m -> m.getStatut() == StatutMedecin.ACTIF).count(),
                medecins.stream().filter(m -> m.getStatut() == StatutMedecin.EN_ATTENTE_VALIDATION).count(),
                medecins.stream().filter(m -> m.getStatut() == StatutMedecin.SUSPENDU).count(),
                demandeRepository.count(),
                commandeRepository.count(),
                livraisonRepository.count()
        );
    }
}
