package com.contact.LinkedWork.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

import com.contact.LinkedWork.dto.CrearSolicituDto;
import com.contact.LinkedWork.dto.EditarSolicitudDTO;
import com.contact.LinkedWork.dto.RespuestaAceptarDTO;
import com.contact.LinkedWork.dto.SolicitudDTO;
import com.contact.LinkedWork.dto.SolicitudHistorialDTO;
import com.contact.LinkedWork.dto.AreaDTO;
import com.contact.LinkedWork.model.Area;
import com.contact.LinkedWork.service.SolicitudService;
import com.contact.LinkedWork.repository.AreaRepository;

@RestController
@RequestMapping("/")
@CrossOrigin(origins="*")
public class ServicioController {

    @Autowired
    @Qualifier("SolicitudService")
    private SolicitudService solicitudService;

    @Autowired
    @Qualifier("CrudAreaRepository")
    private AreaRepository areaRepository;

    @PostMapping(path="/addSolicitud/{idUsuario}/{idArea}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public SolicitudDTO addSolicitud(@Valid @RequestBody CrearSolicituDto solicitud, @PathVariable Long idUsuario, @PathVariable Long idArea) {
        return solicitudService.AgregarSolicitud(solicitud, idUsuario, idArea);
    }

    @PostMapping(path="/addSolicitudDirecta/{idUsuario}/{idTrabajadorUsuario}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public SolicitudDTO addSolicitudDirecta(@Valid @RequestBody CrearSolicituDto solicitud, @PathVariable Long idUsuario, @PathVariable Long idTrabajadorUsuario) {
        return solicitudService.agregarSolicitudDirecta(solicitud, idUsuario, idTrabajadorUsuario);
    }

    @GetMapping(path = "/listRequests", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<SolicitudDTO> getAllSolicitudes() {
        return solicitudService.getAllSolicitudes();
    } 

    @GetMapping(path = "/listRequests/{idUsuario}", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<SolicitudDTO> getSolicitudesByUsuario(@PathVariable Long idUsuario) {
        return solicitudService.getSolicitudesByUsuario(idUsuario);
    } 

    @GetMapping(path = "/listRequestsForWorker/{idUsuarioTrabajador}", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<SolicitudDTO> getSolicitudesForWorker(@PathVariable Long idUsuarioTrabajador) {
        return solicitudService.getSolicitudesParaTrabajador(idUsuarioTrabajador);
    }

    @GetMapping(path = "/listAllRequests", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<SolicitudDTO> getAllPendingRequests() {
        return solicitudService.getTodasSolicitudesPendientes();
    }

    @GetMapping(path = "/checkOverlap/{idUsuarioTrabajador}/{fechaServicio}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Boolean> checkOverlap(
            @PathVariable Long idUsuarioTrabajador, 
            @PathVariable @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate fechaServicio) {
        boolean hasOverlap = solicitudService.hasActiveJobOnDate(idUsuarioTrabajador, fechaServicio);
        return ResponseEntity.ok(hasOverlap);
    }

    @PostMapping(path = "/acceptRequest/{idSolicitud}/{idUsuarioTrabajador}", produces = MediaType.APPLICATION_JSON_VALUE)
    public RespuestaAceptarDTO acceptRequest(
            @PathVariable Long idSolicitud, 
            @PathVariable Long idUsuarioTrabajador,
            @RequestBody(required = false) java.util.Map<String, Object> payload) {
        java.math.BigDecimal precioContraoferta = null;
        if(payload != null && payload.containsKey("precio")) {
            precioContraoferta = new java.math.BigDecimal(payload.get("precio").toString());
        }
        return solicitudService.aceptarSolicitudPorTrabajador(idSolicitud, idUsuarioTrabajador, precioContraoferta);
    }

    @PutMapping(path = "/editSolicitud/{idSolicitud}/{idUsuario}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public SolicitudDTO editSolicitud(@Valid @RequestBody EditarSolicitudDTO solicitud, @PathVariable Long idSolicitud, @PathVariable Long idUsuario) {
        return solicitudService.editarSolicitud(solicitud, idSolicitud, idUsuario);
    }
    @DeleteMapping(path = "/deleteSolicitud/{idSolicitud}/{idUsuario}")
    public ResponseEntity<?> deleteSolicitudByUsuarioId(@PathVariable Long idSolicitud, @PathVariable Long idUsuario) {
        try {
            solicitudService.deleteSolicitudByUsuarioId(idSolicitud, idUsuario);
            return ResponseEntity.ok().body(java.util.Map.of("mensaje", "Solicitud eliminada correctamente."));
        } catch (RuntimeException ex) {
            String message = ex.getMessage() == null ? "No se pudo eliminar la solicitud." : ex.getMessage();
            if (message.toLowerCase().contains("no encontrada")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("La solicitud ya no existe.");
            }
            if (message.toLowerCase().contains("permiso")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("No tienes permiso para eliminar esta solicitud.");
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No fue posible eliminar la solicitud en este momento.");
        }
    }

    @PutMapping(path = "/encounter/{solicitudId}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateEncounterDetails(@PathVariable Long solicitudId, @RequestBody java.util.Map<String, Object> payload) {
        try {
            SolicitudDTO updated = solicitudService.updateEncounterDetails(
                solicitudId,
                (String) payload.get("direccion"),
                (String) payload.get("horaEncuentro"),
                (String) payload.get("notas"),
                payload.get("latitud") != null ? Double.valueOf(payload.get("latitud").toString()) : null,
                payload.get("longitud") != null ? Double.valueOf(payload.get("longitud").toString()) : null
            );
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(java.util.Map.of("mensaje", e.getMessage()));
        }
    }

    @GetMapping(path = "/historialSolicitud/{idSolicitud}", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<SolicitudHistorialDTO> getHistorialSolicitud(@PathVariable Long idSolicitud) {
        return solicitudService.getHistorialSolicitud(idSolicitud);
    }

    @GetMapping(path = "/listAreas", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<AreaDTO> getAllAreas() {
        return ((List<Area>) areaRepository.findAll())
                .stream()
                .map(area -> new AreaDTO(area.getIdArea(), area.getNombre()))
                .toList();
    }
} 



