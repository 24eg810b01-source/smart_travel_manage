package com.smarttravel.controller;

import com.smarttravel.entity.Destination;
import com.smarttravel.repository.DestinationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/destinations")
@CrossOrigin(origins = "*")
public class DestinationController {

    @Autowired
    private DestinationRepository destinationRepository;

    @GetMapping
    public List<Destination> getAllDestinations(
            @RequestParam(required = false) String continent,
            @RequestParam(required = false) String category) {
        if (continent != null && !continent.isEmpty() && !"ALL".equalsIgnoreCase(continent)) {
            return destinationRepository.findByContinent(continent);
        }
        if (category != null && !category.isEmpty() && !"ALL".equalsIgnoreCase(category)) {
            return destinationRepository.findByCategory(category);
        }
        return destinationRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Destination> getDestinationById(@PathVariable String id) {
        return destinationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Destination createDestination(@RequestBody Destination destination) {
        return destinationRepository.save(destination);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDestination(@PathVariable String id) {
        destinationRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
