package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Oferta;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("CrudOfertaRepository")
public interface OfertaRepository extends CrudRepository<Oferta, Integer> {
    List<Oferta> findBySolicitudIdSolicitud(Integer idSolicitud);
    
    List<Oferta> findByTrabajadorIdTrabajador(Integer idTrabajador);
    
    List<Oferta> findByEstado(String estado);
}
