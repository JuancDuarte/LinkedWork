package com.contact.LinkedWork.dto;

import java.math.BigDecimal;

public class EditarOFertaDTO {
    public class EditarOfertaDTO {
    private Long idOferta;
    private Long idTrabajador;

    private BigDecimal precio;
    private String descripcion;
    public EditarOfertaDTO() {
    }
    public EditarOfertaDTO(Long idOferta, Long idTrabajador, BigDecimal precio, String descripcion) {
        this.idOferta = idOferta;
        this.idTrabajador = idTrabajador;
        this.precio = precio;
        this.descripcion = descripcion;
    }
    public Long getIdOferta() {
        return idOferta;
    }
    public Long getIdTrabajador() {
        return idTrabajador;
    }
    public BigDecimal getPrecio() {
        return precio;
    }
    public String getDescripcion() {
        return descripcion;
    }
    public void setIdOferta(Long idOferta) {
        this.idOferta = idOferta;
    }

    public void setIdTrabajador(Long idTrabajador) {
        this.idTrabajador = idTrabajador;
    }
    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    }
}

