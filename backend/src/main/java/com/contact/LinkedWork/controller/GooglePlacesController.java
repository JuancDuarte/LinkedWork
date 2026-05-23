package com.contact.LinkedWork.controller;

import com.contact.LinkedWork.dto.PlaceDetailsDTO;
import com.contact.LinkedWork.dto.PlacePredictionDTO;
import com.contact.LinkedWork.service.GooglePlacesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/places")
@CrossOrigin(origins = "*")
public class GooglePlacesController {

    @Autowired
    private GooglePlacesService googlePlacesService;

    @GetMapping(path = "/autocomplete", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> autocomplete(@RequestParam String input) {
        if (input == null || input.trim().length() < 3) {
            return ResponseEntity.ok(Map.of("predictions", List.of()));
        }
        List<PlacePredictionDTO> predictions = googlePlacesService.autocomplete(input.trim());
        return ResponseEntity.ok(Map.of("predictions", predictions, "source", predictions.isEmpty() ? "none" : "ok"));
    }

    @GetMapping(path = "/details", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> details(@RequestParam String placeId) {
        try {
            PlaceDetailsDTO details = googlePlacesService.getDetails(placeId);
            return ResponseEntity.ok(details);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        }
    }
}
