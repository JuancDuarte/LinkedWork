package com.contact.LinkedWork.dto;

public class CalificarDTO {
    private long puntuacion;
    private String comentario;
    public CalificarDTO() {
    }
    public CalificarDTO(long puntuacion, String comentario) {

        this.puntuacion = puntuacion;
        this.comentario = comentario;
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
