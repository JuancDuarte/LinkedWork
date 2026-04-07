package com.contact.LinkedWork.dto;

public class RolDTO {
    
    private Long idRol;
    private String nombre;
    
    public RolDTO() {
    }
    
    public RolDTO(Long idRol, String nombre) {
        this.idRol = idRol;
        this.nombre = nombre;
    }
    
    public Long getIdRol() {
        return idRol;
    }
    
    public void setIdRol(Long idRol) {
        this.idRol = idRol;
    }
    
    public String getNombre() {
        return nombre;
    }
    
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}
