package lahfia.pharmacie.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import lahfia.pharmacie.dto.LoginRequest;
import lahfia.pharmacie.dto.LoginResponse;
import lahfia.pharmacie.models.Admin;
import lahfia.pharmacie.models.Livreur;
import lahfia.pharmacie.models.Medecin;
import lahfia.pharmacie.models.Patient;
import lahfia.pharmacie.models.Pharmacie;
import lahfia.pharmacie.repository.AdminRepository;
import lahfia.pharmacie.repository.LivreurRepository;
import lahfia.pharmacie.repository.MedecinRepository;
import lahfia.pharmacie.repository.PatientRepository;
import lahfia.pharmacie.repository.PharmacieRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final PasswordEncoder passwordEncoder;
    private final PatientRepository patientRepository;
    private final MedecinRepository medecinRepository;
    private final PharmacieRepository pharmacieRepository;
    private final LivreurRepository livreurRepository;
    private final AdminRepository adminRepository;

    private static final String ERR = "Email ou mot de passe incorrect.";

    public LoginResponse login(LoginRequest req) {
        if (req.email() == null || req.password() == null || req.role() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Champs requis manquants.");

        return switch (req.role().toUpperCase()) {
            case "PATIENT" -> loginPatient(req);
            case "MEDECIN" -> loginMedecin(req);
            case "PHARMACIE" -> loginPharmacie(req);
            case "LIVREUR" -> loginLivreur(req);
            case "ADMIN" -> loginAdmin(req);
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rôle inconnu : " + req.role());
        };
    }

    private LoginResponse loginAdmin(LoginRequest req) {
        Admin a = adminRepository.findByEmail(req.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, ERR));
        verifyPassword(req.password(), a.getPasswordHash());
        return new LoginResponse(a.getId().toString(), "ADMIN", a.getNom(), null);
    }

    private LoginResponse loginPatient(LoginRequest req) {
        Patient p = patientRepository.findByEmail(req.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, ERR));
        verifyPassword(req.password(), p.getPasswordHash());
        return new LoginResponse(p.getId().toString(), "PATIENT", p.getNom(), p.getPrenom());
    }

    private LoginResponse loginMedecin(LoginRequest req) {
        Medecin m = medecinRepository.findByEmail(req.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, ERR));
        verifyPassword(req.password(), m.getPasswordHash());
        return new LoginResponse(m.getId().toString(), "MEDECIN", m.getNom(), m.getPrenom());
    }

    private LoginResponse loginPharmacie(LoginRequest req) {
        Pharmacie ph = pharmacieRepository.findByEmail(req.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, ERR));
        verifyPassword(req.password(), ph.getPasswordHash());
        return new LoginResponse(ph.getId().toString(), "PHARMACIE", ph.getNom(), null);
    }

    private LoginResponse loginLivreur(LoginRequest req) {
        Livreur l = livreurRepository.findByEmail(req.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, ERR));
        verifyPassword(req.password(), l.getPasswordHash());
        return new LoginResponse(l.getId().toString(), "LIVREUR", l.getNom(), l.getPrenom());
    }

    private void verifyPassword(String rawPassword, String hash) {
        if (hash == null || !passwordEncoder.matches(rawPassword, hash))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, ERR);
    }
}
