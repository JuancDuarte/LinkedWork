package com.contact.LinkedWork.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.contact.LinkedWork.dto.ListarTrabajadorDTO;
import com.contact.LinkedWork.dto.LoginDTO;
import com.contact.LinkedWork.dto.TrabajadorDTO;
import com.contact.LinkedWork.dto.UsuarioDTO;
import com.contact.LinkedWork.model.Usuario;
import com.contact.LinkedWork.model.Rol;
import com.contact.LinkedWork.model.Trabajador;
import com.contact.LinkedWork.repository.TrabajadorRepository;
import com.contact.LinkedWork.repository.UsuarioRepository;

@Service("UsuarioService")
@Transactional
public class UsuarioService {
    @Autowired
    @Qualifier("CrudUsuarioRepository")
    private UsuarioRepository usuarioRepository;

    @Autowired
    @Qualifier("CrudTrabajadorRepository")
    private TrabajadorRepository trabajadorRepository;

    public List<UsuarioDTO> getAllUsuarios() {
        return ((List<Usuario>) usuarioRepository.findAll())
                .stream()
                .map(usuario -> {
                    UsuarioDTO usuarioDTO = new UsuarioDTO();
                    usuarioDTO.setIdUsuario(usuario.getIdUsuario());
                    usuarioDTO.setNombreCompleto(usuario.getNombreCompleto());
                    usuarioDTO.setEmail(usuario.getEmail());
                    usuarioDTO.setNombreUsuario(usuario.getNombreUsuario());
                    usuarioDTO.setEstado(usuario.getEstado());
                    List<String> roles = usuario.getRoles()
                            .stream()
                            .map(Rol::getNombre)
                            .toList();
                    usuarioDTO.setRoles(roles);
                    return usuarioDTO;
                })
                .toList();
    }


    public UsuarioDTO SeeProfile(Long idUsuario) {
        Usuario usuario = usuarioRepository.findByidUsuario(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + idUsuario));
        
        UsuarioDTO usuarioDTO = new UsuarioDTO();
        usuarioDTO.setIdUsuario(usuario.getIdUsuario());
        usuarioDTO.setNombreCompleto(usuario.getNombreCompleto());
        usuarioDTO.setEmail(usuario.getEmail());
        usuarioDTO.setNombreUsuario(usuario.getNombreUsuario());
        usuarioDTO.setEstado(usuario.getEstado());
        List<String> roles = usuario.getRoles()
                .stream()
                .map(Rol::getNombre)
                .toList();
        usuarioDTO.setRoles(roles);
        boolean esTrabajador = roles.contains("ROLE_TRABAJADOR ");
        if (esTrabajador) {
            TrabajadorDTO trabajadorDTO = new TrabajadorDTO();
            Trabajador trabajador = new Trabajador();
            if (trabajador.getArea() != null) {
                trabajadorDTO.setAreaNombre(trabajador.getArea().getNombre());
            }
            usuarioDTO.setTrabajador(trabajadorDTO);

            }
        return usuarioDTO;
    } 
    public List<ListarTrabajadorDTO> listarTrabajadores(){
        return ((List<Trabajador>) trabajadorRepository.findAll())
                .stream()
                .map(trabajador -> {
                    ListarTrabajadorDTO trabajadorDTO = new ListarTrabajadorDTO();
                    trabajadorDTO.setIdTrabajador(trabajador.getIdTrabajador());
                    trabajadorDTO.setNombreUsusario(trabajador.getUsuario().getNombreUsuario());
                    if (trabajador.getArea() != null) {
                        trabajadorDTO.setNombreArea(trabajador.getArea().getNombre());
                    }
                    trabajadorDTO.setExperiencia(trabajador.getExperiencia());
                    Long nivel = trabajador.getCalificaciones()
                            .stream()
                            .mapToLong(calificacion -> calificacion.getPuntuacion())
                            .sum(); 
                    trabajadorDTO.setPuntajeTotal(nivel);
                    return trabajadorDTO;
                })
                .toList();
    }

    public UsuarioDTO login(LoginDTO loginDTO) {
        if (loginDTO.getClave() == null || loginDTO.getClave().isBlank()) {
            throw new RuntimeException("La clave es obligatoria");
        }

        Optional<Usuario> usuarioEncontrado;
        if (loginDTO.getIdUsuario() != null) {
            usuarioEncontrado = usuarioRepository.findByidUsuario(loginDTO.getIdUsuario());
        } else if (loginDTO.getNombreUsuario() != null && !loginDTO.getNombreUsuario().isBlank()) {
            usuarioEncontrado = usuarioRepository.findByNombreUsuario(loginDTO.getNombreUsuario());
        } else if (loginDTO.getEmail() != null && !loginDTO.getEmail().isBlank()) {
            usuarioEncontrado = usuarioRepository.findByEmail(loginDTO.getEmail());
        } else {
            throw new RuntimeException("Debes enviar idUsuario, nombreUsuario o email");
        }

        Usuario usuario = usuarioEncontrado.orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (Boolean.TRUE.equals(usuario.getBloqueado())) {
            throw new RuntimeException("Usuario bloqueado, contacta al administrador");
        }

        if (!loginDTO.getClave().equals(usuario.getClaveHash())) {
            int intentos = usuario.getIntentosFallidos() == null ? 1 : usuario.getIntentosFallidos() + 1;
            usuario.setIntentosFallidos(intentos);
            if (intentos >= 3) {
                usuario.setBloqueado(true);
            }
            usuarioRepository.save(usuario);
            throw new RuntimeException("Credenciales inválidas");
        }

        usuario.setIntentosFallidos(0);
        usuario.setBloqueado(false);
        usuario.setUltimoAcceso(LocalDateTime.now());
        usuarioRepository.save(usuario);

        UsuarioDTO usuarioDTO = new UsuarioDTO();
        usuarioDTO.setIdUsuario(usuario.getIdUsuario());
        usuarioDTO.setNombreCompleto(usuario.getNombreCompleto());
        usuarioDTO.setEmail(usuario.getEmail());
        usuarioDTO.setNombreUsuario(usuario.getNombreUsuario());
        usuarioDTO.setEstado(usuario.getEstado());
        List<String> roles = usuario.getRoles()
                .stream()
                .map(Rol::getNombre)
                .toList();
        usuarioDTO.setRoles(roles);
        return usuarioDTO;
    }
}
