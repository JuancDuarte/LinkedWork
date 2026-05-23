package com.contact.LinkedWork.dto;

import java.math.BigDecimal;
import jakarta.validation.constraints.*;

public class CrearOfertaDTO {
    @NotNull(message = "El precio de la oferta es obligatorio")
    @DecimalMin(value = "50000", message = "El precio mínimo permitido es $50.000")
    @DecimalMax(value = "700000", message = "El precio máximo permitido es $700.000")
    private BigDecimal precio;

    @NotBlank(message = "La descripción de la oferta es requerida")
    @Size(min = 10, max = 1000, message = "La descripción debe tener entre 10 y 1000 caracteres")
    private String descripcion;

    @NotNull(message = "El ID del trabajador es obligatorio")
    @Positive(message = "El ID del trabajador debe ser válido")
    private Long idTrabajador;

    @NotNull(message = "El ID de la solicitud es obligatorio")
    @Positive(message = "El ID de la solicitud debe ser válido")
    private Long idSolicitud;
    public CrearOfertaDTO() {
    }
    public CrearOfertaDTO(BigDecimal precio, String descripcion, Long idTrabajador, Long idSolicitud) {
        this.precio = precio;
        this.descripcion = descripcion;
        this.idTrabajador = idTrabajador;
        this.idSolicitud = idSolicitud;
    }
    public BigDecimal getPrecio() {
        return precio;
    }
    public String getDescripcion() {
        return descripcion;
    }
    public Long getIdTrabajador() {
        return idTrabajador;
    }
    public Long getIdSolicitud() {
        return idSolicitud;
    }
    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    public void setIdTrabajador(Long idTrabajador) {
        this.idTrabajador = idTrabajador;
    }
    public void setIdSolicitud(Long idSolicitud) {
        this.idSolicitud = idSolicitud;
    }

}
