package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.OfertaHistorial;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("CrudOfertaHistorialRepository")
public interface OfertaHistorialRepository extends CrudRepository<OfertaHistorial, Integer> {
    List<OfertaHistorial> findByOfertaIdOferta(Integer IdOferta);
}
