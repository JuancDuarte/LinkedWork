package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Ciudad;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository("CrudCiudadRepository")
public interface CiudadRepository extends CrudRepository<Ciudad, Integer> {
    List<Ciudad> findByDepartamento_IdDepartamento(Integer idDepartamento);
}
