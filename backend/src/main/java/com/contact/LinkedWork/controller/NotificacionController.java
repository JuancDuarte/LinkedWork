package com.contact.LinkedWork.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;

import com.contact.LinkedWork.dto.NotificacionDTO;
import com.contact.LinkedWork.service.NotificacionService;

@RestController
@RequestMapping("/")
@CrossOrigin(origins = "*")
public class NotificacionController {

    @Autowired
    @Qualifier("NotificacionService")
    private NotificacionService notificacionService;

     @GetMapping("/notifications/{idUsuario}")
    public ResponseEntity<List<NotificacionDTO>> obtenerNotificaciones(
            @PathVariable Long idUsuario
    ) {

        return ResponseEntity.ok(
                notificacionService.obtenerNotificaciones(idUsuario)
        );
    }

    @GetMapping("/notifications/unread/{idUsuario}")
    public ResponseEntity<List<NotificacionDTO>> obtenerNoLeidas(
            @PathVariable Long idUsuario
    ) {

        return ResponseEntity.ok(
                notificacionService.obtenerNoLeidas(idUsuario)
        );
    }
    public ResponseEntity<Long> contarNoLeidas(
            @PathVariable Long idUsuario
    ) {

        return ResponseEntity.ok(
                notificacionService.contarNoLeidas(idUsuario)
        );
    }

    @PutMapping("/notifications/read/{idNotificacion}")
    public ResponseEntity<?> marcarComoLeida(
            @PathVariable Long idNotificacion
    ) {

        notificacionService.marcarComoLeida(idNotificacion);

        return ResponseEntity.ok().build();
    }

    @PutMapping("/notifications/read-all/{idUsuario}")
    public ResponseEntity<?> marcarTodasComoLeidas(
            @PathVariable Long idUsuario
    ) {

        notificacionService.marcarTodasComoLeidas(idUsuario);

        return ResponseEntity.ok().build();
    }




}
