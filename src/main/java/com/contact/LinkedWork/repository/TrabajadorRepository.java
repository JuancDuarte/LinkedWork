package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Trabajador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrabajadorRepository extends JpaRepository<Trabajador, Integer> {
    Optional<Trabajador> findByUsuarioIdUsuario(Integer idUsuario);
    
    List<Trabajador> findByAreaIdArea(Integer idArea);
    
    List<Trabajador> findByEstado(String estado);
}
