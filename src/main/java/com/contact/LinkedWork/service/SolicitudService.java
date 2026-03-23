package com.contact.LinkedWork.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.contact.LinkedWork.model.Area;
import com.contact.LinkedWork.model.Solicitud;
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

    public Solicitud AgregarSolicitud(Long IdUsuario, Solicitud solicitud, Long IdArea) {
        Optional<Usuario> UsuarioExistente = usuarioRepository.findByidUsuario(IdUsuario);
        if (UsuarioExistente.isPresent()) {
            Usuario usuario = UsuarioExistente.get();
            solicitud.setUsuario(usuario);
        } else {
            throw new RuntimeException("Usuario no encontrado con ID: " + IdUsuario);
        }
        Optional<Area> AreaExistente = areaRepository.findById(IdArea);
        if (AreaExistente.isPresent()) {
            Area area = AreaExistente.get();
            solicitud.setArea(area);
        } else {
            throw new RuntimeException("Area no encontrada con ID: " + IdArea);
        }   
        
        return solicitudRepository.save(solicitud);
    }

    public List<Solicitud> getAllSolicitudes() {
        return (List<Solicitud>) solicitudRepository.findAll();
    }

}
