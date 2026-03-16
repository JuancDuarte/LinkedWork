package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Oferta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OfertaRepository extends JpaRepository<Oferta, Long> {
    List<Oferta> findBySolicitudId(Long solicitudId);
    List<Oferta> findByTrabajadorId(Long trabajadorId);
}
