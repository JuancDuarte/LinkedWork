package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Observacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ObservacionRepository extends JpaRepository<Observacion, Integer> {
    List<Observacion> findByTrabajadorIdTrabajador(Integer idTrabajador);
    
    List<Observacion> findByAdministradorIdUsuario(Integer idAdministrador);
    
    List<Observacion> findByTipo(String tipo);
}
