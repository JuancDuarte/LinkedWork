package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Evaluacion;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("CrudEvaluacionRepository")
public interface EvaluacionRepository extends CrudRepository<Evaluacion, Long> {
    List<Evaluacion> findByTrabajador_IdTrabajador(Long IdTrabajador);
    
    List<Evaluacion> findByEstado(String Estado);

}
