package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Oferta;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("CrudOfertaRepository")
public interface OfertaRepository extends CrudRepository<Oferta, Long> {
    List<Oferta> findBySolicitud_IdSolicitud(Long IdSolicitud);
    
    List<Oferta> findByTrabajador_IdTrabajador(Long IdTrabajador);
    
    List<Oferta> findByEstado(String Estado);
}
