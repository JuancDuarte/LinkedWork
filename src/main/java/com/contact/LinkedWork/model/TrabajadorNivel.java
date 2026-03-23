package com.contact.LinkedWork.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "Trabajador_Nivel")
public class TrabajadorNivel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "IdTrabajador", referencedColumnName = "IdTrabajador", nullable = false)
    @JsonIgnore
    private Trabajador trabajador;

    @ManyToOne(optional = false)
    @JsonIgnore
    @JoinColumn(name = "IdNivel", referencedColumnName = "IdNivel", nullable = false)
    private Nivel nivel;

    @Column(name = "FechaInicio", nullable = false, updatable = false)
    private LocalDateTime fechaInicio;

    @Column(name = "FechaFin")
    private LocalDateTime fechaFin;

    public TrabajadorNivel() {
        this.fechaInicio = LocalDateTime.now();
    }

    public TrabajadorNivel(Trabajador trabajador, Nivel nivel) {
        this.trabajador = trabajador;
        this.nivel = nivel;
        this.fechaInicio = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Trabajador getTrabajador() {
        return trabajador;
    }

    public void setTrabajador(Trabajador trabajador) {
        this.trabajador = trabajador;
    }

    public Nivel getNivel() {
        return nivel;
    }

    public void setNivel(Nivel nivel) {
        this.nivel = nivel;
    }

    public LocalDateTime getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDateTime fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDateTime getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDateTime fechaFin) {
        this.fechaFin = fechaFin;
    }
}
