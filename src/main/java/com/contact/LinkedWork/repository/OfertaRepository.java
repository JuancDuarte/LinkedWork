package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Oferta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OfertaRepository extends JpaRepository<Oferta, Integer> {
    List<Oferta> findBySolicitudIdSolicitud(Integer idSolicitud);
    
    List<Oferta> findByTrabajadorIdTrabajador(Integer idTrabajador);
    
    List<Oferta> findByEstado(String estado);
}
