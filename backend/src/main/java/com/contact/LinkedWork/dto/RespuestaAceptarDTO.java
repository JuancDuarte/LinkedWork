package com.contact.LinkedWork.dto;

public class RespuestaAceptarDTO {
    private String mensaje;
    private Long idSolicitud;
    private String tituloSolicitud;
    private Long idSolicitante;
    private String nombreSolicitante;
    private Long idTrabajador;
    private String nombreTrabajador;

    public RespuestaAceptarDTO() {
    }
    
    public RespuestaAceptarDTO(String mensaje) {
        this.mensaje = mensaje;
    }

    public RespuestaAceptarDTO(String mensaje, Long idSolicitud, String tituloSolicitud, Long idSolicitante,
            String nombreSolicitante, Long idTrabajador, String nombreTrabajador) {
        this.mensaje = mensaje;
        this.idSolicitud = idSolicitud;
        this.tituloSolicitud = tituloSolicitud;
        this.idSolicitante = idSolicitante;
        this.nombreSolicitante = nombreSolicitante;
        this.idTrabajador = idTrabajador;
        this.nombreTrabajador = nombreTrabajador;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
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

    public Long getIdSolicitante() {
        return idSolicitante;
    }

    public void setIdSolicitante(Long idSolicitante) {
        this.idSolicitante = idSolicitante;
    }

    public String getNombreSolicitante() {
        return nombreSolicitante;
    }

    public void setNombreSolicitante(String nombreSolicitante) {
        this.nombreSolicitante = nombreSolicitante;
    }

    public Long getIdTrabajador() {
        return idTrabajador;
    }

    public void setIdTrabajador(Long idTrabajador) {
        this.idTrabajador = idTrabajador;
    }

    public String getNombreTrabajador() {
        return nombreTrabajador;
    }

    public void setNombreTrabajador(String nombreTrabajador) {
        this.nombreTrabajador = nombreTrabajador;
    }

}
