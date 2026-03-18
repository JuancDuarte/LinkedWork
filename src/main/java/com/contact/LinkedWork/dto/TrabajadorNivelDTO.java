package com.contact.LinkedWork.dto;

import java.time.LocalDateTime;

public class TrabajadorNivelDTO {
    
    private Integer id;
    private Integer idTrabajador;
    private Integer idNivel;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    
    public TrabajadorNivelDTO() {
    }
    
    public TrabajadorNivelDTO(Integer idTrabajador, Integer idNivel) {
        this.idTrabajador = idTrabajador;
        this.idNivel = idNivel;
    }
    
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public Integer getIdTrabajador() {
        return idTrabajador;
    }
    
    public void setIdTrabajador(Integer idTrabajador) {
        this.idTrabajador = idTrabajador;
    }
    
    public Integer getIdNivel() {
        return idNivel;
    }
    
    public void setIdNivel(Integer idNivel) {
        this.idNivel = idNivel;
    }
    
    public LocalDateTime getFechaInicio() {
        return fechaInicio;
    }
    
    public void setFechaInicio(LocalDateTime fechaInicio) {
        this.fechaInicio = fechaInicio;
    }
    
    public LocalDateTime getFechaFin() {
        return fechaFin;
    }
    
    public void setFechaFin(LocalDateTime fechaFin) {
        this.fechaFin = fechaFin;
    }
}
