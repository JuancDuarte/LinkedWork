package com.contact.LinkedWork.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "ChatMensaje")
public class ChatMensaje {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdMensaje")
    private Long idMensaje;

    @ManyToOne(optional = false)
    @JoinColumn(name = "IdSolicitud", nullable = false, columnDefinition = "INT")
    @JsonIgnore
    private Solicitud solicitud;

    @ManyToOne(optional = false)
    @JoinColumn(name = "IdEmisor", nullable = false, columnDefinition = "INT")
    @JsonIgnore
    private Usuario emisor;

    @Column(name = "Mensaje", nullable = false, columnDefinition = "TEXT")
    private String mensaje;

    @Column(name = "FechaEnvio", nullable = false, updatable = false)
    private LocalDateTime fechaEnvio;

    public ChatMensaje() {
        this.fechaEnvio = LocalDateTime.now();
    }

    public ChatMensaje(Solicitud solicitud, Usuario emisor, String mensaje) {
        this.solicitud = solicitud;
        this.emisor = emisor;
        this.mensaje = mensaje;
        this.fechaEnvio = LocalDateTime.now();
    }

    public Long getIdMensaje() {
        return idMensaje;
    }

    public void setIdMensaje(Long idMensaje) {
        this.idMensaje = idMensaje;
    }

    public Solicitud getSolicitud() {
        return solicitud;
    }

    public void setSolicitud(Solicitud solicitud) {
        this.solicitud = solicitud;
    }

    public Usuario getEmisor() {
        return emisor;
    }

    public void setEmisor(Usuario emisor) {
        this.emisor = emisor;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public LocalDateTime getFechaEnvio() {
        return fechaEnvio;
    }

    public void setFechaEnvio(LocalDateTime fechaEnvio) {
        this.fechaEnvio = fechaEnvio;
    }

    // Custom exposed fields for JSON serialization
    public Long getIdSolicitud() {
        return solicitud != null ? solicitud.getIdSolicitud() : null;
    }

    public Long getIdEmisor() {
        return emisor != null ? emisor.getIdUsuario() : null;
    }

    public String getNombreEmisor() {
        return emisor != null ? emisor.getNombreCompleto() : null;
    }
}
