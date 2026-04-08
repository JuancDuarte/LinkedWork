package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Calificacion;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("CrudCalificacionRepository")
public interface CalificacionRepository extends CrudRepository<Calificacion, Long> {
    List<Calificacion> findByUsuario_IdUsuario(Long IdUsuario);
    
    List<Calificacion> findByTrabajador_IdTrabajador(Long IdTrabajador);
    
    List<Calificacion> findBySolicitud_IdSolicitud(Long IdSolicitud);
}
