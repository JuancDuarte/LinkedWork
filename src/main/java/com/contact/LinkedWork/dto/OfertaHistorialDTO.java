package com.contact.LinkedWork.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OfertaHistorialDTO {
    
    private Integer idHistorial;
    private Integer idOferta;
    private BigDecimal precioAnterior;
    private BigDecimal precioNuevo;
    private String descripcionAnterior;
    private String descripcionNueva;
    private LocalDateTime fecha;
    
    public OfertaHistorialDTO() {
    }
    
    public OfertaHistorialDTO(Integer idOferta) {
        this.idOferta = idOferta;
    }
    
    public Integer getIdHistorial() {
        return idHistorial;
    }
    
    public void setIdHistorial(Integer idHistorial) {
        this.idHistorial = idHistorial;
    }
    
    public Integer getIdOferta() {
        return idOferta;
    }
    
    public void setIdOferta(Integer idOferta) {
        this.idOferta = idOferta;
    }
    
    public BigDecimal getPrecioAnterior() {
        return precioAnterior;
    }
    
    public void setPrecioAnterior(BigDecimal precioAnterior) {
        this.precioAnterior = precioAnterior;
    }
    
    public BigDecimal getPrecioNuevo() {
        return precioNuevo;
    }
    
    public void setPrecioNuevo(BigDecimal precioNuevo) {
        this.precioNuevo = precioNuevo;
    }
    
    public String getDescripcionAnterior() {
        return descripcionAnterior;
    }
    
    public void setDescripcionAnterior(String descripcionAnterior) {
        this.descripcionAnterior = descripcionAnterior;
    }
    
    public String getDescripcionNueva() {
        return descripcionNueva;
    }
    
    public void setDescripcionNueva(String descripcionNueva) {
        this.descripcionNueva = descripcionNueva;
    }
    
    public LocalDateTime getFecha() {
        return fecha;
    }
    
    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
}
