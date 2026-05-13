package com.contact.LinkedWork.dto;

import java.time.LocalDateTime;

public class ObservacionDTO {
    
    private Integer idObservacion;
    private Integer idTrabajador;
    private Integer idAdministrador;
    private String descripcion;
    private String tipo;
    private LocalDateTime fecha;
    
    public ObservacionDTO() {
    }
    
    public ObservacionDTO(Integer idTrabajador, String descripcion, String tipo) {
        this.idTrabajador = idTrabajador;
        this.descripcion = descripcion;
        this.tipo = tipo;
    }
    
    public Integer getIdObservacion() {
        return idObservacion;
    }
    
    public void setIdObservacion(Integer idObservacion) {
        this.idObservacion = idObservacion;
    }
    
    public Integer getIdTrabajador() {
        return idTrabajador;
    }
    
    public void setIdTrabajador(Integer idTrabajador) {
        this.idTrabajador = idTrabajador;
    }
    
    public Integer getIdAdministrador() {
        return idAdministrador;
    }
    
    public void setIdAdministrador(Integer idAdministrador) {
        this.idAdministrador = idAdministrador;
    }
    
    public String getDescripcion() {
        return descripcion;
    }
    
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    
    public String getTipo() {
        return tipo;
    }
    
    public void setTipo(String tipo) {
        this.tipo = tipo;
    }
    
    public LocalDateTime getFecha() {
        return fecha;
    }
    
    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
}
