package com.contact.LinkedWork.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.contact.LinkedWork.dto.CrearSolicituDto;
import com.contact.LinkedWork.dto.EditarSolicitudDTO;
import com.contact.LinkedWork.dto.SolicitudDTO;
import com.contact.LinkedWork.model.Solicitud;
import com.contact.LinkedWork.model.Usuario;
import com.contact.LinkedWork.service.SolicitudService;

@RestController
@RequestMapping("/")
@CrossOrigin(origins="*")
public class ServicioController {

    @Autowired
    @Qualifier("SolicitudService")
    private SolicitudService solicitudService;

    @PostMapping(path="/addSolicitud/{idUsuario}/{idArea}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public SolicitudDTO addSolicitud(@RequestBody CrearSolicituDto solicitud, @PathVariable Long idUsuario, @PathVariable Long idArea) {
        return solicitudService.AgregarSolicitud(solicitud, idUsuario, idArea);
    }  

    @GetMapping(path = "/listRequests", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<SolicitudDTO> getAllSolicitudes() {
        return solicitudService.getAllSolicitudes();
    } 
    @PutMapping(path = "/editSolicitud/{idSolicitud}/{idUsuario}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public SolicitudDTO editSolicitud(@RequestBody EditarSolicitudDTO solicitud, @PathVariable Long idSolicitud, @PathVariable Long idUsuario) {
        return solicitudService.editarSolicitud(solicitud, idSolicitud, idUsuario);
    }
    @DeleteMapping(path = "/deleteSolicitud/{idSolicitud}/{idUsuario}")
    public ResponseEntity<String> deleteSolicitudByUsuarioId(@PathVariable Long idSolicitud, @PathVariable Long idUsuario) {
        solicitudService.deleteSolicitudByUsuarioId(idSolicitud, idUsuario);
        return ResponseEntity.ok("Solicitud eliminada correctamente.");
    }
} 



