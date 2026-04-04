package com.contact.LinkedWork.controller;

import org.apache.catalina.connector.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.contact.LinkedWork.dto.CrearOfertaDTO;
import com.contact.LinkedWork.dto.EditarOFertaDTO.EditarOfertaDTO;
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

    @PostMapping(path="/addOferta/{idTrabajador}/{idSolicitud}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public OfertaDTO addOferta(@RequestBody CrearOfertaDTO ofertaDTO, @PathVariable Long idTrabajador, @PathVariable Long idSolicitud) {
        return ofertaService.crearOferta(ofertaDTO, idTrabajador, idSolicitud);
    }
    @PutMapping(path="/editOferta/{idOferta}/{idTrabajador}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public Oferta editOferta(@RequestBody EditarOfertaDTO ofertaDTO, @PathVariable Long idOferta, @PathVariable Long idTrabajador) {
        return ofertaService.editOferta(ofertaDTO, idOferta, idTrabajador  );
    }
    @DeleteMapping(path = "/deleteOferta/{idOferta}/{idTrabajador}")
    public ResponseEntity<String> deleteOfertaByUsuarioId(@PathVariable Long idOferta, @PathVariable Long idTrabajador) {
        ofertaService.eliminarOferta(idOferta, idTrabajador);
        return ResponseEntity.ok("Oferta eliminada correctamente.");
    }
}
