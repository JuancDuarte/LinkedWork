package com.contact.LinkedWork.controller;

import org.apache.catalina.connector.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.contact.LinkedWork.dto.OfertaDTO;
import com.contact.LinkedWork.model.Oferta;
import com.contact.LinkedWork.service.OfertaService;

@RestController
@RequestMapping("/")
@CrossOrigin(origins="*")
public class OfertaController {

    @Autowired
    @Qualifier("OfertaService")
    private OfertaService ofertaService;

    @PostMapping(path="/addOferta", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Oferta> addOferta(@RequestBody OfertaDTO ofertaDTO) {
        return ResponseEntity.ok(ofertaService.crearOferta(ofertaDTO));
    }
}
