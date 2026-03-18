package com.contact.LinkedWork.dto;

public class TrabajadorDTO {
    
    private Integer idTrabajador;
    private Integer idUsuario;
    private Integer idArea;
    private String descripcion;
    private Integer experiencia;
    private String estado;
    
    public TrabajadorDTO() {
    }
    
    public TrabajadorDTO(Integer idTrabajador, Integer idUsuario) {
        this.idTrabajador = idTrabajador;
        this.idUsuario = idUsuario;
    }
    
    public Integer getIdTrabajador() {
        return idTrabajador;
    }
    
    public void setIdTrabajador(Integer idTrabajador) {
        this.idTrabajador = idTrabajador;
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
    
    public String getDescripcion() {
        return descripcion;
    }
    
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    
    public Integer getExperiencia() {
        return experiencia;
    }
    
    public void setExperiencia(Integer experiencia) {
        this.experiencia = experiencia;
    }
    
    public String getEstado() {
        return estado;
    }
    
    public void setEstado(String estado) {
        this.estado = estado;
    }
}
