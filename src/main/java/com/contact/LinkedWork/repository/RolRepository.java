package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Rol;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository("CrudRolRepository")
public interface RolRepository extends CrudRepository<Rol, Integer> {
    Optional<Rol> findByNombre(String nombre);
}
