package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.TrabajadorNivel;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("CrudTrabajadorNivelRepository")
public interface TrabajadorNivelRepository extends CrudRepository<TrabajadorNivel, Integer> {
    List<TrabajadorNivel> findByTrabajadorIdTrabajador(Integer idTrabajador);
    
    List<TrabajadorNivel> findByNivelIdNivel(Integer idNivel);
}
