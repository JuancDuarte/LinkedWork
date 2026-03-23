package com.contact.LinkedWork.model;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "Area")
public class Area {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdArea")
    private Long idArea;

    @Column(name = "Nombre", length = 100)
    private String nombre;

    @Column(name = "Descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @OneToMany(mappedBy = "area", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<Trabajador> trabajadores = new HashSet<>();

    @OneToMany(mappedBy = "area", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<Solicitud> solicitudes = new HashSet<>();

    public Area() {
    }

    public Area(String nombre) {
        this.nombre = nombre;
    }

    public Area(String nombre, String descripcion) {
        this.nombre = nombre;
        this.descripcion = descripcion;
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

    public Set<Trabajador> getTrabajadores() {
        return trabajadores;
    }

    public void setTrabajadores(Set<Trabajador> trabajadores) {
        this.trabajadores = trabajadores;
    }

    public Set<Solicitud> getSolicitudes() {
        return solicitudes;
    }

    public void setSolicitudes(Set<Solicitud> solicitudes) {
        this.solicitudes = solicitudes;
    }
}
