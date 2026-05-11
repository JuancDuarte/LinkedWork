package com.contact.LinkedWork.model;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "Nivel")
public class Nivel {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdNivel")
    private Long idNivel;
    
    @Column(name = "nombre", length = 50)
    private String nombre;
    
    @Column(name = "PuntajeMin")
    private Long puntajeMin;
    
    @Column(name = "PuntajeMax")
    private Long puntajeMax;
    
    public Nivel() {
    }
    
    public Nivel(String nombre, Long puntajeMin, Long puntajeMax) {
        this.nombre = nombre;
        this.puntajeMin = puntajeMin;
        this.puntajeMax = puntajeMax;
    }
    
    public Long getIdNivel() {
        return idNivel;
    }
    
    public void setIdNivel(Long idNivel) {
        this.idNivel = idNivel;
    }
    
    public String getNombre() {
        return nombre;
    }
    
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    
    public Long getPuntajeMin() {
        return puntajeMin;
    }
    
    public void setPuntajeMin(Long puntajeMin) {
        this.puntajeMin = puntajeMin;
    }
    
    public Long getPuntajeMax() {
        return puntajeMax;
    }
    
    public void setPuntajeMax(Long puntajeMax) {
        this.puntajeMax = puntajeMax;
    }
    
}
