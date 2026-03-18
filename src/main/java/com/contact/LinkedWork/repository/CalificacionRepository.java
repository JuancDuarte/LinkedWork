package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Calificacion;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("CrudCalificacionRepository")
public interface CalificacionRepository extends CrudRepository<Calificacion, Integer> {
    List<Calificacion> findByUsuarioIdUsuario(Integer idUsuario);
    
    List<Calificacion> findByTrabajadorIdTrabajador(Integer idTrabajador);
    
    List<Calificacion> findBySolicitudIdSolicitud(Integer idSolicitud);
}
