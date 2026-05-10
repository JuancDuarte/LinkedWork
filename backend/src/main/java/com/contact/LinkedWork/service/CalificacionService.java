package com.contact.LinkedWork.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.contact.LinkedWork.dto.CalificacionDTO;
import com.contact.LinkedWork.dto.SolicitudDTO;
import com.contact.LinkedWork.model.Calificacion;
import com.contact.LinkedWork.model.Oferta;
import com.contact.LinkedWork.model.Solicitud;
import com.contact.LinkedWork.model.SolicitudHistorial;
import com.contact.LinkedWork.model.Trabajador;
import com.contact.LinkedWork.model.Usuario;
import com.contact.LinkedWork.repository.CalificacionRepository;
import com.contact.LinkedWork.repository.SolicitudHistorialRepository;
import com.contact.LinkedWork.repository.SolicitudRepository;
import com.contact.LinkedWork.repository.TrabajadorRepository;
import com.contact.LinkedWork.repository.UsuarioRepository;

@Service("CalificacionService")
@Transactional
public class CalificacionService {

    @Autowired
    @Qualifier("CrudCalificacionRepository")
    private CalificacionRepository calificacionRepository;

    @Autowired
    @Qualifier("CrudSolicitudRepository")
    private SolicitudRepository solicitudRepository;

    @Autowired
    @Qualifier("CrudUsuarioRepository")
    private UsuarioRepository usuarioRepository;

    @Autowired
    @Qualifier("CrudTrabajadorRepository")
    private TrabajadorRepository trabajadorRepository;

    @Autowired
    @Qualifier("CrudSolicitudHistorialRepository")
    private SolicitudHistorialRepository solicitudHistorialRepository;

    public void finalizarTrabajo(Long idSolicitud, Long idUsuario) {
        Solicitud solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada."));

        if (!solicitud.getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new RuntimeException("No tienes permiso para finalizar este trabajo.");
        }

        if (!"Aceptada".equalsIgnoreCase(solicitud.getEstado())) {
            throw new RuntimeException("Solo se pueden finalizar trabajos en estado 'Aceptada'.");
        }

        String estadoAnterior = solicitud.getEstado();
        solicitud.setEstado("Finalizada");
        solicitudRepository.save(solicitud);

        SolicitudHistorial historial = new SolicitudHistorial();
        historial.setSolicitud(solicitud);
        historial.setEstadoAnterior(estadoAnterior);
        historial.setEstadoNuevo("Finalizada");
        historial.setFecha(LocalDateTime.now());
        solicitudHistorialRepository.save(historial);
    }

    public void calificarTrabajador(Long idUsuario, Long idSolicitud, Long puntuacion, String comentario) {
        Solicitud solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada."));

        if (!solicitud.getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new RuntimeException("No tienes permiso para calificar este trabajo.");
        }

        if (!"Finalizada".equalsIgnoreCase(solicitud.getEstado())) {
            throw new RuntimeException("Debes finalizar el trabajo antes de calificar.");
        }

        // Buscar al trabajador que aceptó la oferta
        Oferta ofertaAceptada = solicitud.getOfertas().stream()
                .filter(o -> "Aceptada".equalsIgnoreCase(o.getEstado()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No se encontró una oferta aceptada para esta solicitud."));

        Trabajador trabajador = ofertaAceptada.getTrabajador();
        Usuario usuario = solicitud.getUsuario();

        Calificacion calificacion = new Calificacion();
        calificacion.setUsuario(usuario);
        calificacion.setTrabajador(trabajador);
        calificacion.setSolicitud(solicitud);
        calificacion.setPuntuacion(puntuacion);
        calificacion.setComentario(comentario);
        calificacion.setFechaCreacion(LocalDateTime.now());
        calificacionRepository.save(calificacion);

        // Actualizar puntuación del trabajador
        int puntosActuales = trabajador.getPuntuacion() != null ? trabajador.getPuntuacion() : 0;
        trabajador.setPuntuacion(puntosActuales + puntuacion.intValue());
        trabajadorRepository.save(trabajador);
    }

    public List<SolicitudDTO> listarTrabajosActivosUsuario(Long idUsuario) {
        return solicitudRepository.findAllByUsuario_IdUsuario(idUsuario).stream()
                .filter(s -> "Aceptada".equalsIgnoreCase(s.getEstado()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<SolicitudDTO> listarTrabajosActivosTrabajador(Long idUsuarioTrabajador) {
        // Encontrar al trabajador por su ID de usuario
        Trabajador trabajador = trabajadorRepository.findByUsuario_IdUsuario(idUsuarioTrabajador)
                .orElseThrow(() -> new RuntimeException("Perfil de trabajador no encontrado."));

        // Buscar solicitudes donde el trabajador tenga una oferta aceptada
        return java.util.stream.StreamSupport.stream(solicitudRepository.findAll().spliterator(), false)
                .filter(s -> "Aceptada".equalsIgnoreCase(s.getEstado()))
                .filter(s -> s.getOfertas().stream().anyMatch(o -> 
                    "Aceptada".equalsIgnoreCase(o.getEstado()) && 
                    o.getTrabajador().getIdTrabajador().equals(trabajador.getIdTrabajador())))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<CalificacionDTO> listarCalificacionesTrabajador(Long idUsuarioTrabajador) {
        Trabajador trabajador = trabajadorRepository.findByUsuario_IdUsuario(idUsuarioTrabajador)
                .orElseThrow(() -> new RuntimeException("Perfil de trabajador no encontrado."));

        return calificacionRepository.findByTrabajador_IdTrabajador(trabajador.getIdTrabajador()).stream()
                .map(c -> {
                    CalificacionDTO dto = new CalificacionDTO();
                    dto.setIdCalificacion(c.getIdCalificacion().intValue());
                    dto.setIdUsuario(c.getUsuario().getIdUsuario().intValue());
                    dto.setIdTrabajador(c.getTrabajador().getIdTrabajador().intValue());
                    dto.setIdSolicitud(c.getSolicitud().getIdSolicitud().intValue());
                    dto.setPuntuacion(c.getPuntuacion().intValue());
                    dto.setComentario(c.getComentario());
                    dto.setNombreUsuario(c.getUsuario().getNombreCompleto());
                    dto.setFechaCreacion(c.getFechaCreacion());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private SolicitudDTO convertToDTO(Solicitud s) {
        SolicitudDTO dto = new SolicitudDTO();
        dto.setIdSolicitud(s.getIdSolicitud());
        dto.setTitulo(s.getTitulo());
        dto.setDescripcion(s.getDescripcion());
        dto.setEstado(s.getEstado());
        dto.setFechaCreacion(s.getFechaCreacion());
        dto.setIdUsuario(s.getUsuario().getIdUsuario());
        dto.setNombreUsuario(s.getUsuario().getNombreCompleto());
        dto.setIdArea(s.getArea().getIdArea());
        dto.setNombreArea(s.getArea().getNombre());
        
        // Agregar info del trabajador si está aceptada
        s.getOfertas().stream()
            .filter(o -> "Aceptada".equalsIgnoreCase(o.getEstado()))
            .findFirst()
            .ifPresent(o -> {
                dto.setIdTrabajador(o.getTrabajador().getIdTrabajador());
                dto.setNombreTrabajador(o.getTrabajador().getUsuario().getNombreCompleto());
            });
            
        return dto;
    }
}
