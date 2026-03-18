package com.contact.LinkedWork.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OfertaDTO {
    
    private Integer idOferta;
    private Integer idSolicitud;
    private Integer idTrabajador;
    private BigDecimal precio;
    private String descripcion;
    private String estado;
    private LocalDateTime fechaCreacion;
    
    public OfertaDTO() {
    }
    
    public OfertaDTO(Integer idSolicitud, Integer idTrabajador) {
        this.idSolicitud = idSolicitud;
        this.idTrabajador = idTrabajador;
    }
    
    public Integer getIdOferta() {
        return idOferta;
    }
    
    public void setIdOferta(Integer idOferta) {
        this.idOferta = idOferta;
    }
    
    public Integer getIdSolicitud() {
        return idSolicitud;
    }
    
    public void setIdSolicitud(Integer idSolicitud) {
        this.idSolicitud = idSolicitud;
    }
    
    public Integer getIdTrabajador() {
        return idTrabajador;
    }
    
    public void setIdTrabajador(Integer idTrabajador) {
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
