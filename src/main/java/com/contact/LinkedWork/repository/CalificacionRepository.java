package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Calificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CalificacionRepository extends JpaRepository<Calificacion, Integer> {
    List<Calificacion> findByUsuarioIdUsuario(Integer idUsuario);
    
    List<Calificacion> findByTrabajadorIdTrabajador(Integer idTrabajador);
    
    List<Calificacion> findBySolicitudIdSolicitud(Integer idSolicitud);
}
