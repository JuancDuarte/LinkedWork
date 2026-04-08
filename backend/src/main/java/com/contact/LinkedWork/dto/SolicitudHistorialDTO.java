package com.contact.LinkedWork.dto;

import java.time.LocalDateTime;

public class SolicitudHistorialDTO {
    
    private Integer idHistorial;
    private Integer idSolicitud;
    private String estadoAnterior;
    private String estadoNuevo;
    private LocalDateTime fecha;
    
    public SolicitudHistorialDTO() {
    }
    
    public SolicitudHistorialDTO(Integer idSolicitud, String estadoAnterior, String estadoNuevo) {
        this.idSolicitud = idSolicitud;
        this.estadoAnterior = estadoAnterior;
        this.estadoNuevo = estadoNuevo;
    }
    
    public Integer getIdHistorial() {
        return idHistorial;
    }
    
    public void setIdHistorial(Integer idHistorial) {
        this.idHistorial = idHistorial;
    }
    
    public Integer getIdSolicitud() {
        return idSolicitud;
    }
    
    public void setIdSolicitud(Integer idSolicitud) {
        this.idSolicitud = idSolicitud;
    }
    
    public String getEstadoAnterior() {
        return estadoAnterior;
    }
    
    public void setEstadoAnterior(String estadoAnterior) {
        this.estadoAnterior = estadoAnterior;
    }
    
    public String getEstadoNuevo() {
        return estadoNuevo;
    }
    
    public void setEstadoNuevo(String estadoNuevo) {
        this.estadoNuevo = estadoNuevo;
    }
    
    public LocalDateTime getFecha() {
        return fecha;
    }
    
    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
}
