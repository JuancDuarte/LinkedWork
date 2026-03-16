package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Evaluacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluacionRepository extends JpaRepository<Evaluacion, Long> {
    List<Evaluacion> findByTrabajadorId(Long trabajadorId);
}
