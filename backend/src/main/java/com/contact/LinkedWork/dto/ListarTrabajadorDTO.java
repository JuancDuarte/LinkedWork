package com.contact.LinkedWork.dto;

public class ListarTrabajadorDTO {
    private long idTrabajador;
    private long idUsuario;
    private String nombreUsusario;
    private String nombreArea;
    private long experiencia;
    private long puntajeTotal;
    private String nivel;
    private String departamento;
    private String ciudad;

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
    public long getIdUsuario() {
        return idUsuario;
    }
    public void setIdUsuario(long idUsuario) {
        this.idUsuario = idUsuario;
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

    public String getNivel() {
        return nivel;
    }

    public void setNivel(String nivel) {
        this.nivel = nivel;
    }

    public String getDepartamento() {
        return departamento;
    }

    public void setDepartamento(String departamento) {
        this.departamento = departamento;
    }

    public String getCiudad() {
        return ciudad;
    }

    public void setCiudad(String ciudad) {
        this.ciudad = ciudad;
    }


}
