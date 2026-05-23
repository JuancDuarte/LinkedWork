package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Pago;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository("CrudPagoRepository")
public interface PagoRepository extends CrudRepository<Pago, Long> {
    Optional<Pago> findByReferenciaPago(String referenciaPago);
    List<Pago> findByUsuario_IdUsuario(Long idUsuario);
    List<Pago> findBySolicitud_IdSolicitud(Long idSolicitud);
    Optional<Pago> findFirstBySolicitud_IdSolicitudAndOferta_IdOfertaAndEstadoPago(
            Long idSolicitud, Long idOferta, String estadoPago);
}
