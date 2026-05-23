package com.contact.LinkedWork.controller;

import com.contact.LinkedWork.model.ChatMensaje;
import com.contact.LinkedWork.model.Solicitud;
import com.contact.LinkedWork.model.Usuario;
import com.contact.LinkedWork.repository.ChatMensajeRepository;
import com.contact.LinkedWork.repository.SolicitudRepository;
import com.contact.LinkedWork.repository.UsuarioRepository;
import com.contact.LinkedWork.service.NotificacionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    @Qualifier("CrudChatMensajeRepository")
    private ChatMensajeRepository chatMensajeRepository;

    @Autowired
    @Qualifier("CrudSolicitudRepository")
    private SolicitudRepository solicitudRepository;

    @Autowired
    @Qualifier("CrudUsuarioRepository")
    private UsuarioRepository usuarioRepository;

    @Autowired
    @Qualifier("NotificacionService")
    private NotificacionService notificacionService;

    @GetMapping("/chat/solicitud/{idSolicitud}")
    public ResponseEntity<?> getMessages(@PathVariable Long idSolicitud) {
        try {
            List<ChatMensaje> mensajes = chatMensajeRepository.findBySolicitud_idSolicitudOrderByFechaEnvioAsc(idSolicitud);
            return ResponseEntity.ok(mensajes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al obtener los mensajes del chat: " + e.getMessage()));
        }
    }

    @PostMapping("/chat/solicitud/{idSolicitud}")
    public ResponseEntity<?> sendMessage(@PathVariable Long idSolicitud, @RequestBody Map<String, Object> payload) {
        try {
            if (!payload.containsKey("idEmisor"  ) || !payload.containsKey("mensaje")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Faltan datos requeridos (idEmisor o mensaje)"));
            }

            Long idEmisor = Long.valueOf(payload.get("idEmisor").toString());
            String mensajeTexto = payload.get("mensaje").toString().trim();

            if (mensajeTexto.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "El mensaje no puede estar vacío"));
            }

            Optional<Solicitud> solicitudOpt = solicitudRepository.findById(idSolicitud);
            if (solicitudOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Trabajo/Solicitud no encontrado"));
            }

            Optional<Usuario> usuarioOpt = usuarioRepository.findById(idEmisor);
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Usuario emisor no encontrado"));
            }
            Long idUsuarioReceptor;
            idUsuarioReceptor = usuarioOpt.get().getIdUsuario();
            notificacionService.crearNotificacion(
            idUsuarioReceptor,
            "Nuevo mensaje",
            "El trabajador te envió un mensaje",
            "MENSAJE");

            ChatMensaje chatMensaje = new ChatMensaje(solicitudOpt.get(), usuarioOpt.get(), mensajeTexto);
            ChatMensaje guardado = chatMensajeRepository.save(chatMensaje);

            return ResponseEntity.ok(guardado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al enviar el mensaje de chat: " + e.getMessage()));
        }
    }
}
