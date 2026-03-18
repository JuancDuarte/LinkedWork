package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Sancion;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("CrudSancionRepository")
public interface SancionRepository extends CrudRepository<Sancion, Long> {
    List<Sancion> findByUsuarioId(Long usuarioId);
}
