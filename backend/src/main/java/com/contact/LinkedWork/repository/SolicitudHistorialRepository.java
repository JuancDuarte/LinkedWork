package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.SolicitudHistorial;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("CrudSolicitudHistorialRepository")
public interface SolicitudHistorialRepository extends CrudRepository<SolicitudHistorial, Long> {
    List<SolicitudHistorial> findBySolicitud_IdSolicitud(Long IdSolicitud);
}
