package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Solicitud;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository("CrudSolicitudRepository")
public interface SolicitudRepository extends CrudRepository<Solicitud, Long> {
    Optional<Solicitud> findByUsuario_IdUsuario(Long IdUsuario);
    
    List<Solicitud> findByArea_IdArea(Long IdArea);
    
    List<Solicitud> findByEstado(String Estado);
}
