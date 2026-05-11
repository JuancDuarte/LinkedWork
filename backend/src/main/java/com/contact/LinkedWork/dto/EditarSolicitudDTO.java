package com.contact.LinkedWork.dto;

public class EditarSolicitudDTO {
    private Long idSolicitud;
    private Long idUsuario;

    private String titulo;
    private String descripcion;
    private java.time.LocalDate fechaServicio;

    public EditarSolicitudDTO() {
    }
    public EditarSolicitudDTO(Long idSolicitud, Long idUsuario, String titulo, String descripcion, java.time.LocalDate fechaServicio) {
        this.idSolicitud = idSolicitud;
        this.idUsuario = idUsuario;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.fechaServicio = fechaServicio;
    }
    public Long getIdSolicitud() {
        return idSolicitud;
    }
    public Long getIdUsuario() {
        return idUsuario;
    }
    public String getTitulo() {
        return titulo;
    }   
    public String getDescripcion() {
        return descripcion;
    }
    public void setIdSolicitud(Long idSolicitud) {
        this.idSolicitud = idSolicitud;
    }
    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }
    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public java.time.LocalDate getFechaServicio() {
        return fechaServicio;
    }

    public void setFechaServicio(java.time.LocalDate fechaServicio) {
        this.fechaServicio = fechaServicio;
    }

}
