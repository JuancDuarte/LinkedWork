package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Area;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository("CrudAreaRepository")
public interface AreaRepository extends CrudRepository<Area, Long> {
    Optional<Area> findByNombre(String Nombre);
    Optional<Area> findById(Long IdArea); 
}
