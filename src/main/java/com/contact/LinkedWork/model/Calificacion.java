package com.contact.LinkedWork.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "Calificacion")
public class Calificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdCalificacion")
    @JsonIgnore
    private Long idCalificacion;

    @ManyToOne(optional = false)
    @JoinColumn(name = "IdUsuario", nullable = false)
    @JsonIgnore
    private Usuario usuario;

    @ManyToOne(optional = false)
    @JoinColumn(name = "IdTrabajador", nullable = false)
    @JsonIgnore
    private Trabajador trabajador;

    @ManyToOne(optional = false)
    @JoinColumn(name = "IdSolicitud", nullable = false)
    @JsonIgnore
    private Solicitud solicitud;

    @Column(name = "Puntuacion")
    private Long puntuacion;

    @Column(name = "Comentario", columnDefinition = "TEXT")
    private String comentario;

    @Column(name = "FechaCreacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    public Calificacion() {
        this.fechaCreacion = LocalDateTime.now();
    }

    public Calificacion(Usuario usuario, Trabajador trabajador, Solicitud solicitud) {
        this.usuario = usuario;
        this.trabajador = trabajador;
        this.solicitud = solicitud;
        this.fechaCreacion = LocalDateTime.now();
    }

    public Long getIdCalificacion() {
        return idCalificacion;
    }

    public void setIdCalificacion(Long idCalificacion) {
        this.idCalificacion = idCalificacion;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Trabajador getTrabajador() {
        return trabajador;
    }

    public void setTrabajador(Trabajador trabajador) {
        this.trabajador = trabajador;
    }

    public Solicitud getSolicitud() {
        return solicitud;
    }

    public void setSolicitud(Solicitud solicitud) {
        this.solicitud = solicitud;
    }

    public Long getPuntuacion() {
        return puntuacion;
    }

    public void setPuntuacion(Long puntuacion) {
        this.puntuacion = puntuacion;
    }

    public String getComentario() {
        return comentario;
    }

    public void setComentario(String comentario) {
        this.comentario = comentario;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}
