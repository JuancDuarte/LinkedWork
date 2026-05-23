package com.contact.LinkedWork.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.contact.LinkedWork.model.Notificacion;

@Repository("CrudNotificacionRepository")
public interface NotificacionRepository extends CrudRepository<Notificacion, Long> {
    List<Notificacion> findByUsuario_IdUsuario(Long idUsuario);
    Long countByUsuarioIdUsuarioAndLeidaFalse(Long idUsuario);
    List<Notificacion> findByUsuarioIdUsuarioAndLeidaFalseOrderByFechaDesc(Long idUsuario);


}
