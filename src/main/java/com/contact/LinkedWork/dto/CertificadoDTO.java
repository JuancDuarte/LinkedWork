package com.contact.LinkedWork.dto;

import java.time.LocalDateTime;

public class CertificadoDTO {
    
    private Integer idCertificado;
    private Integer idTrabajador;
    private String nombre;
    private String entidad;
    private String descripcion;
    private LocalDateTime fecha;
    
    public CertificadoDTO() {
    }
    
    public CertificadoDTO(Integer idTrabajador, String nombre, String entidad) {
        this.idTrabajador = idTrabajador;
        this.nombre = nombre;
        this.entidad = entidad;
    }
    
    public Integer getIdCertificado() {
        return idCertificado;
    }
    
    public void setIdCertificado(Integer idCertificado) {
        this.idCertificado = idCertificado;
    }
    
    public Integer getIdTrabajador() {
        return idTrabajador;
    }
    
    public void setIdTrabajador(Integer idTrabajador) {
        this.idTrabajador = idTrabajador;
    }
    
    public String getNombre() {
        return nombre;
    }
    
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    
    public String getEntidad() {
        return entidad;
    }
    
    public void setEntidad(String entidad) {
        this.entidad = entidad;
    }
    
    public String getDescripcion() {
        return descripcion;
    }
    
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    
    public LocalDateTime getFecha() {
        return fecha;
    }
    
    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
}
