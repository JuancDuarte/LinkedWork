package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Nivel;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository("CrudNivelRepository")
public interface NivelRepository extends CrudRepository<Nivel, Integer> {
    Optional<Nivel> findByNombre(String nombre);
}
