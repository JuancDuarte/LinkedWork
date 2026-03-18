package com.contact.LinkedWork.service;

import com.contact.LinkedWork.dto.LoginRequestDTO;
import com.contact.LinkedWork.dto.UsuarioDTO;
import com.contact.LinkedWork.model.Rol;
import com.contact.LinkedWork.model.Usuario;
import com.contact.LinkedWork.repository.RolRepository;
import com.contact.LinkedWork.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    public UsuarioDTO createUser(UsuarioDTO usuarioDTO) {
        if (usuarioDTO.getEmail() == null || usuarioDTO.getEmail().isBlank()) {
            throw new IllegalArgumentException("El email es obligatorio");
        }
        if (usuarioDTO.getPassword() == null || usuarioDTO.getPassword().isBlank()) {
            throw new IllegalArgumentException("La contraseña es obligatoria");
        }

        if (usuarioRepository.existsByEmail(usuarioDTO.getEmail())) {
            throw new IllegalArgumentException("Ya existe un usuario con ese email");
        }

        Integer roleId = usuarioDTO.getIdRol() != null ? usuarioDTO.getIdRol() : 1;
        Rol rol = rolRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado"));

        Usuario usuario = new Usuario();
        usuario.addRol(rol);
        usuario.setNombre(usuarioDTO.getNombre());
        usuario.setEmail(usuarioDTO.getEmail());
        usuario.setNombreUsuario(usuarioDTO.getNombreUsuario() != null && !usuarioDTO.getNombreUsuario().isBlank()
            ? usuarioDTO.getNombreUsuario()
            : usuarioDTO.getEmail());
        usuario.setPassword(usuarioDTO.getPassword());
        usuario.setEstado(usuarioDTO.getEstado() != null ? usuarioDTO.getEstado() : "activo");

        Usuario saved = usuarioRepository.save(usuario);
        return toDTO(saved);
    }

    public Optional<UsuarioDTO> login(LoginRequestDTO loginRequestDTO) {
        if (loginRequestDTO.getPassword() == null || loginRequestDTO.getPassword().isBlank()) {
            return Optional.empty();
        }

        Optional<Usuario> usuarioOptional;
        if (loginRequestDTO.getIdUsuario() != null) {
            usuarioOptional = usuarioRepository.findById(loginRequestDTO.getIdUsuario());
        } else if (loginRequestDTO.getEmail() != null && !loginRequestDTO.getEmail().isBlank()) {
            usuarioOptional = usuarioRepository.findByEmail(loginRequestDTO.getEmail());
        } else {
            return Optional.empty();
        }

        return usuarioOptional
                .filter(usuario -> loginRequestDTO.getPassword().equals(usuario.getPassword()))
                .map(this::toDTO);
    }

    public Optional<UsuarioDTO> getProfile(Long id) {
        return usuarioRepository.findById(id).map(this::toDTO);
    }

    public Optional<UsuarioDTO> updateProfile(Long id, UsuarioDTO usuarioDTO) {
        return usuarioRepository.findById(id).map(usuario -> {
            if (usuarioDTO.getNombre() != null) {
                usuario.setNombre(usuarioDTO.getNombre());
            }
            if (usuarioDTO.getEmail() != null && !usuarioDTO.getEmail().isBlank()) {
                usuario.setEmail(usuarioDTO.getEmail());
            }
            if (usuarioDTO.getPassword() != null && !usuarioDTO.getPassword().isBlank()) {
                usuario.setPassword(usuarioDTO.getPassword());
            }
            if (usuarioDTO.getEstado() != null && !usuarioDTO.getEstado().isBlank()) {
                usuario.setEstado(usuarioDTO.getEstado());
            }
            Usuario updated = usuarioRepository.save(usuario);
            return toDTO(updated);
        });
    }

    private UsuarioDTO toDTO(Usuario usuario) {
        UsuarioDTO dto = new UsuarioDTO();
        dto.setIdUsuario(usuario.getId());
        dto.setIdRol(resolveMainRoleId(usuario.getRoles()));
        dto.setNombre(usuario.getNombre());
        dto.setEmail(usuario.getEmail());
        dto.setEstado(usuario.getEstado());
        dto.setFechaCreacion(usuario.getCreatedAt());
        dto.setNombreUsuario(usuario.getNombreUsuario());
        dto.setIntentosFallidos(usuario.getIntentosFallidos());
        dto.setBloqueado(usuario.getBloqueado());
        dto.setUltimoAcceso(usuario.getUltimoAcceso());
        dto.setPassword(null);
        return dto;
    }

    private Integer resolveMainRoleId(Set<Rol> roles) {
        if (roles == null || roles.isEmpty()) {
            return null;
        }
        return roles.iterator().next().getIdRol();
    }
}
