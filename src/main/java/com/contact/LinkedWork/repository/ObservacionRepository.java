package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Observacion;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("CrudObservacionRepository")
public interface ObservacionRepository extends CrudRepository<Observacion, Integer> {
    List<Observacion> findByTrabajadorIdTrabajador(Integer idTrabajador);
    
    List<Observacion> findByAdministradorIdUsuario(Integer idAdministrador);
    
    List<Observacion> findByTipo(String tipo);
}
