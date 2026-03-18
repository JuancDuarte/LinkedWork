package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Certificado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CertificadoRepository extends JpaRepository<Certificado, Integer> {
    List<Certificado> findByTrabajadorIdTrabajador(Integer idTrabajador);
}
