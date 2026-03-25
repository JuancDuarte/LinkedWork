package com.contact.LinkedWork.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.contact.LinkedWork.dto.CrearSolicituDto;
import com.contact.LinkedWork.dto.EditarSolicitudDTO;
import com.contact.LinkedWork.dto.SolicitudDTO;
import com.contact.LinkedWork.model.Area;
import com.contact.LinkedWork.model.Solicitud;
import com.contact.LinkedWork.model.SolicitudHistorial;
import com.contact.LinkedWork.model.Usuario;
import com.contact.LinkedWork.repository.AreaRepository;
import com.contact.LinkedWork.repository.SolicitudRepository;
import com.contact.LinkedWork.repository.UsuarioRepository;

@Service("SolicitudService")
@Transactional
public class SolicitudService {
    @Autowired
    @Qualifier("CrudSolicitudRepository")
    private SolicitudRepository solicitudRepository;

    @Autowired
    @Qualifier("CrudUsuarioRepository")
    private UsuarioRepository usuarioRepository;

    @Autowired
    @Qualifier("CrudAreaRepository")
    private AreaRepository areaRepository;

    public SolicitudDTO AgregarSolicitud(CrearSolicituDto crearSolicitudDto, Long idUsuario, Long idArea) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + idUsuario));
        Area area = areaRepository.findById(idArea)
                .orElseThrow(() -> new RuntimeException("Área no encontrada con ID: " + idArea));    
        Solicitud solicitud = new Solicitud();
        solicitud.setTitulo(crearSolicitudDto.getTitulo());
        solicitud.setDescripcion(crearSolicitudDto.getDescripcion());
        solicitud.setEstado("Pendiente");
        solicitud.setFechaCreacion(LocalDateTime.now());
        solicitud.setUsuario(usuario);
        solicitud.setArea(area);
        SolicitudHistorial historial = new SolicitudHistorial();
        historial.setSolicitud(solicitud);
        solicitudRepository.save(solicitud);
        SolicitudDTO solicitudDTO = new SolicitudDTO();
        solicitudDTO.setIdSolicitud(solicitud.getIdSolicitud());
        solicitudDTO.setTitulo(solicitud.getTitulo());
        solicitudDTO.setDescripcion(solicitud.getDescripcion());
        solicitudDTO.setEstado(solicitud.getEstado());
        solicitudDTO.setFechaCreacion(solicitud.getFechaCreacion());
        solicitudDTO.setIdUsuario(usuario.getIdUsuario());
        solicitudDTO.setNombreUsuario(usuario.getNombreCompleto());
        solicitudDTO.setIdArea(area.getIdArea());
        solicitudDTO.setNombreArea(area.getNombre());
        return solicitudDTO;
    }

    public List<SolicitudDTO> getAllSolicitudes() {
        return ((List<Solicitud>) solicitudRepository.findAll())
                .stream()
                .map(solicitud -> {
                    SolicitudDTO solicitudDTO = new SolicitudDTO();
                    solicitudDTO.setIdSolicitud(solicitud.getIdSolicitud());
                    solicitudDTO.setTitulo(solicitud.getTitulo());
                    solicitudDTO.setDescripcion(solicitud.getDescripcion());
                    solicitudDTO.setEstado(solicitud.getEstado());
                    solicitudDTO.setFechaCreacion(solicitud.getFechaCreacion());
                    solicitudDTO.setIdUsuario(solicitud.getUsuario().getIdUsuario());
                    solicitudDTO.setNombreUsuario(solicitud.getUsuario().getNombreCompleto());
                    solicitudDTO.setIdArea(solicitud.getArea().getIdArea());
                    solicitudDTO.setNombreArea(solicitud.getArea().getNombre());
                    return solicitudDTO;
                })
                .toList();
        
    }
    
    public void deleteSolicitudByUsuarioId(Long idSolicitud, Long idUsuario) {
        Optional<Solicitud> solicitudExistente = solicitudRepository.findById(idSolicitud);
        if (solicitudExistente.isPresent()) {
            Solicitud solicitud = solicitudExistente.get();
            if (solicitud.getUsuario().getIdUsuario().equals(idUsuario)) {
                solicitudRepository.deleteById(idSolicitud);
            } else {
                throw new RuntimeException("El usuario no tiene permiso para eliminar esta solicitud.");
            }
        } else {
            throw new RuntimeException("Solicitud no encontrada con ID: " + idSolicitud);
        }
    }
    public SolicitudDTO editarSolicitud(EditarSolicitudDTO editarSolicitudDTO, Long idSolicitud, Long idUsuario) {
        Solicitud solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada con ID: " + idSolicitud));
        if (!solicitud.getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new RuntimeException("El usuario no tiene permiso para editar esta solicitud.");
        }
        solicitud.setTitulo(editarSolicitudDTO.getTitulo());
        solicitud.setDescripcion(editarSolicitudDTO.getDescripcion());
        Solicitud solicitudActualizada = solicitudRepository.save(solicitud);
        SolicitudDTO solicitudDTO = new SolicitudDTO();
        solicitudDTO.setIdSolicitud(solicitudActualizada.getIdSolicitud());
        solicitudDTO.setTitulo(solicitudActualizada.getTitulo());
        solicitudDTO.setDescripcion(solicitudActualizada.getDescripcion());
        solicitudDTO.setEstado(solicitudActualizada.getEstado());
        solicitudDTO.setFechaCreacion(solicitudActualizada.getFechaCreacion());
        solicitudDTO.setIdUsuario(solicitudActualizada.getUsuario().getIdUsuario());
        solicitudDTO.setNombreUsuario(solicitudActualizada.getUsuario().getNombreCompleto());
        solicitudDTO.setIdArea(solicitudActualizada.getArea().getIdArea());
        solicitudDTO.setNombreArea(solicitudActualizada.getArea().getNombre());
        return solicitudDTO;
    }
    public void eliminarSolicitud(Long idSolicitud, Long idUsuario) {
        Optional<Solicitud> solicitudExistente = solicitudRepository.findById(idSolicitud);
        if (!solicitudExistente.get().getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new RuntimeException("El usuario no tiene permiso para eliminar esta solicitud.");
        }
    Solicitud solicitud = solicitudExistente.get();
    Area area = solicitud.getArea();
    area.getSolicitudes().remove(solicitud);
    solicitudRepository.deleteById(idSolicitud);
    }
}