package com.contact.LinkedWork.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "Solicitud_Historial")
public class SolicitudHistorial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdHistorial")
    private Long idHistorial;

    @ManyToOne(optional = false)
    @JoinColumn(name = "IdSolicitud", nullable = false)
    @JsonIgnore
    private Solicitud solicitud;

    @Column(name = "EstadoAnterior", length = 50)
    private String estadoAnterior;

    @Column(name = "EstadoNuevo", length = 50)
    private String estadoNuevo;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fecha;

    public SolicitudHistorial() {
        this.fecha = LocalDateTime.now();
    }

    public SolicitudHistorial(Solicitud solicitud, String estadoAnterior, String estadoNuevo) {
        this.solicitud = solicitud;
        this.estadoAnterior = estadoAnterior;
        this.estadoNuevo = estadoNuevo;
        this.fecha = LocalDateTime.now();
    }

    public Long getIdHistorial() {
        return idHistorial;
    }

    public void setIdHistorial(Long idHistorial) {
        this.idHistorial = idHistorial;
    }

    public Solicitud getSolicitud() {
        return solicitud;
    }

    public void setSolicitud(Solicitud solicitud) {
        this.solicitud = solicitud;
    }

    public String getEstadoAnterior() {
        return estadoAnterior;
    }

    public void setEstadoAnterior(String estadoAnterior) {
        this.estadoAnterior = estadoAnterior;
    }

    public String getEstadoNuevo() {
        return estadoNuevo;
    }

    public void setEstadoNuevo(String estadoNuevo) {
        this.estadoNuevo = estadoNuevo;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
}
