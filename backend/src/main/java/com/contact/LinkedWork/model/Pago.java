package com.contact.LinkedWork.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "Pago")
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdPago")
    private Long idPago;

    @ManyToOne(optional = false)
    @JoinColumn(name = "IdSolicitud", nullable = false)
    private Solicitud solicitud;

    @ManyToOne(optional = false)
    @JoinColumn(name = "IdUsuario", nullable = false)
    private Usuario usuario; // Client who paid

    @ManyToOne(optional = false)
    @JoinColumn(name = "IdOferta", nullable = false)
    private Oferta oferta; // Paid technician offer

    @Column(name = "Monto", precision = 10, scale = 2, nullable = false)
    private BigDecimal monto; // Total paid by client

    @Column(name = "Comision", precision = 10, scale = 2, nullable = false)
    private BigDecimal comision; // LinkedWork 5% commission

    @Column(name = "MontoNeto", precision = 10, scale = 2, nullable = false)
    private BigDecimal montoNeto; // Net amount for technician

    @Column(name = "ReferenciaPago", length = 100, unique = true, nullable = false)
    private String referenciaPago; // PayU unique code

    @Column(name = "EstadoPago", length = 50, nullable = false)
    private String estadoPago = "Pendiente"; // Pendiente, Aprobado, Rechazado

    @Column(name = "MetodoPago", length = 50)
    private String metodoPago; // PSE, Credit Card, etc.

    @Column(name = "FechaCreacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "FechaActualizacion")
    private LocalDateTime fechaActualizacion;

    /** pendiente_nequi | enviado_nequi */
    @Column(name = "LiquidacionTrabajador", length = 50)
    private String liquidacionTrabajador = "pendiente_nequi";

    /** acreditado | pendiente */
    @Column(name = "LiquidacionPlataforma", length = 50)
    private String liquidacionPlataforma = "pendiente";

    @Column(name = "NequiTrabajador", length = 20)
    private String nequiTrabajador;

    @Column(name = "WompiTransactionId", length = 80)
    private String wompiTransactionId;

    @Column(name = "NequiCliente", length = 20)
    private String nequiCliente;

    public Pago() {
        this.fechaCreacion = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.fechaActualizacion = LocalDateTime.now();
    }

    public Long getIdPago() {
        return idPago;
    }

    public void setIdPago(Long idPago) {
        this.idPago = idPago;
    }

    public Solicitud getSolicitud() {
        return solicitud;
    }

    public void setSolicitud(Solicitud solicitud) {
        this.solicitud = solicitud;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }

    public BigDecimal getComision() {
        return comision;
    }

    public void setComision(BigDecimal comision) {
        this.comision = comision;
    }

    public BigDecimal getMontoNeto() {
        return montoNeto;
    }

    public void setMontoNeto(BigDecimal montoNeto) {
        this.montoNeto = montoNeto;
    }

    public String getReferenciaPago() {
        return referenciaPago;
    }

    public void setReferenciaPago(String referenciaPago) {
        this.referenciaPago = referenciaPago;
    }

    public String getEstadoPago() {
        return estadoPago;
    }

    public void setEstadoPago(String estadoPago) {
        this.estadoPago = estadoPago;
    }

    public String getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(String metodoPago) {
        this.metodoPago = metodoPago;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }

    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }

    public Oferta getOferta() {
        return oferta;
    }

    public void setOferta(Oferta oferta) {
        this.oferta = oferta;
    }

    public String getLiquidacionTrabajador() {
        return liquidacionTrabajador;
    }

    public void setLiquidacionTrabajador(String liquidacionTrabajador) {
        this.liquidacionTrabajador = liquidacionTrabajador;
    }

    public String getLiquidacionPlataforma() {
        return liquidacionPlataforma;
    }

    public void setLiquidacionPlataforma(String liquidacionPlataforma) {
        this.liquidacionPlataforma = liquidacionPlataforma;
    }

    public String getNequiTrabajador() {
        return nequiTrabajador;
    }

    public void setNequiTrabajador(String nequiTrabajador) {
        this.nequiTrabajador = nequiTrabajador;
    }

    public String getWompiTransactionId() {
        return wompiTransactionId;
    }

    public void setWompiTransactionId(String wompiTransactionId) {
        this.wompiTransactionId = wompiTransactionId;
    }

    public String getNequiCliente() {
        return nequiCliente;
    }

    public void setNequiCliente(String nequiCliente) {
        this.nequiCliente = nequiCliente;
    }
}
