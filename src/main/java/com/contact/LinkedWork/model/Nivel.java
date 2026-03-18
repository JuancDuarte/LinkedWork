package com.contact.LinkedWork.model;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "Nivel")
public class Nivel {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_nivel")
    private Integer idNivel;
    
    @Column(length = 50)
    private String nombre;
    
    @Column(name = "puntaje_min")
    private Integer puntajeMin;
    
    @Column(name = "puntaje_max")
    private Integer puntajeMax;
    
    @OneToMany(mappedBy = "nivel", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TrabajadorNivel> trabajadorNiveles = new HashSet<>();
    
    public Nivel() {
    }
    
    public Nivel(String nombre, Integer puntajeMin, Integer puntajeMax) {
        this.nombre = nombre;
        this.puntajeMin = puntajeMin;
        this.puntajeMax = puntajeMax;
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
    
    public Set<TrabajadorNivel> getTrabajadorNiveles() {
        return trabajadorNiveles;
    }
    
    public void setTrabajadorNiveles(Set<TrabajadorNivel> trabajadorNiveles) {
        this.trabajadorNiveles = trabajadorNiveles;
    }
}
