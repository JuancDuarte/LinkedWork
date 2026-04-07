package com.contact.LinkedWork.dto;

import java.time.LocalDateTime;

public class EvaluacionDTO {
    
    private Integer idEvaluacion;
    private Integer idTrabajador;
    private Integer idAdministrador;
    private String resultado;
    private String estado;
    private LocalDateTime fecha;
    
    public EvaluacionDTO() {
    }
    
    public EvaluacionDTO(Integer idTrabajador) {
        this.idTrabajador = idTrabajador;
    }
    
    public Integer getIdEvaluacion() {
        return idEvaluacion;
    }
    
    public void setIdEvaluacion(Integer idEvaluacion) {
        this.idEvaluacion = idEvaluacion;
    }
    
    public Integer getIdTrabajador() {
        return idTrabajador;
    }
    
    public void setIdTrabajador(Integer idTrabajador) {
        this.idTrabajador = idTrabajador;
    }
    
    public Integer getIdAdministrador() {
        return idAdministrador;
    }
    
    public void setIdAdministrador(Integer idAdministrador) {
        this.idAdministrador = idAdministrador;
    }
    
    public String getResultado() {
        return resultado;
    }
    
    public void setResultado(String resultado) {
        this.resultado = resultado;
    }
    
    public String getEstado() {
        return estado;
    }
    
    public void setEstado(String estado) {
        this.estado = estado;
    }
    
    public LocalDateTime getFecha() {
        return fecha;
    }
    
    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
}
