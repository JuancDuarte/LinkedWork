package com.contact.LinkedWork.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "Evaluacion")
public class Evaluacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdEvaluacion")
    private Long idEvaluacion;

    @ManyToOne(optional = false)
    @JoinColumn(name = "IdTrabajador", nullable = false)
    @JsonIgnore
    private Trabajador trabajador;

    @ManyToOne
    @JoinColumn(name = "IdAdministrador")
    @JsonIgnore
    private Usuario administrador;

    @Column(name = "Resultado", length = 50)
    private String resultado;

    @Column(name = "Estado", length = 50)
    private String estado = "pendiente";

    @Column(name = "Fecha", nullable = false, updatable = false)
    private LocalDateTime fecha;

    public Evaluacion() {
        this.fecha = LocalDateTime.now();
    }

    public Evaluacion(Trabajador trabajador) {
        this.trabajador = trabajador;
        this.fecha = LocalDateTime.now();
    }

    public Long getIdEvaluacion() {
        return idEvaluacion;
    }

    public void setIdEvaluacion(Long idEvaluacion) {
        this.idEvaluacion = idEvaluacion;
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

    public String getResultado() {
        return resultado;
    }

    public void setResultado(String resultado) {
        this.resultado = resultado;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
}
