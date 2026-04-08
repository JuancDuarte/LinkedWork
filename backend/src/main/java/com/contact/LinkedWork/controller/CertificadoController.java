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
import org.springframework.web.bind.annotation.RestController;

import com.contact.LinkedWork.dto.CertificadoDTO;
import com.contact.LinkedWork.service.CertificadoService;

@RestController
@RequestMapping("/")
@CrossOrigin(origins="*")
public class CertificadoController {

    @Autowired
    @Qualifier("CertificadoService")
    private CertificadoService certificadoService;

    @PostMapping(path="/addCertificado/{idTrabajador}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public CertificadoDTO addCertificado(@RequestBody CertificadoDTO certificadoDTO, @PathVariable Long idTrabajador) {
        return certificadoService.agregarCertificado(certificadoDTO, idTrabajador);
    }

    @GetMapping(path = "/listCertificados/{idTrabajador}", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<CertificadoDTO> getCertificadosByTrabajador(@PathVariable Long idTrabajador) {
        return certificadoService.getCertificadosByTrabajador(idTrabajador);
    }

    @PutMapping(path = "/editCertificado/{idCertificado}/{idTrabajador}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public CertificadoDTO editCertificado(@RequestBody CertificadoDTO certificadoDTO, @PathVariable Long idCertificado, @PathVariable Long idTrabajador) {
        return certificadoService.editarCertificado(certificadoDTO, idCertificado, idTrabajador);
    }

    @DeleteMapping(path = "/deleteCertificado/{idCertificado}/{idTrabajador}")
    public ResponseEntity<String> deleteCertificado(@PathVariable Long idCertificado, @PathVariable Long idTrabajador) {
        certificadoService.eliminarCertificado(idCertificado, idTrabajador);
        return ResponseEntity.ok("Certificado eliminado correctamente.");
    }
}