package com.contact.LinkedWork.dto;

public class AreaDTO {
    
    private Long idArea;
    private String nombre;
    private String descripcion;
    
    public AreaDTO() {
    }
    
    public AreaDTO(Long idArea, String nombre) {
        this.idArea = idArea;
        this.nombre = nombre;
    }
    
    public Long getIdArea() {
        return idArea;
    }
    
    public void setIdArea(Long idArea) {
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
