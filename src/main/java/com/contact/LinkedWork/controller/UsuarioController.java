package com.contact.LinkedWork.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.contact.LinkedWork.model.Usuario;
import com.contact.LinkedWork.service.UsuarioService;

@RestController
@RequestMapping("/LinkedApi/")
@CrossOrigin(origins="*")
public class UsuarioController {
    @Autowireds
    @Qualifier("UsuarioService")
    private UsuarioService usuarioService;

    @GetMapping(path = "/listarusuarios", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<Usuario> getAllUsuarios() {
        return usuarioService.getAllUsuarios();
    }

}
