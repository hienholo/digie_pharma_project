package lahfia.pharmacie.service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lahfia.pharmacie.exception.ResourceNotFoundException;
import lahfia.pharmacie.models.Patient;
import lahfia.pharmacie.repository.PatientRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PatientService {

    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;

    public Patient findById(UUID id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé : " + id));
    }

    @Transactional
    public Patient creer(Patient patient) {
        if (patientRepository.existsByTelephone(patient.getTelephone())) {
            throw new IllegalArgumentException("Ce numéro de téléphone est déjà utilisé.");
        }
        if (patient.getPasswordHash() != null && !patient.getPasswordHash().isBlank()) {
            patient.setPasswordHash(passwordEncoder.encode(patient.getPasswordHash()));
        }
        return patientRepository.save(patient);
    }

    @Transactional
    public Patient mettreAJourLocalisation(UUID id, Double latitude, Double longitude) {
        Patient patient = findById(id);
        patient.setLatitude(latitude);
        patient.setLongitude(longitude);
        return patientRepository.save(patient);
    }


    @Transactional
    public List<Patient> findAll() {
        return patientRepository.findAll();
    }

    @Transactional
    public Patient mettreAJourMesures(UUID id, Map<String, Object> body) {
        Patient patient = findById(id);
        if (body.containsKey("rythmeCardiaque") && body.get("rythmeCardiaque") != null)
            patient.setRythmeCardiaque(((Number) body.get("rythmeCardiaque")).intValue());
        if (body.containsKey("tensionSystolique") && body.get("tensionSystolique") != null)
            patient.setTensionSystolique(((Number) body.get("tensionSystolique")).intValue());
        if (body.containsKey("tensionDiastolique") && body.get("tensionDiastolique") != null)
            patient.setTensionDiastolique(((Number) body.get("tensionDiastolique")).intValue());
        if (body.containsKey("poids") && body.get("poids") != null)
            patient.setPoids(((Number) body.get("poids")).doubleValue());
        if (body.containsKey("glycemie") && body.get("glycemie") != null)
            patient.setGlycemie(((Number) body.get("glycemie")).doubleValue());
        return patientRepository.save(patient);
    }
}
