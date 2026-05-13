package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Certificado;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("CrudCertificadoRepository")
public interface CertificadoRepository extends CrudRepository<Certificado, Long> {
    List<Certificado> findByTrabajador_IdTrabajador(Long IdTrabajador);
}
