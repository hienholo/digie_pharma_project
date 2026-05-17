package lahfia.pharmacie.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;
import lahfia.pharmacie.models.Medicament;
import lahfia.pharmacie.repository.MedicamentRepository;
import lombok.RequiredArgsConstructor;
 
@Tag(name = "Médicaments")
@RestController
@RequestMapping("/api/v1/medicaments")
@RequiredArgsConstructor
public class MedicamentController {
 
    private final MedicamentRepository medicamentRepository;
 
    @GetMapping
    public ResponseEntity<List<Medicament>> getAll() {
        return ResponseEntity.ok(medicamentRepository.findAll());
    }
 
    @GetMapping("/{id}")
    public ResponseEntity<Medicament> getById(@PathVariable UUID id) {
        return medicamentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
 
    @PostMapping
    public ResponseEntity<Medicament> creer(@RequestBody Medicament medicament) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(medicamentRepository.save(medicament));
    }
}