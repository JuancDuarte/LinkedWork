package com.contact.LinkedWork.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "Usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdUsuario")
    private Long idUsuario;

    @ManyToMany
    @JoinTable(
    name = "Usuario_Rol",
    joinColumns = @JoinColumn(name = "IdUsuario"),
    inverseJoinColumns = @JoinColumn(name = "IdRol")
    )   
    private List<Rol> roles;

    @Column( name = "NombreUsuario", length = 50, unique = true)
    private String nombreUsuario;

    @Column(name = "NombreCompleto", length = 100)
    private String nombreCompleto;

    @Column(name = "Email", length = 100, unique = true)
    private String email;

    @Column(name = "ClaveHash", length = 255)
    private String claveHash;

    @Column(name = "Estado", length = 50)
    private String estado = "activo";

    @Column(columnDefinition = "INT DEFAULT 0")
    private Integer intentosFallidos = 0;

    @Column(columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean bloqueado = false;

    @Column(name = "UltimoAcceso")
    private LocalDateTime ultimoAcceso;

    @Column(name = "FechaCreacion", nullable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    public Usuario() {
    }

    public Usuario(List<Rol> roles, String nombre, String email, String password) {
        this.roles = roles;
        this.nombreCompleto = nombre;
        this.email = email;
        this.claveHash = password;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public List<Rol> getRoles() {
        return roles;
    }       
    public void setRoles(List<Rol> roles) {
        this.roles = roles;
    }   

    public String getNombreUsuario() {
        return nombreUsuario;
    }

    public void setNombreUsuario(String nombreUsuario) {
        this.nombreUsuario = nombreUsuario;
    }

    public String getNombreCompleto() { 
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getClaveHash() {
        return claveHash;
    }

    public void setClaveHash(String claveHash) {
        this.claveHash = claveHash;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Integer getIntentosFallidos() {
        return intentosFallidos;
    }

    public void setIntentosFallidos(Integer intentosFallidos) {
        this.intentosFallidos = intentosFallidos;
    }

    public Boolean getBloqueado() {
        return bloqueado;
    }

    public void setBloqueado(Boolean bloqueado) {
        this.bloqueado = bloqueado;
    }

    public LocalDateTime getUltimoAcceso() {
        return ultimoAcceso;
    }

    public void setUltimoAcceso(LocalDateTime ultimoAcceso) {
        this.ultimoAcceso = ultimoAcceso;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}
