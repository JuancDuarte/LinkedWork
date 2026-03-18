package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Evaluacion;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("CrudEvaluacionRepository")
public interface EvaluacionRepository extends CrudRepository<Evaluacion, Integer> {
    List<Evaluacion> findByTrabajadorIdTrabajador(Integer idTrabajador);
    
    List<Evaluacion> findByEstado(String estado);
    
    List<Evaluacion> findByAdministradorIdUsuario(Integer idAdministrador);
}
