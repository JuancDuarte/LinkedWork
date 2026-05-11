package com.contact.LinkedWork.model;

import jakarta.persistence.*;
import java.util.Set;

@Entity
@Table(name = "Departamento")
public class Departamento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdDepartamento")
    private Integer idDepartamento;

    @Column(name = "Nombre", nullable = false, length = 100)
    private String nombre;

    @OneToMany(mappedBy = "departamento")
    private Set<Ciudad> ciudades;

    public Departamento() {}

    public Integer getIdDepartamento() {
        return idDepartamento;
    }

    public void setIdDepartamento(Integer idDepartamento) {
        this.idDepartamento = idDepartamento;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}
