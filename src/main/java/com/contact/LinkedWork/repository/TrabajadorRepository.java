package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Trabajador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TrabajadorRepository extends JpaRepository<Trabajador, Long> {
    Optional<Trabajador> findByUsuarioId(Long usuarioId);
}
