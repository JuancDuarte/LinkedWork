package com.contact.LinkedWork.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public class LoginDTO {

    @Schema(description = "ID del usuario", example = "1")
    private Long idUsuario;
    @Schema(description = "Nombre de usuario", example = "jota123")
    private String nombreUsuario;
    @Schema(description = "Correo electrónico", example = "jota@test.com")
    private String email;
    @Schema(description = "Clave de acceso", example = "123456")
    private String clave;

    public LoginDTO() {
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
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
}
