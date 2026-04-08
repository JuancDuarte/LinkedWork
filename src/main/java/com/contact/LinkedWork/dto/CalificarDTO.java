package com.contact.LinkedWork.dto;

public class CalificarDTO {
    private long idSolicitud;
    private long idUsuario;
    private long puntuacion;
    private String comentario;
    public CalificarDTO() {
    }
    public CalificarDTO(long idSolicitud, long idUsuario, long puntuacion, String comentario) {
        this.idSolicitud = idSolicitud;
        this.idUsuario = idUsuario;
        this.puntuacion = puntuacion;
        this.comentario = comentario;
    }
    public long getIdSolicitud() {
        return idSolicitud;
    }
    public void setIdSolicitud(long idSolicitud) {
        this.idSolicitud = idSolicitud;
    }
    public long getIdUsuario() {
        return idUsuario;
    }
    public void setIdUsuario(long idUsuario) {
        this.idUsuario = idUsuario;
    }
    public long getPuntuacion() {
        return puntuacion;
    }
    public void setPuntuacion(long puntuacion) {
        this.puntuacion = puntuacion;
    }
    public String getComentario() {
        return comentario;
    }
    public void setComentario(String comentario) {
        this.comentario = comentario;
    }


}
