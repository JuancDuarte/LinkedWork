package com.contact.LinkedWork.dto;

import java.time.LocalDateTime;

public class UsuarioDTO {
    
    private Integer idUsuario;
    private String nombre;
    private String email;
    private String nombreUsuario;
    private String estado;
    private Integer intentosFallidos;
    private Boolean bloqueado;
    private LocalDateTime fechaCreacion;
    private LocalDateTime ultimoAcceso;
    
    public UsuarioDTO() {
    }
    
    public UsuarioDTO(Integer idUsuario, String email, String nombreUsuario) {
        this.idUsuario = idUsuario;
        this.email = email;
        this.nombreUsuario = nombreUsuario;
    }
    
    // Getters and Setters
    public Integer getIdUsuario() {
        return idUsuario;
    }
    
    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }
    
    public String getNombre() {
        return nombre;
    }
    
    public void setNombre(String nombre) {
        this.nombre = nombre;
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
    
    public Integer getIntentosFallidos() {
        return intentosFallidos;
    }
    
    public void setIntentosFallidos(Integer intentosFallidos) {
        this.intentosFallidos = intentosFallidos;
    }
    
    public Boolean getBloqueado() {
        return bloqueado;
    }
    
    public void setBloqueado(Boolean bloqueado) {
        this.bloqueado = bloqueado;
    }
    
    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }
    
    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
    
    public LocalDateTime getUltimoAcceso() {
        return ultimoAcceso;
    }
    
    public void setUltimoAcceso(LocalDateTime ultimoAcceso) {
        this.ultimoAcceso = ultimoAcceso;
    }
}
