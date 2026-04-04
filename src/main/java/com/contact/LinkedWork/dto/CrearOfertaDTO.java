package com.contact.LinkedWork.dto;

import java.math.BigDecimal;

public class CrearOfertaDTO {
    private BigDecimal precio;
    private String descripcion;
    private Long idTrabajador;
    private Long idSolicitud;
    public CrearOfertaDTO() {
    }
    public CrearOfertaDTO(BigDecimal precio, String descripcion, Long idTrabajador, Long idSolicitud) {
        this.precio = precio;
        this.descripcion = descripcion;
        this.idTrabajador = idTrabajador;
        this.idSolicitud = idSolicitud;
    }
    public BigDecimal getPrecio() {
        return precio;
    }
    public String getDescripcion() {
        return descripcion;
    }
    public Long getIdTrabajador() {
        return idTrabajador;
    }
    public Long getIdSolicitud() {
        return idSolicitud;
    }
    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    public void setIdTrabajador(Long idTrabajador) {
        this.idTrabajador = idTrabajador;
    }
    public void setIdSolicitud(Long idSolicitud) {
        this.idSolicitud = idSolicitud;
    }

}
