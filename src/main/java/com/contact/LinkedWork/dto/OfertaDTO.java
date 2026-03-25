package com.contact.LinkedWork.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OfertaDTO {
    
    private Long idOferta;
    private Long idSolicitud;
    private Long idTrabajador;
    private BigDecimal precio;
    private String descripcion;

    
    public OfertaDTO() {
    }
    
    public OfertaDTO( Long idSolicitud, Long idTrabajador) {
        this.idSolicitud = idSolicitud;
        this.idTrabajador = idTrabajador;
    }
    
    public Long getIdOferta() {
        return idOferta;
    }
    
    public void setIdOferta(Long idOferta) {
        this.idOferta = idOferta;
    }
    
    public Long getIdSolicitud() {
        return idSolicitud;
    }
    
    public void setIdSolicitud(Long idSolicitud) {
        this.idSolicitud = idSolicitud;
    }
    
    public Long getIdTrabajador() {
        return idTrabajador;
    }
    
    public void setIdTrabajador(Long idTrabajador) {
        this.idTrabajador = idTrabajador;
    }
    
    public BigDecimal getPrecio() {
        return precio;
    }
    
    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }
    
    public String getDescripcion() {
        return descripcion;
    }
    
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    
}
