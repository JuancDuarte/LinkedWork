package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Trabajador;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository("CrudTrabajadorRepository")
public interface TrabajadorRepository extends CrudRepository<Trabajador, Long> {
    Optional<Trabajador> findByUsuario_IdUsuario(Long IdUsuario);
    
    List<Trabajador> findByArea_IdArea(Long IdArea);
    
    List<Trabajador> findByEstado(String Estado);
}
