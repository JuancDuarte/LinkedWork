package com.contact.LinkedWork.dto;

public class AreaDTO {
    
    private Integer idArea;
    private String nombre;
    private String descripcion;
    
    public AreaDTO() {
    }
    
    public AreaDTO(Integer idArea, String nombre) {
        this.idArea = idArea;
        this.nombre = nombre;
    }
    
    public Integer getIdArea() {
        return idArea;
    }
    
    public void setIdArea(Integer idArea) {
        this.idArea = idArea;
    }
    
    public String getNombre() {
        return nombre;
    }
    
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    
    public String getDescripcion() {
        return descripcion;
    }
    
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
}
