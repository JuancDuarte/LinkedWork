package com.contact.LinkedWork.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class OfertaVistaDTO {
    private Long idOferta;
    private String nombreTrabajador;
    private String nombreArea;
    private String descripcion;
    private LocalDate fechaPublicacion;
    private BigDecimal precio;
    private Double calificacionPromedio;
    private Long idUsuario;
    private String fotoTrabajadorUrl;
    private String estado;
    private Long idSolicitud;
    private String tituloSolicitud;
    private LocalDate fechaServicio;

    public OfertaVistaDTO() {
    }
    public OfertaVistaDTO(Long idOferta, String nombreTrabajador, String nombreArea, String descripcion, BigDecimal precio, Double calificacionPromedio, LocalDate fechaPublicacion) {
        this.idOferta = idOferta;
        this.nombreTrabajador = nombreTrabajador;
        this.nombreArea = nombreArea;
        this.descripcion = descripcion;
        this.precio = precio;
        this.calificacionPromedio = calificacionPromedio;
        this.fechaPublicacion = fechaPublicacion;
    }
    public Long getIdOferta() {
        return idOferta;
    }
    public void setIdOferta(Long idOferta) {
        this.idOferta = idOferta;
    }
    public String getNombreTrabajador() {
        return nombreTrabajador;
    }
    public void setNombreTrabajador(String nombreTrabajador) {
        this.nombreTrabajador = nombreTrabajador;
    }
    public String getNombreArea() {
        return nombreArea;
    }
    public void setNombreArea(String nombreArea) {
        this.nombreArea = nombreArea;
    }
    public String getDescripcion() {
        return descripcion;
    }
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    public BigDecimal getPrecio() {
        return precio;
    }
    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }
    public Double getCalificacionPromedio() {
        return calificacionPromedio;
    }
    public void setCalificacionPromedio(Double calificacionPromedio) {
        this.calificacionPromedio = calificacionPromedio;
    }
    public LocalDate getFechaPublicacion() {
        return fechaPublicacion;
    }
    public void setFechaPublicacion(LocalDate fechaPublicacion) {
        this.fechaPublicacion = fechaPublicacion;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }
    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getFotoTrabajadorUrl() {
        return fotoTrabajadorUrl;
    }

    public void setFotoTrabajadorUrl(String fotoTrabajadorUrl) {
        this.fotoTrabajadorUrl = fotoTrabajadorUrl;
    }

    public String getEstado() {
        return estado;
    }
    public void setEstado(String estado) {
        this.estado = estado;
    }
    public Long getIdSolicitud() {
        return idSolicitud;
    }
    public void setIdSolicitud(Long idSolicitud) {
        this.idSolicitud = idSolicitud;
    }
    public String getTituloSolicitud() {
        return tituloSolicitud;
    }
    public void setTituloSolicitud(String tituloSolicitud) {
        this.tituloSolicitud = tituloSolicitud;
    }
    public LocalDate getFechaServicio() {
        return fechaServicio;
    }
    public void setFechaServicio(LocalDate fechaServicio) {
        this.fechaServicio = fechaServicio;
    }
}
