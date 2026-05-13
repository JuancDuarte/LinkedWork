package com.contact.LinkedWork.dto;

public class NivelDTO {
    
    private Integer idNivel;
    private String nombre;
    private Integer puntajeMin;
    private Integer puntajeMax;
    
    public NivelDTO() {
    }
    
    public NivelDTO(Integer idNivel, String nombre) {
        this.idNivel = idNivel;
        this.nombre = nombre;
    }
    
    public Integer getIdNivel() {
        return idNivel;
    }
    
    public void setIdNivel(Integer idNivel) {
        this.idNivel = idNivel;
    }
    
    public String getNombre() {
        return nombre;
    }
    
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    
    public Integer getPuntajeMin() {
        return puntajeMin;
    }
    
    public void setPuntajeMin(Integer puntajeMin) {
        this.puntajeMin = puntajeMin;
    }
    
    public Integer getPuntajeMax() {
        return puntajeMax;
    }
    
    public void setPuntajeMax(Integer puntajeMax) {
        this.puntajeMax = puntajeMax;
    }
}
