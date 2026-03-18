package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.TrabajadorNivel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrabajadorNivelRepository extends JpaRepository<TrabajadorNivel, Integer> {
    List<TrabajadorNivel> findByTrabajadorIdTrabajador(Integer idTrabajador);
    
    List<TrabajadorNivel> findByNivelIdNivel(Integer idNivel);
}
