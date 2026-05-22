package com.contact.LinkedWork.dto;

import jakarta.validation.constraints.NotNull;

public class PaymentInitiateDTO {
    @NotNull(message = "El ID de la solicitud es obligatorio.")
    private Long idSolicitud;

    @NotNull(message = "El ID de la oferta es obligatorio.")
    private Long idOferta;

    public Long getIdSolicitud() {
        return idSolicitud;
    }

    public void setIdSolicitud(Long idSolicitud) {
        this.idSolicitud = idSolicitud;
    }

    public Long getIdOferta() {
        return idOferta;
    }

    public void setIdOferta(Long idOferta) {
        this.idOferta = idOferta;
    }
}
