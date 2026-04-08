package com.contact.LinkedWork.dto;

public class TrabajadorDTO {
    
    private Long areaId;
    private String areaNombre;
    private String descripcion;
    private Long experiencia;
    
    public TrabajadorDTO() {
    }
    public TrabajadorDTO(Long areaId, String areaNombre) {
        this.areaId = areaId;
        this.areaNombre = areaNombre;
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

}
