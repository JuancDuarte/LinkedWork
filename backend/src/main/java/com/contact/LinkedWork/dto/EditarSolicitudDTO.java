package com.contact.LinkedWork.dto;

import jakarta.validation.constraints.*;

public class EditarSolicitudDTO {
    private Long idSolicitud;
    private Long idUsuario;

    @NotBlank(message = "El título de la solicitud es obligatorio")
    @Size(min = 5, max = 150, message = "El título debe tener entre 5 y 150 caracteres")
    private String titulo;

    @NotBlank(message = "La descripción de la solicitud es requerida")
    @Size(min = 10, max = 1000, message = "La descripción debe tener entre 10 y 1000 caracteres")
    private String descripcion;

    @NotNull(message = "La fecha de servicio es obligatoria")
    @FutureOrPresent(message = "La fecha de servicio debe ser hoy o en el futuro")
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
