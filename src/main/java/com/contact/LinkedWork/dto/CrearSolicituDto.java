package com.contact.LinkedWork.dto;

public class CrearSolicituDto {
    private String titulo;
    private String descripcion;
    private Long idUsuario;
    private Long idArea;

    public CrearSolicituDto() {
    }

    public CrearSolicituDto(String titulo, String descripcion, Long idUsuario, Long idArea) {
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.idUsuario = idUsuario;
        this.idArea = idArea;
    }
    public String getTitulo() {
        return titulo;
    }
    public String getDescripcion() {
        return descripcion;
    }
    public Long getIdUsuario() {
        return idUsuario;
    }
    public Long getIdArea() {
        return idArea;
    }
    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }
    public void setIdArea(Long idArea) {
        this.idArea = idArea;
    }

}
