package com.contact.LinkedWork.dto;

public class ListarTrabajadorDTO {
    private long idTrabajador;
    private long idUsuario;
    private String nombreUsuario;
    private String nombreArea;
    private long experiencia;
    private long puntajeTotal;
    private String nivel;
    private String departamento;
    private String ciudad;
    private boolean esFarming;

    public ListarTrabajadorDTO() {
    }
    public ListarTrabajadorDTO(long idTrabajador, String nombreUsuario, String nombreArea, long experiencia, long puntajeTotal) {
        this.idTrabajador = idTrabajador;
        this.nombreUsuario = nombreUsuario;
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
    public String getNombreUsuario() {
        return nombreUsuario;
    }
    public void setNombreUsuario(String nombreUsuario) {
        this.nombreUsuario = nombreUsuario;
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

    public boolean isEsFarming() {
        return esFarming;
    }

    public void setEsFarming(boolean esFarming) {
        this.esFarming = esFarming;
    }


}
