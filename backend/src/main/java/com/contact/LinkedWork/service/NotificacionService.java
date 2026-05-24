package com.contact.LinkedWork.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.contact.LinkedWork.dto.NotificacionDTO;
import com.contact.LinkedWork.model.Notificacion;
import com.contact.LinkedWork.model.Usuario;
import com.contact.LinkedWork.repository.NotificacionRepository;
import com.contact.LinkedWork.repository.UsuarioRepository;

@Service("NotificacionService")
@Transactional
public class NotificacionService {
 @Autowired
    private NotificacionRepository notificacionRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public NotificacionDTO crearNotificacion(Long idUsuario, String titulo, String mensaje, String tipo) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Notificacion notificacion = new Notificacion();
        notificacion.setUsuario(usuario);
        notificacion.setTitulo(titulo);
        notificacion.setMensaje(mensaje);
        notificacion.setTipo(tipo);
        notificacion.setLeida(false);
        Notificacion saved = notificacionRepository.save(notificacion);
        return convertirDTO(saved);
    }
     public List<NotificacionDTO> obtenerNotificaciones(Long idUsuario) {
        return notificacionRepository
                .findByUsuario_IdUsuario(idUsuario)
                .stream()
                .map(this::convertirDTO)
                .toList();
    }

    public List<NotificacionDTO> obtenerNoLeidas(Long idUsuario) {
        return notificacionRepository
                .findByUsuarioIdUsuarioAndLeidaFalseOrderByFechaDesc(idUsuario)
                .stream()
                .map(this::convertirDTO)
                .toList();
    }
     public Long contarNoLeidas(Long idUsuario) {
        return notificacionRepository
                .countByUsuarioIdUsuarioAndLeidaFalse(idUsuario);
    }

    public void marcarComoLeida(Long idNotificacion) {
        Notificacion notificacion = notificacionRepository.findById(idNotificacion)
                .orElseThrow(() -> new RuntimeException("Notificación no encontrada"));
        notificacion.setLeida(true);
        notificacionRepository.save(notificacion);
    }
        public void marcarTodasComoLeidas(Long idUsuario) {
        List<Notificacion> lista = notificacionRepository
                .findByUsuarioIdUsuarioAndLeidaFalseOrderByFechaDesc(idUsuario);
        for (Notificacion n : lista) {
            n.setLeida(true);
        }
        notificacionRepository.saveAll(lista);
    }
        private NotificacionDTO convertirDTO(Notificacion n) {
        return new NotificacionDTO(
                n.getIdNotificacion(),
                n.getTitulo(),
                n.getMensaje(),
                n.getTipo(),
                n.getLeida(),
                n.getFecha()
        );
    }
}
