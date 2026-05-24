package com.contact.LinkedWork.service;

import com.contact.LinkedWork.dto.PlaceDetailsDTO;
import com.contact.LinkedWork.dto.PlacePredictionDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service("GooglePlacesService")
@Transactional
public class GooglePlacesService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestClient restClient;

    public GooglePlacesService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(8000);
        this.restClient = RestClient.builder().requestFactory(factory).build();
    }

    @Value("${google.maps.api-key:}")
    private String apiKey;

    public List<PlacePredictionDTO> autocomplete(String input) {
        String query = input == null ? "" : input.trim();
        if (query.length() < 3) {
            return List.of();
        }

        List<PlacePredictionDTO> results = fetchGoogleAutocomplete(query);
        if (results.isEmpty()) {
            results = fetchNominatimSearch(query);
        }
        return results;
    }

    public PlaceDetailsDTO getDetails(String placeId) {
        if (placeId == null || placeId.isBlank()) {
            throw new RuntimeException("placeId es obligatorio");
        }
        if (placeId.startsWith("osm:")) {
            return parseOsmPlaceId(placeId);
        }
        return fetchGooglePlaceDetails(placeId);
    }

    private List<PlacePredictionDTO> fetchGoogleAutocomplete(String query) {
        if (apiKey == null || apiKey.isBlank()) {
            return List.of();
        }
        try {
            URI uri = UriComponentsBuilder
                    .fromUriString("https://maps.googleapis.com/maps/api/place/autocomplete/json")
                    .queryParam("input", query)
                    .queryParam("components", "country:co")
                    .queryParam("language", "es")
                    .queryParam("types", "geocode")
                    .queryParam("key", apiKey)
                    .encode(StandardCharsets.UTF_8)
                    .build()
                    .toUri();

            String body = restClient.get().uri(uri).retrieve().body(String.class);
            JsonNode root = objectMapper.readTree(body);
            String status = root.path("status").asText("");

            if (!"OK".equals(status) && !"ZERO_RESULTS".equals(status)) {
                System.err.println("[GooglePlaces] Autocomplete status: " + status
                        + " — " + root.path("error_message").asText(""));
                return List.of();
            }

            List<PlacePredictionDTO> list = new ArrayList<>();
            for (JsonNode p : root.path("predictions")) {
                String description = p.path("description").asText("");
                String placeId = p.path("place_id").asText("");
                JsonNode fmt = p.path("structured_formatting");
                String main = fmt.path("main_text").asText(description);
                String secondary = fmt.path("secondary_text").asText("");
                list.add(new PlacePredictionDTO(placeId, main, secondary, description));
            }
            return list;
        } catch (Exception e) {
            System.err.println("[GooglePlaces] Error autocomplete: " + e.getMessage());
            return List.of();
        }
    }

    private PlaceDetailsDTO fetchGooglePlaceDetails(String placeId) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new RuntimeException("API key de Google Maps no configurada en el servidor");
        }
        try {
            URI uri = UriComponentsBuilder
                    .fromUriString("https://maps.googleapis.com/maps/api/place/details/json")
                    .queryParam("place_id", placeId)
                    .queryParam("fields", "formatted_address,geometry")
                    .queryParam("language", "es")
                    .queryParam("key", apiKey)
                    .encode(StandardCharsets.UTF_8)
                    .build()
                    .toUri();

            String body = restClient.get().uri(uri).retrieve().body(String.class);
            JsonNode root = objectMapper.readTree(body);
            if (!"OK".equals(root.path("status").asText())) {
                throw new RuntimeException("Google no devolvió detalles: " + root.path("status").asText());
            }
            JsonNode result = root.path("result");
            String address = result.path("formatted_address").asText("");
            double lat = result.path("geometry").path("location").path("lat").asDouble();
            double lng = result.path("geometry").path("location").path("lng").asDouble();
            return new PlaceDetailsDTO(address, lat, lng);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error al consultar detalle del lugar: " + e.getMessage());
        }
    }

    private List<PlacePredictionDTO> fetchNominatimSearch(String query) {
        try {
            URI uri = UriComponentsBuilder
                    .fromUriString("https://nominatim.openstreetmap.org/search")
                    .queryParam("q", query + ", Colombia")
                    .queryParam("format", "json")
                    .queryParam("addressdetails", "0")
                    .queryParam("limit", "8")
                    .queryParam("countrycodes", "co")
                    .encode(StandardCharsets.UTF_8)
                    .build()
                    .toUri();

            String body = restClient.get()
                    .uri(uri)
                    .header("User-Agent", "LinkedWork/1.0 (contactsoftwarelinkedwork@gmail.com)")
                    .header("Accept-Language", "es")
                    .retrieve()
                    .body(String.class);

            JsonNode arr = objectMapper.readTree(body);
            List<PlacePredictionDTO> list = new ArrayList<>();
            for (JsonNode item : arr) {
                String display = item.path("display_name").asText("");
                double lat = item.path("lat").asDouble();
                double lon = item.path("lon").asDouble();
                String osmId = item.path("osm_id").asText("0");
                String osmType = item.path("osm_type").asText("node");

                PlacePredictionDTO dto = new PlacePredictionDTO();
                dto.setPlaceId("osm:" + osmType + ":" + osmId + ":" + lat + ":" + lon);
                dto.setDescription(display);
                int comma = display.indexOf(',');
                dto.setMainText(comma > 0 ? display.substring(0, comma).trim() : display);
                dto.setSecondaryText(comma > 0 ? display.substring(comma + 1).trim() : "");
                dto.setLatitud(lat);
                dto.setLongitud(lon);
                list.add(dto);
            }
            return list;
        } catch (Exception e) {
            System.err.println("[Nominatim] Error búsqueda: " + e.getMessage());
            return List.of();
        }
    }

    private PlaceDetailsDTO parseOsmPlaceId(String placeId) {
        String[] parts = placeId.split(":");
        if (parts.length >= 5) {
            try {
                double lat = Double.parseDouble(parts[3]);
                double lon = Double.parseDouble(parts[4]);
                return new PlaceDetailsDTO("", lat, lon);
            } catch (NumberFormatException ignored) {
            }
        }
        throw new RuntimeException("Identificador de lugar OSM inválido");
    }
}

