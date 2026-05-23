package com.contact.LinkedWork.dto;

public class TrabajadorDTO {
    
    private Long idTrabajador;
    private Long areaId;
    private String areaNombre;
    private String descripcion;
    private Long experiencia;
    private Integer puntuacion;
    private String departamento;
    private String ciudad;
    private Boolean esFarming;
    private String nequiNumero;
    
    public TrabajadorDTO() {
    }
    public TrabajadorDTO(Long areaId, String areaNombre) {
        this.areaId = areaId;
        this.areaNombre = areaNombre;
    }

    public Long getIdTrabajador() {
        return idTrabajador;
    }

    public void setIdTrabajador(Long idTrabajador) {
        this.idTrabajador = idTrabajador;
    }

    public Long getAreaId() {
        return areaId;
    }

    public void setAreaId(Long areaId) {
        this.areaId = areaId;
    }

    public String getAreaNombre() {
        return areaNombre;
    }

    public void setAreaNombre(String areaNombre) {
        this.areaNombre = areaNombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public Long getExperiencia() {
        return experiencia;
    }

    public void setExperiencia(Long experiencia) {
        this.experiencia = experiencia;
    }

    public Integer getPuntuacion() {
        return puntuacion;
    }

    public void setPuntuacion(Integer puntuacion) {
        this.puntuacion = puntuacion;
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

    public Boolean getEsFarming() {
        return esFarming;
    }

    public void setEsFarming(Boolean esFarming) {
        this.esFarming = esFarming;
    }

    public String getNequiNumero() {
        return nequiNumero;
    }

    public void setNequiNumero(String nequiNumero) {
        this.nequiNumero = nequiNumero;
    }

}
