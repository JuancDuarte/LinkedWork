package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Departamento;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository("CrudDepartamentoRepository")
public interface DepartamentoRepository extends CrudRepository<Departamento, Integer> {
}
