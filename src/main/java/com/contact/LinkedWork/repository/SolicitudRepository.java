package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitudRepository extends JpaRepository<Solicitud, Integer> {
    List<Solicitud> findByUsuarioIdUsuario(Integer idUsuario);
    
    List<Solicitud> findByAreaIdArea(Integer idArea);
    
    List<Solicitud> findByEstado(String estado);
}
