package com.contact.LinkedWork.dto;

import java.time.LocalDateTime;

public class SolicitudDTO {
    
    private Long idSolicitud;
    private String titulo;
    private String descripcion;
    private String estado;
    private LocalDateTime fechaCreacion;
    private Long idUsuario;
    private String nombreUsuario;
    private Long idArea;
    private String nombreArea;
    
    public SolicitudDTO() {
    }
    
    public SolicitudDTO(Long idSolicitud, String titulo, String estado) {
        this.idSolicitud = idSolicitud;
        this.titulo = titulo;
        this.estado = estado;
    }
    
    public Long getIdSolicitud() {
        return idSolicitud;
    }
    
    public void setIdSolicitud(Long idSolicitud) {
        this.idSolicitud = idSolicitud;
    }
    
    public Long getIdUsuario() {
        return idUsuario;
    }
    
    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }
    
    public Long getIdArea() {
        return idArea;
    }
    
    public void setIdArea(Long idArea) {
        this.idArea = idArea;
    }
    
    public String getTitulo() {
        return titulo;
    }
    
    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }
    
    public String getDescripcion() {
        return descripcion;
    }
    
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    
    public String getEstado() {
        return estado;
    }
    
    public void setEstado(String estado) {
        this.estado = estado;
    }
    
    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }
    
    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
    public String getNombreUsuario() {
        return nombreUsuario;
    }
    public void setNombreUsuario(String nombreUsuario) {
        this.nombreUsuario = nombreUsuario;
    }
    public String getNombreArea() {
        return nombreArea;
    }
    public void setNombreArea(String nombreArea) {
        this.nombreArea = nombreArea;
    }
}
