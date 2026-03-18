package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Solicitud;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("CrudSolicitudRepository")
public interface SolicitudRepository extends CrudRepository<Solicitud, Integer> {
    List<Solicitud> findByUsuarioIdUsuario(Integer idUsuario);
    
    List<Solicitud> findByAreaIdArea(Integer idArea);
    
    List<Solicitud> findByEstado(String estado);
}
