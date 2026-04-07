package com.contact.LinkedWork.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public class CrearUsuarioDTO {

    @Schema(description = "Nombre completo del usuario", example = "Jota Garcia")
    private String nombreCompleto;

    @Schema(description = "Nombre de usuario único", example = "jota123")
    private String nombreUsuario;

    @Schema(description = "Correo único del usuario", example = "jota@test.com")
    private String email;

    @Schema(description = "Clave de acceso", example = "123456")
    private String clave;

    @Schema(description = "ID de rol (opcional)", example = "1")
    private Long idRol;

    @Schema(description = "ID de área cuando el usuario es trabajador", example = "2")
    private Long idArea;

    @Schema(description = "Descripción del trabajador", example = "Desarrollador Java con 3 años de experiencia")
    private String descripcion;

    @Schema(description = "Experiencia en años para trabajador", example = "3")
    private Long experiencia;

    public CrearUsuarioDTO() {
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public String getNombreUsuario() {
        return nombreUsuario;
    }

    public void setNombreUsuario(String nombreUsuario) {
        this.nombreUsuario = nombreUsuario;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getClave() {
        return clave;
    }

    public void setClave(String clave) {
        this.clave = clave;
    }

    public Long getIdRol() {
        return idRol;
    }

    public void setIdRol(Long idRol) {
        this.idRol = idRol;
    }

    public Long getIdArea() {
        return idArea;
    }

    public void setIdArea(Long idArea) {
        this.idArea = idArea;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Long getExperiencia() {
        return experiencia;
    }

    public void setExperiencia(Long experiencia) {
        this.experiencia = experiencia;
    }
}
