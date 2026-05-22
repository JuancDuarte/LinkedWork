package com.contact.LinkedWork.controller;

import java.util.List;
import java.util.Map;

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

import org.springframework.web.bind.annotation.PutMapping;
import jakarta.validation.Valid;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import com.contact.LinkedWork.dto.CreateUsuarioDTO;
import com.contact.LinkedWork.dto.UsuarioDTO;
import com.contact.LinkedWork.dto.LoginDTO;
import com.contact.LinkedWork.dto.ListarTrabajadorDTO;
import com.contact.LinkedWork.service.UsuarioService;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/")
@CrossOrigin(origins = "*")
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

    @Autowired
    private com.contact.LinkedWork.security.JwtUtil jwtUtil;

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
            UsuarioDTO usuario = usuarioService.login(loginDTO);
            String token = jwtUtil.generateToken(usuario.getIdUsuario(), usuario.getEmail());
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("token", token);
            response.put("user", usuario);
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
        }
    }

    @PostMapping(path = "/login/google", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> loginGoogle(@RequestBody Map<String, String> payload) {
        try {
            String idTokenString = payload.get("idToken");
            
            if (idTokenString == null || idTokenString.isEmpty()) {
                throw new RuntimeException("Token de Google inválido");
            }
            
            UsuarioDTO usuario = usuarioService.loginOrRegisterGoogle(idTokenString);
            String token = jwtUtil.generateToken(usuario.getIdUsuario(), usuario.getEmail());
            
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("token", token);
            response.put("user", usuario);
            
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
        }
    }

    @PostMapping(path = "/CreateUser", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<UsuarioDTO> createUser(@Valid @RequestBody CreateUsuarioDTO payload) {
        System.out.println("CreateUser called with: " + payload);
        try {
            String nombre = payload.getNombre();
            String email = payload.getEmail();
            String password = payload.getPassword();
            List<String> roles = payload.getRoles();
            Long areaId = payload.getAreaId();
            String descripcion = payload.getDescripcion();
            Long experiencia = payload.getExperiencia();
            Integer idDepartamento = payload.getIdDepartamento();
            Integer idCiudad = payload.getIdCiudad();
            String nombreUsuario = payload.getNombreUsuario();

            if (nombre == null || nombre.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
            }
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
            }
            if (password == null || password.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
            }

            UsuarioDTO created = usuarioService.createUser(nombreUsuario, nombre, email, password, roles, areaId, descripcion, experiencia, idDepartamento, idCiudad);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PostMapping(path = "/changeRole/{idUsuario}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<UsuarioDTO> changeRole(@PathVariable Long idUsuario, @RequestBody Map<String, List<String>> payload) {
        try {
            List<String> newRoles = payload.get("roles");
            UsuarioDTO updated = usuarioService.changeRole(idUsuario, newRoles);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PostMapping(path = "/upgradeToWorker/{idUsuario}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<UsuarioDTO> upgradeToWorker(@PathVariable Long idUsuario, @RequestBody Map<String, Object> payload) {
        try {
            Long areaId = payload.get("areaId") != null ? Long.valueOf(payload.get("areaId").toString()) : null;
            String descripcion = (String) payload.get("descripcion");
            Long experiencia = payload.get("experiencia") != null ? Long.valueOf(payload.get("experiencia").toString()) : null;
            Integer idDepartamento = payload.get("idDepartamento") != null ? Integer.valueOf(payload.get("idDepartamento").toString()) : null;
            Integer idCiudad = payload.get("idCiudad") != null ? Integer.valueOf(payload.get("idCiudad").toString()) : null;
            
            UsuarioDTO updated = usuarioService.upgradeToWorker(idUsuario, areaId, descripcion, experiencia, idDepartamento, idCiudad);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PutMapping(path = "/EditUser", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<UsuarioDTO> editUser(@RequestBody UsuarioDTO payload) {
        try {
            UsuarioDTO updated = usuarioService.editUser(payload);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping(path = "/listDepartamentos", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<com.contact.LinkedWork.model.Departamento>> listDepartamentos() {
        return ResponseEntity.ok(usuarioService.getAllDepartamentos());
    }

    @GetMapping(path = "/listCiudades/{idDepartamento}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<com.contact.LinkedWork.model.Ciudad>> listCiudades(@PathVariable Integer idDepartamento) {
        return ResponseEntity.ok(usuarioService.getCiudadesByDepartamento(idDepartamento));
    }

    @PostMapping(path = "/uploadFotoPerfil/{idUsuario}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<UsuarioDTO> uploadFotoPerfil(@PathVariable Long idUsuario, @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
            }
            String uploadDirStr = "./uploads/";
            File uploadDir = new File(uploadDirStr);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = System.currentTimeMillis() + "_" + idUsuario + extension;

            Path path = Paths.get(uploadDirStr + filename);
            Files.write(path, file.getBytes());

            UsuarioDTO updated = usuarioService.updateFotoPerfil(idUsuario, filename);
            return ResponseEntity.ok(updated);
        } catch (IOException ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping(path = "/uploads/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        try {
            Path file = Paths.get("./uploads").resolve(filename);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                String contentType = Files.probeContentType(file);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
