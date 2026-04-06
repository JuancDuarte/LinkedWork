package com.contact.LinkedWork.dto;

import java.time.LocalDateTime;
import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

public class UsuarioDTO {
    
    @Schema(example = "1")
    private Long idUsuario;
    @Schema(example = "Juan Pérez")
    private String nombreCompleto;
    @Schema(example = "juan@test.com")
    private String email;
    @Schema(example = "juan123")
    private String nombreUsuario;
    @Schema(example = "activo")
    private String estado;
    @Schema(example = "[\"ROLE_TRABAJADOR\"]")
    private List<String> roles;
    private TrabajadorDTO trabajador;

    
    public UsuarioDTO() {
    }
    
    public UsuarioDTO(Long idUsuario, String email, String nombreUsuario) {
        this.idUsuario = idUsuario;
        this.email = email;
        this.nombreUsuario = nombreUsuario;
    }
    
 
    public Long getIdUsuario() {
        return idUsuario;
    }
    
    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }
    
    public String getNombreCompleto() {
        return nombreCompleto;
    }
    
    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getNombreUsuario() {
        return nombreUsuario;
    }
    
    public void setNombreUsuario(String nombreUsuario) {
        this.nombreUsuario = nombreUsuario;
    }
    
    public String getEstado() {
        return estado;
    }
    
    public void setEstado(String estado) {
        this.estado = estado;
    }
    public List<String> getRoles() {
        return roles;
    }
    public void setRoles(List<String> roles) {
        this.roles = roles;
    }   
    public TrabajadorDTO getTrabajador() {
        return trabajador;
    }
    public void setTrabajador(TrabajadorDTO trabajador) {
        this.trabajador = trabajador;
    }
    
}