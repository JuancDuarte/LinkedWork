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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
    public Solicitud addSolicitud(@RequestBody Solicitud solicitud, @PathVariable Long idUsuario, @PathVariable Long idArea) {
        return solicitudService.AgregarSolicitud(idUsuario, solicitud, idArea);
    }  

@GetMapping(path = "/lisRequests", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Solicitud> getAllSolicitudes() {
        return solicitudService.getAllSolicitudes();
    } 
@DeleteMapping(path = "/deleteSolicitud/{idSolicitud}/{idUsuario}")
    public ResponseEntity<String> deleteSolicitudByUsuarioId(@PathVariable Long idSolicitud, @PathVariable Long idUsuario) {
        solicitudService.deleteSolicitudByUsuarioId(idSolicitud, idUsuario);
        return ResponseEntity.ok("Solicitud eliminada correctamente.");
    }
} 



