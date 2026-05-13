package com.contact.LinkedWork.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "Observacion")
public class Observacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdObservacion")
    private Long idObservacion;

    @ManyToOne(optional = false)
    @JoinColumn(name = "IdTrabajador", nullable = false)
    @JsonIgnore
    private Trabajador trabajador;

    @ManyToOne
    @JoinColumn(name = "IdAdministrador")
    @JsonIgnore
    private Usuario administrador;

    @Column(name = "Descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "Tipo", length = 50)
    private String tipo;

    @Column(name = "Fecha", nullable = false, updatable = false)
    private LocalDateTime fecha;

    public Observacion() {
        this.fecha = LocalDateTime.now();
    }

    public Observacion(Trabajador trabajador, String descripcion, String tipo) {
        this.trabajador = trabajador;
        this.descripcion = descripcion;
        this.tipo = tipo;
        this.fecha = LocalDateTime.now();
    }

    public Long getIdObservacion() {
        return idObservacion;
    }

    public void setIdObservacion(Long idObservacion) {
        this.idObservacion = idObservacion;
    }

    public Trabajador getTrabajador() {
        return trabajador;
    }

    public void setTrabajador(Trabajador trabajador) {
        this.trabajador = trabajador;
    }

    public Usuario getAdministrador() {
        return administrador;
    }

    public void setAdministrador(Usuario administrador) {
        this.administrador = administrador;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
}
