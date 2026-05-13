package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Nivel;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository("CrudNivelRepository")
public interface NivelRepository extends CrudRepository<Nivel, Long> {
    Optional<Nivel> findByNombre(String Nombre);
}
