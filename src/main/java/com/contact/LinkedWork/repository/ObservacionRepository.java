package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Observacion;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("CrudObservacionRepository")
public interface ObservacionRepository extends CrudRepository<Observacion, Long> {
    List<Observacion> findByTrabajador_IdTrabajador(Long IdTrabajador);
    
    List<Observacion> findByTipo(String Tipo);
}
