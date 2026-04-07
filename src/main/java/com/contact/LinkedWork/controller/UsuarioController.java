package com.contact.LinkedWork.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import com.contact.LinkedWork.dto.AreaDTO;
import com.contact.LinkedWork.dto.CrearUsuarioDTO;
import com.contact.LinkedWork.dto.LoginDTO;
import com.contact.LinkedWork.dto.ListarTrabajadorDTO;
import com.contact.LinkedWork.dto.RolDTO;
import com.contact.LinkedWork.dto.UsuarioDTO;
import com.contact.LinkedWork.service.UsuarioService;

@RestController
@RequestMapping("/")
@CrossOrigin(origins="*")
public class UsuarioController {
    @Autowired
    @Qualifier("UsuarioService")
    private UsuarioService usuarioService;


    @GetMapping(path = "/listUsers", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<UsuarioDTO> getAllUsuarios() {
        return usuarioService.getAllUsuarios();
    } 
    @GetMapping(path = "/seeProfile/{idUsuario}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<UsuarioDTO> SeeProfile(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(usuarioService.SeeProfile(idUsuario));
    }
    @GetMapping(path = "/SeeFarmers/", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<ListarTrabajadorDTO> listarTrabajadores() {
        return usuarioService.listarTrabajadores();
    }

    @GetMapping(path = "/listRoles", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<RolDTO> getAllRoles() {
        return usuarioService.getAllRoles();
    }

    @GetMapping(path = "/listAreas", produces = MediaType.APPLICATION_JSON_VALUE)
    public List<AreaDTO> getAllAreas() {
        return usuarioService.getAllAreas();
    }

    @Operation(summary = "Crear cuenta", description = "Registra un nuevo usuario y lo asocia a un rol.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Cuenta creada",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = UsuarioDTO.class))),
            @ApiResponse(responseCode = "400", description = "Datos inválidos",
                    content = @Content(mediaType = "text/plain"))
    })
    @PostMapping(path = "/CreateUser", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createUser(@RequestBody CrearUsuarioDTO crearUsuarioDTO) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.crearCuenta(crearUsuarioDTO));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    @Operation(summary = "Iniciar sesión", description = "Autentica un usuario usando idUsuario, nombreUsuario o email junto con la clave.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login exitoso",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = UsuarioDTO.class))),
            @ApiResponse(responseCode = "401", description = "Credenciales inválidas",
                    content = @Content(mediaType = "text/plain"))
    })
    @PostMapping(path = "/Login", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDTO) {
        try {
            return ResponseEntity.ok(usuarioService.login(loginDTO));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
        }
    }
}
