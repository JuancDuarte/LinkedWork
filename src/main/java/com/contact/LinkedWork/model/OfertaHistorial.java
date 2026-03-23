package com.contact.LinkedWork.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "Oferta_Historial")
public class OfertaHistorial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdHistorial")
    private Long idHistorial;

    @ManyToOne(optional = false)
    @JoinColumn(name = "IdOferta", nullable = false)
    @JsonIgnore
    private Oferta oferta;

    @Column(name = "PrecioAnterior", precision = 10, scale = 2)
    private BigDecimal precioAnterior;

    @Column(name = "PrecioNuevo", precision = 10, scale = 2)
    private BigDecimal precioNuevo;

    @Column(name = "DescripcionAnterior", columnDefinition = "TEXT")
    private String descripcionAnterior;

    @Column(name = "DescripcionNueva", columnDefinition = "TEXT")
    private String descripcionNueva;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fecha;

    public OfertaHistorial() {
        this.fecha = LocalDateTime.now();
    }

    public OfertaHistorial(Oferta oferta) {
        this.oferta = oferta;
        this.fecha = LocalDateTime.now();
    }

    public Long getIdHistorial() {
        return idHistorial;
    }

    public void setIdHistorial(Long idHistorial) {
        this.idHistorial = idHistorial;
    }

    public Oferta getOferta() {
        return oferta;
    }

    public void setOferta(Oferta oferta) {
        this.oferta = oferta;
    }

    public BigDecimal getPrecioAnterior() {
        return precioAnterior;
    }

    public void setPrecioAnterior(BigDecimal precioAnterior) {
        this.precioAnterior = precioAnterior;
    }

    public BigDecimal getPrecioNuevo() {
        return precioNuevo;
    }

    public void setPrecioNuevo(BigDecimal precioNuevo) {
        this.precioNuevo = precioNuevo;
    }

    public String getDescripcionAnterior() {
        return descripcionAnterior;
    }

    public void setDescripcionAnterior(String descripcionAnterior) {
        this.descripcionAnterior = descripcionAnterior;
    }

    public String getDescripcionNueva() {
        return descripcionNueva;
    }

    public void setDescripcionNueva(String descripcionNueva) {
        this.descripcionNueva = descripcionNueva;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
}
