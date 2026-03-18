package com.contact.LinkedWork.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Oferta_Historial")
public class OfertaHistorial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historial")
    private Integer idHistorial;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_oferta", nullable = false)
    private Oferta oferta;

    @Column(name = "precio_anterior", precision = 10, scale = 2)
    private BigDecimal precioAnterior;

    @Column(name = "precio_nuevo", precision = 10, scale = 2)
    private BigDecimal precioNuevo;

    @Column(name = "descripcion_anterior", columnDefinition = "TEXT")
    private String descripcionAnterior;

    @Column(name = "descripcion_nueva", columnDefinition = "TEXT")
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

    public Integer getIdHistorial() {
        return idHistorial;
    }

    public void setIdHistorial(Integer idHistorial) {
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
