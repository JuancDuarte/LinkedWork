package com.contact.LinkedWork.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "Solicitud")
public class Solicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdSolicitud")
    private Long idSolicitud;

    @ManyToOne(optional = false)
    @JoinColumn(name = "IdUsuario", nullable = false)
    @JsonIgnore
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "IdArea")
    @JsonIgnore
    private Area area;

    @Column(name = "Titulo", length = 150)
    private String titulo;

    @Column(name = "Descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "Estado", length = 50)
    private String estado = "pendiente";

    @Column(name = "FechaCreacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @OneToMany(mappedBy = "solicitud", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<SolicitudHistorial> historiales = new HashSet<>();

    @OneToMany(mappedBy = "solicitud", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Oferta> ofertas = new HashSet<>();

    @OneToMany(mappedBy = "solicitud", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Calificacion> calificaciones = new HashSet<>();

    public Solicitud() {
        this.fechaCreacion = LocalDateTime.now();
    }

    public Solicitud(Usuario usuario, Area area, String titulo, String descripcion) {
        this.usuario = usuario;
        this.area = area;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.fechaCreacion = LocalDateTime.now();
    }

    public Long getIdSolicitud() {
        return idSolicitud;
    }

    public void setIdSolicitud(Long idSolicitud) {
        this.idSolicitud = idSolicitud;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Area getArea() {
        return area;
    }

    public void setArea(Area area) {
        this.area = area;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public Set<SolicitudHistorial> getHistoriales() {
        return historiales;
    }

    public void setHistoriales(Set<SolicitudHistorial> historiales) {
        this.historiales = historiales;
    }

    public Set<Oferta> getOfertas() {
        return ofertas;
    }

    public void setOfertas(Set<Oferta> ofertas) {
        this.ofertas = ofertas;
    }

    public Set<Calificacion> getCalificaciones() {
        return calificaciones;
    }

    public void setCalificaciones(Set<Calificacion> calificaciones) {
        this.calificaciones = calificaciones;
    }
}
