package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.ChatMensaje;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("CrudChatMensajeRepository")
public interface ChatMensajeRepository extends CrudRepository<ChatMensaje, Long> {
    List<ChatMensaje> findBySolicitud_idSolicitudOrderByFechaEnvioAsc(Long idSolicitud);
}
