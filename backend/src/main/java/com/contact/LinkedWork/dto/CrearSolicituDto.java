package com.contact.LinkedWork.dto;

import jakarta.validation.constraints.*;

public class CrearSolicituDto {
    @NotBlank(message = "El título de la solicitud es obligatorio")
    @Size(min = 5, max = 150, message = "El título debe tener entre 5 y 150 caracteres")
    private String titulo;

    @NotBlank(message = "La descripción de la solicitud es requerida")
    @Size(min = 10, max = 1000, message = "La descripción debe tener entre 10 y 1000 caracteres")
    private String descripcion;

    private Long idUsuario;

    @NotNull(message = "El área de servicio es obligatoria")
    @Positive(message = "El ID del área debe ser válido")
    private Long idArea;

    @DecimalMin(value = "50000", message = "El precio mínimo permitido es $50.000")
    @DecimalMax(value = "700000", message = "El precio máximo permitido es $700.000")
    private java.math.BigDecimal precio;

    @NotNull(message = "La fecha de servicio es obligatoria")
    @FutureOrPresent(message = "La fecha de servicio debe ser hoy o en el futuro")
    private java.time.LocalDate fechaServicio;

    private String direccion;

    private Double latitud;

    private Double longitud;

    public CrearSolicituDto() {
    }

    public CrearSolicituDto(String titulo, String descripcion, Long idUsuario, Long idArea) {
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.idUsuario = idUsuario;
        this.idArea = idArea;
    }
    public String getTitulo() {
        return titulo;
    }
    public String getDescripcion() {
        return descripcion;
    }
    public Long getIdUsuario() {
        return idUsuario;
    }
    public Long getIdArea() {
        return idArea;
    }
    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }
    public void setIdArea(Long idArea) {
        this.idArea = idArea;
    }

    public java.math.BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(java.math.BigDecimal precio) {
        this.precio = precio;
    }

    public java.time.LocalDate getFechaServicio() {
        return fechaServicio;
    }

    public void setFechaServicio(java.time.LocalDate fechaServicio) {
        this.fechaServicio = fechaServicio;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public Double getLatitud() {
        return latitud;
    }

    public void setLatitud(Double latitud) {
        this.latitud = latitud;
    }

    public Double getLongitud() {
        return longitud;
    }

    public void setLongitud(Double longitud) {
        this.longitud = longitud;
    }
}
