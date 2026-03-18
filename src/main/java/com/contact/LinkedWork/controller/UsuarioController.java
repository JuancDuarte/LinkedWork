package com.contact.LinkedWork.controller;

import com.contact.LinkedWork.dto.LoginRequestDTO;
import com.contact.LinkedWork.dto.UsuarioDTO;
import com.contact.LinkedWork.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping("/CreateUser")
    public ResponseEntity<?> createUser(@RequestBody UsuarioDTO usuarioDTO) {
        try {
            UsuarioDTO created = usuarioService.createUser(usuarioDTO);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (IllegalArgumentException ex) {
            return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/Login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequestDTO) {
        Optional<UsuarioDTO> loggedUser = usuarioService.login(loginRequestDTO);
        return loggedUser
                .<ResponseEntity<?>>map(usuarioDTO -> new ResponseEntity<>(usuarioDTO, HttpStatus.OK))
                .orElse(new ResponseEntity<>("Credenciales inválidas", HttpStatus.UNAUTHORIZED));
    }

    @GetMapping("/Profile/{id}")
    public ResponseEntity<UsuarioDTO> getProfile(@PathVariable Long id) {
        return usuarioService.getProfile(id)
                .map(usuarioDTO -> new ResponseEntity<>(usuarioDTO, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/EditUser/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody UsuarioDTO usuarioDTO) {
        try {
            Optional<UsuarioDTO> updated = usuarioService.updateProfile(id, usuarioDTO);
            return updated
                    .<ResponseEntity<?>>map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                    .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (IllegalArgumentException ex) {
            return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}
