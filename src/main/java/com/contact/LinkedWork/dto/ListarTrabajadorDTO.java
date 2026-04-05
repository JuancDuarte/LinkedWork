package com.contact.LinkedWork.dto;

public class ListarTrabajadorDTO {
    private long idTrabajador;
    private String nombreUsusario;
    private String nombreArea;
    private long experiencia;
    private long puntajeTotal;

    public ListarTrabajadorDTO() {
    }
    public ListarTrabajadorDTO(long idTrabajador, String nombreUsusario, String nombreArea, long experiencia, long puntajeTotal) {
        this.idTrabajador = idTrabajador;
        this.nombreUsusario = nombreUsusario;
        this.nombreArea = nombreArea;
        this.experiencia = experiencia;
        this.puntajeTotal = puntajeTotal;
    }
    public long getIdTrabajador() {
        return idTrabajador;
    }
    public void setIdTrabajador(long idTrabajador) {
        this.idTrabajador = idTrabajador;
    }
    public String getNombreUsusario() {
        return nombreUsusario;
    }
    public void setNombreUsusario(String nombreUsusario) {
        this.nombreUsusario = nombreUsusario;
    }
    public String getNombreArea() {
        return nombreArea;
    }
    public void setNombreArea(String nombreArea) {
        this.nombreArea = nombreArea;
    }
    public long getExperiencia() {
        return experiencia;
    }
    public void setExperiencia(long experiencia) {
        this.experiencia = experiencia;
    }
    public long getPuntajeTotal() {
        return puntajeTotal;
    }
    public void setPuntajeTotal(long puntajeTotal) {
        this.puntajeTotal = puntajeTotal;
    }


}
