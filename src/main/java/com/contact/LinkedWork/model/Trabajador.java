package com.contact.LinkedWork.model;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "Trabajador")
public class Trabajador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdTrabajador")
    private Long IdTrabajador;

    @ManyToOne(optional = false)
    @JoinColumn(name = "IdUsuario", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "IdArea")
    private Area area;

    @Column(columnDefinition = "TEXT")
    private String Descripcion;

    @Column
    private Long Experiencia;

    @Column(length = 50)
    private String Estado = "activo";

    @OneToMany(mappedBy = "trabajador", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TrabajadorNivel> trabajadorNiveles = new HashSet<>();

    @OneToMany(mappedBy = "trabajador", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Oferta> ofertas = new HashSet<>();

    @OneToMany(mappedBy = "trabajador", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Calificacion> calificaciones = new HashSet<>();

    @OneToMany(mappedBy = "trabajador", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Evaluacion> evaluaciones = new HashSet<>();

    @OneToMany(mappedBy = "trabajador", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Certificado> certificados = new HashSet<>();

    @OneToMany(mappedBy = "trabajador", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Observacion> observaciones = new HashSet<>();

    public Trabajador() {
    }

    public Trabajador(Usuario usuario) {
        this.usuario = usuario;
    }

    public Trabajador(Usuario usuario, Area area) {
        this.usuario = usuario;
        this.area = area;
    }

    public Long getIdTrabajador() {
        return IdTrabajador;
    }

    public void setIdTrabajador(Long idTrabajador) {
        this.IdTrabajador = idTrabajador;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Area getArea() {
        return area;
    }

    public void setArea(Area area) {
        this.area = area;
    }

    public String getDescripcion() {
        return Descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.Descripcion = descripcion;
    }

    public Long getExperiencia() {
        return Experiencia;
    }

    public void setExperiencia(Long experiencia) {
        this.Experiencia = experiencia;
    }

    public String getEstado() {
        return Estado;
    }

    public void setEstado(String estado) {
        this.Estado = estado;
    }

    public Set<TrabajadorNivel> getTrabajadorNiveles() {
        return trabajadorNiveles;
    }

    public void setTrabajadorNiveles(Set<TrabajadorNivel> trabajadorNiveles) {
        this.trabajadorNiveles = trabajadorNiveles;
    }

    public Set<Oferta> getOfertas() {
        return ofertas;
    }

    public void setOfertas(Set<Oferta> ofertas) {
        this.ofertas = ofertas;
    }

    public Set<Calificacion> getCalificaciones() {
        return calificaciones;
    }

    public void setCalificaciones(Set<Calificacion> calificaciones) {
        this.calificaciones = calificaciones;
    }

    public Set<Evaluacion> getEvaluaciones() {
        return evaluaciones;
    }

    public void setEvaluaciones(Set<Evaluacion> evaluaciones) {
        this.evaluaciones = evaluaciones;
    }

    public Set<Certificado> getCertificados() {
        return certificados;
    }

    public void setCertificados(Set<Certificado> certificados) {
        this.certificados = certificados;
    }

    public Set<Observacion> getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(Set<Observacion> observaciones) {
        this.observaciones = observaciones;
    }
}
