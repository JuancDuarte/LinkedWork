package com.contact.LinkedWork.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.contact.LinkedWork.dto.CalificarDTO;
import com.contact.LinkedWork.service.CalificacionService;



@RestController
@RequestMapping("/")
@CrossOrigin(origins="*")
public class CalificacionController {
    @Autowired
    @Qualifier("CalificacionService")
    private CalificacionService calificacionService;

    @PostMapping(path ="/QualifyJob/{idUsuario}/{idSolicitud}", consumes = MediaType.APPLICATION_JSON_VALUE , produces = MediaType.APPLICATION_JSON_VALUE)
    public String QualifyJob(@RequestBody CalificarDTO calificarDTO, @PathVariable Long idUsuario, @PathVariable Long idSolicitud) {
        return calificacionService.CalificarTrabajador(calificarDTO, idUsuario, idSolicitud);
    }


}
