package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.OfertaHistorial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OfertaHistorialRepository extends JpaRepository<OfertaHistorial, Integer> {
    List<OfertaHistorial> findByOfertaIdOferta(Integer idOferta);
}
