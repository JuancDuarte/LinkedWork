package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.SolicitudHistorial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitudHistorialRepository extends JpaRepository<SolicitudHistorial, Integer> {
    List<SolicitudHistorial> findBySolicitudIdSolicitud(Integer idSolicitud);
}
