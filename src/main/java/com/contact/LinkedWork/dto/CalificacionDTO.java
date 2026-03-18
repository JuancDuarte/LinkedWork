package com.contact.LinkedWork.dto;

import java.time.LocalDateTime;

public class CalificacionDTO {
    
    private Integer idCalificacion;
    private Integer idUsuario;
    private Integer idTrabajador;
    private Integer idSolicitud;
    private Integer puntuacion;
    private String comentario;
    private LocalDateTime fechaCreacion;
    
    public CalificacionDTO() {
    }
    
    public CalificacionDTO(Integer idUsuario, Integer idTrabajador, Integer idSolicitud) {
        this.idUsuario = idUsuario;
        this.idTrabajador = idTrabajador;
        this.idSolicitud = idSolicitud;
    }
    
    public Integer getIdCalificacion() {
        return idCalificacion;
    }
    
    public void setIdCalificacion(Integer idCalificacion) {
        this.idCalificacion = idCalificacion;
    }
    
    public Integer getIdUsuario() {
        return idUsuario;
    }
    
    public void setIdUsuario(Integer idUsuario) {
        this.idUsuario = idUsuario;
    }
    
    public Integer getIdTrabajador() {
        return idTrabajador;
    }
    
    public void setIdTrabajador(Integer idTrabajador) {
        this.idTrabajador = idTrabajador;
    }
    
    public Integer getIdSolicitud() {
        return idSolicitud;
    }
    
    public void setIdSolicitud(Integer idSolicitud) {
        this.idSolicitud = idSolicitud;
    }
    
    public Integer getPuntuacion() {
        return puntuacion;
    }
    
    public void setPuntuacion(Integer puntuacion) {
        this.puntuacion = puntuacion;
    }
    
    public String getComentario() {
        return comentario;
    }
    
    public void setComentario(String comentario) {
        this.comentario = comentario;
    }
    
    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }
    
    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}
