package com.contact.LinkedWork.service;

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

    public Solicitud AgregarSolicitud(Long id, Solicitud solicitud, Long idArea) {
        Optional<Usuario> UsuarioExistente = usuarioRepository.findById(id);
        if (UsuarioExistente.isPresent()) {
            Usuario usuario = UsuarioExistente.get();
            solicitud.setUsuario(usuario);
        } else {
            throw new RuntimeException("Usuario no encontrado con ID: " + id);
        }
        Optional<Area> AreaExistente = areaRepository.findById(idArea);
        if (AreaExistente.isPresent()) {
            Area area = AreaExistente.get();
            solicitud.setArea(area);
        } else {
            throw new RuntimeException("Area no encontrada con ID: " + idArea);
        }   
        
        return solicitudRepository.save(solicitud);
    }

}
