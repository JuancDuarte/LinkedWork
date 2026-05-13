package com.contact.LinkedWork.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.contact.LinkedWork.dto.SolicitudDTO;
import com.contact.LinkedWork.service.CalificacionService;

@RestController
@RequestMapping("/")
@CrossOrigin(origins="*")
public class CalificacionController {

    @Autowired
    @Qualifier("CalificacionService")
    private CalificacionService calificacionService;

    @PostMapping(path = "/finalizarTrabajo/{idSolicitud}/{idUsuario}")
    public ResponseEntity<?> finalizarTrabajo(@PathVariable Long idSolicitud, @PathVariable Long idUsuario) {
        try {
            calificacionService.finalizarTrabajo(idSolicitud, idUsuario);
            return ResponseEntity.ok().body(Map.of("message", "Trabajo finalizado correctamente."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping(path = "/calificarTrabajador/{idUsuario}/{idSolicitud}")
    public ResponseEntity<?> calificarTrabajador(
            @PathVariable Long idUsuario,
            @PathVariable Long idSolicitud,
            @RequestBody Map<String, Object> payload) {
        try {
            Long puntuacion = Long.valueOf(payload.get("puntuacion").toString());
            String comentario = payload.get("comentario").toString();
            calificacionService.calificarTrabajador(idUsuario, idSolicitud, puntuacion, comentario);
            return ResponseEntity.ok().body(Map.of("message", "Calificación enviada correctamente."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping(path = "/trabajosActivosUsuario/{idUsuario}", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<SolicitudDTO> getTrabajosActivosUsuario(@PathVariable Long idUsuario) {
        return calificacionService.listarTrabajosActivosUsuario(idUsuario);
    }

    @GetMapping(path = "/trabajosActivosTrabajador/{idUsuario}", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<SolicitudDTO> getTrabajosActivosTrabajador(@PathVariable Long idUsuario) {
        return calificacionService.listarTrabajosActivosTrabajador(idUsuario);
    }

    @GetMapping(path = "/listCalificaciones/{idUsuarioTrabajador}", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<com.contact.LinkedWork.dto.CalificacionDTO> getCalificacionesTrabajador(@PathVariable Long idUsuarioTrabajador) {
        return calificacionService.listarCalificacionesTrabajador(idUsuarioTrabajador);
    }
}
