package com.contact.LinkedWork.dto;

public class EditarSolicitudDTO {
    private Long idSolicitud;
    private Long idUsuario;

    private String titulo;
    private String descripcion;

    public EditarSolicitudDTO() {
    }
    public EditarSolicitudDTO(Long idSolicitud, Long idUsuario, String titulo, String descripcion) {
        this.idSolicitud = idSolicitud;
        this.idUsuario = idUsuario;
        this.titulo = titulo;
        this.descripcion = descripcion;
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

}
