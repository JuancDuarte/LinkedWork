package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Calificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CalificacionRepository extends JpaRepository<Calificacion, Long> {
    List<Calificacion> findByUsuarioId(Long usuarioId);
    List<Calificacion> findByTrabajadorId(Long trabajadorId);
}
