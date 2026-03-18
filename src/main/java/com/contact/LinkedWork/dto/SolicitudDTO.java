package com.contact.LinkedWork.dto;

import java.time.LocalDateTime;

public class SolicitudDTO {
    
    private Integer idSolicitud;
    private Integer idUsuario;
    private Integer idArea;
    private String titulo;
    private String descripcion;
    private String estado;
    private LocalDateTime fechaCreacion;
    
    public SolicitudDTO() {
    }
    
    public SolicitudDTO(Integer idSolicitud, String titulo, String estado) {
        this.idSolicitud = idSolicitud;
        this.titulo = titulo;
        this.estado = estado;
    }
    
    public Integer getIdSolicitud() {
        return idSolicitud;
    }
    
    public void setIdSolicitud(Integer idSolicitud) {
        this.idSolicitud = idSolicitud;
    }
    
    public Integer getIdUsuario() {
        return idUsuario;
    }
    
    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }
    
    public Integer getIdArea() {
        return idArea;
    }
    
    public void setIdArea(Integer idArea) {
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
}
