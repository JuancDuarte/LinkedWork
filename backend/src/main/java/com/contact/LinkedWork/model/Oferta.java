package com.contact.LinkedWork.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "Oferta")
public class Oferta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdOferta")
    private Long idOferta;

    @ManyToOne(optional = false)
    @JoinColumn(name = "IdSolicitud", nullable = false)
    @JsonIgnore
    private Solicitud solicitud;

    @ManyToOne(optional = false)
    @JoinColumn(name = "IdTrabajador", nullable = false)
    @JsonIgnore
    private Trabajador trabajador;

    @Column( name = "Precio", precision = 10, scale = 2)
    private BigDecimal precio;

    @Column( name = "Descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column( name = "Estado", length = 50)
    private String estado = "pendiente";

    @Column(name = "FechaCreacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @OneToMany(mappedBy = "oferta", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<OfertaHistorial> historiales = new HashSet<>();

    public Oferta() {
        this.fechaCreacion = LocalDateTime.now();
    }

    public Oferta(Solicitud solicitud, Trabajador trabajador) {
        this.solicitud = solicitud;
        this.trabajador = trabajador;
        this.fechaCreacion = LocalDateTime.now();
    }

    public Long getIdOferta() {
        return idOferta;
    }

    public void setIdOferta(Long idOferta) {
        this.idOferta = idOferta;
    }

    public Solicitud getSolicitud() {
        return solicitud;
    }

    public void setSolicitud(Solicitud solicitud) {
        this.solicitud = solicitud;
    }

    public Trabajador getTrabajador() {
        return trabajador;
    }

    public void setTrabajador(Trabajador trabajador) {
        this.trabajador = trabajador;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
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

    public Set<OfertaHistorial> getHistoriales() {
        return historiales;
    }

    public void setHistoriales(Set<OfertaHistorial> historiales) {
        this.historiales = historiales;
    }
}
