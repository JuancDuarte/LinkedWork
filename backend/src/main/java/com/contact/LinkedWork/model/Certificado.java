package com.contact.LinkedWork.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "Certificado")
public class Certificado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdCertificado")
    private Long idCertificado;

    @ManyToOne(optional = false)
    @JoinColumn(name = "IdTrabajador", nullable = false)
    @JsonIgnore
    private Trabajador trabajador;

    @Column(name = "Nombre", length = 100)
    private String nombre;

    @Column(name = "Entidad", length = 100)
    private String entidad;

    @Column(name = "Descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "Fecha")
    private LocalDateTime fecha;

    @Column(name = "Estado", length = 50)
    private String estado = "Pendiente";

    @Column(name = "PuntosOtorgados")
    private Integer puntosOtorgados = 0;

    public Certificado() {
    }

    public Certificado(Trabajador trabajador, String nombre, String entidad) {
        this.trabajador = trabajador;
        this.nombre = nombre;
        this.entidad = entidad;
    }

    public Long getIdCertificado() {
        return idCertificado;
    }

    public void setIdCertificado(Long idCertificado) {
        this.idCertificado = idCertificado;
    }

    public Trabajador getTrabajador() {
        return trabajador;
    }

    public void setTrabajador(Trabajador trabajador) {
        this.trabajador = trabajador;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getEntidad() {
        return entidad;
    }

    public void setEntidad(String entidad) {
        this.entidad = entidad;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Integer getPuntosOtorgados() {
        return puntosOtorgados;
    }

    public void setPuntosOtorgados(Integer puntosOtorgados) {
        this.puntosOtorgados = puntosOtorgados;
    }
}
