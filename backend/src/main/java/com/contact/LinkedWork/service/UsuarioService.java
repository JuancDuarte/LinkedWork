package com.contact.LinkedWork.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
import com.contact.LinkedWork.model.Area;
import com.contact.LinkedWork.model.Usuario;
import com.contact.LinkedWork.model.Rol;
import com.contact.LinkedWork.model.Trabajador;
import com.contact.LinkedWork.repository.AreaRepository;
import com.contact.LinkedWork.repository.TrabajadorRepository;
import com.contact.LinkedWork.repository.UsuarioRepository;
import com.contact.LinkedWork.repository.RolRepository;

@Service("UsuarioService")
@Transactional
public class UsuarioService {
    @Autowired
    @Qualifier("CrudUsuarioRepository")
    private UsuarioRepository usuarioRepository;

    @Autowired
    @Qualifier("CrudTrabajadorRepository")
    private TrabajadorRepository trabajadorRepository;

    @Autowired
    @Qualifier("CrudAreaRepository")
    private AreaRepository areaRepository;

    @Autowired
    @Qualifier("CrudRolRepository")
    private RolRepository rolRepository;

    private String mapToDbRole(String roleName) {
        return switch (roleName) {
            case "ROLE_USUARIO" -> "Usuario";
            case "ROLE_TRABAJADOR" -> "Trabajador";
            default -> roleName;
        };
    }

    private String mapToFrontendRole(String dbRoleName) {
        return switch (dbRoleName) {
            case "Usuario" -> "ROLE_USUARIO";
            case "Trabajador" -> "ROLE_TRABAJADOR";
            default -> dbRoleName;
        };
    }

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
                            .map(rol -> mapToFrontendRole(rol.getNombre()))
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
                .map(rol -> mapToFrontendRole(rol.getNombre()))
                .toList();
        usuarioDTO.setRoles(roles);
        boolean esTrabajador = roles.contains("ROLE_TRABAJADOR");
        if (esTrabajador) {
            TrabajadorDTO trabajadorDTO = new TrabajadorDTO();
            trabajadorRepository.findByUsuario_IdUsuario(usuario.getIdUsuario())
                    .ifPresent(trabajador -> {
                        if (trabajador.getArea() != null) {
                            trabajadorDTO.setAreaId(trabajador.getArea().getIdArea());
                            trabajadorDTO.setAreaNombre(trabajador.getArea().getNombre());
                        }
                        trabajadorDTO.setDescripcion(trabajador.getDescripcion());
                        trabajadorDTO.setExperiencia(trabajador.getExperiencia());
                    });
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

    public UsuarioDTO createUser(String nombre, String email, String password, List<String> roleNames, Long areaId, String descripcion, Long experiencia) {
        Usuario usuario = new Usuario();
        usuario.setNombreUsuario(nombre);
        usuario.setNombreCompleto(nombre);
        usuario.setEmail(email);
        usuario.setClaveHash(password); // Note: should hash, but for now plain
        usuario.setEstado("activo");
        usuario.setFechaCreacion(LocalDateTime.now());
        
        List<Rol> roles = new ArrayList<>();
        if (roleNames != null && !roleNames.isEmpty()) {
            for (String roleName : roleNames) {
                Optional<Rol> rolOpt = rolRepository.findByNombre(mapToDbRole(roleName));
                if (rolOpt.isPresent()) {
                    roles.add(rolOpt.get());
                }
            }
        }
        usuario.setRoles(roles);
        
        usuarioRepository.save(usuario);

        UsuarioDTO usuarioDTO = new UsuarioDTO();
        usuarioDTO.setIdUsuario(usuario.getIdUsuario());
        usuarioDTO.setNombreCompleto(usuario.getNombreCompleto());
        usuarioDTO.setEmail(usuario.getEmail());
        usuarioDTO.setNombreUsuario(usuario.getNombreUsuario());
        usuarioDTO.setEstado(usuario.getEstado());
        usuarioDTO.setRoles(roleNames != null ? roleNames : new ArrayList<>());

        boolean esTrabajador = roleNames != null && roleNames.contains("ROLE_TRABAJADOR");
        if (esTrabajador) {
            Trabajador trabajador = new Trabajador(usuario);
            if (areaId != null) {
                Area area = areaRepository.findById(areaId)
                        .orElseThrow(() -> new RuntimeException("Area no encontrada con ID: " + areaId));
                trabajador.setArea(area);
            }
            if (descripcion != null && !descripcion.isBlank()) {
                trabajador.setDescripcion(descripcion.trim());
            }
            if (experiencia != null) {
                trabajador.setExperiencia(experiencia);
            }
            trabajador.setEstado("activo");
            trabajadorRepository.save(trabajador);

            TrabajadorDTO trabajadorDTO = new TrabajadorDTO();
            trabajadorDTO.setAreaId(areaId);
            if (trabajador.getArea() != null) {
                trabajadorDTO.setAreaNombre(trabajador.getArea().getNombre());
            }
            trabajadorDTO.setDescripcion(trabajador.getDescripcion());
            trabajadorDTO.setExperiencia(trabajador.getExperiencia());
            usuarioDTO.setTrabajador(trabajadorDTO);
        }

        return usuarioDTO;
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

    public UsuarioDTO changeRole(Long idUsuario, List<String> newRoles) {
        Usuario usuario = usuarioRepository.findByidUsuario(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + idUsuario));
        
        List<Rol> roles = new ArrayList<>();
        if (newRoles != null && !newRoles.isEmpty()) {
            for (String roleName : newRoles) {
                Optional<Rol> rolOpt = rolRepository.findByNombre(mapToDbRole(roleName));
                if (rolOpt.isPresent()) {
                    roles.add(rolOpt.get());
                }
            }
        }
        usuario.setRoles(roles);
        usuarioRepository.save(usuario);

        boolean esTrabajador = newRoles != null && newRoles.contains("ROLE_TRABAJADOR");
        if (esTrabajador && trabajadorRepository.findByUsuario_IdUsuario(usuario.getIdUsuario()).isEmpty()) {
            Trabajador trabajador = new Trabajador(usuario);
            trabajador.setEstado("activo");
            trabajadorRepository.save(trabajador);
        }

        UsuarioDTO usuarioDTO = new UsuarioDTO();
        usuarioDTO.setIdUsuario(usuario.getIdUsuario());
        usuarioDTO.setNombreCompleto(usuario.getNombreCompleto());
        usuarioDTO.setEmail(usuario.getEmail());
        usuarioDTO.setNombreUsuario(usuario.getNombreUsuario());
        usuarioDTO.setEstado(usuario.getEstado());
        usuarioDTO.setRoles(newRoles != null ? newRoles : new ArrayList<>());
        return usuarioDTO;
    }

    public UsuarioDTO editUser(UsuarioDTO usuarioDTO) {
        Usuario usuario = usuarioRepository.findByidUsuario(usuarioDTO.getIdUsuario())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + usuarioDTO.getIdUsuario()));
        
        usuario.setNombreCompleto(usuarioDTO.getNombreCompleto());
        usuario.setEmail(usuarioDTO.getEmail());
        usuario.setNombreUsuario(usuarioDTO.getNombreUsuario());
        usuario.setEstado(usuarioDTO.getEstado());
        // Password updates are handled separately and are not part of UsuarioDTO.
        
        usuarioRepository.save(usuario);

        if (usuarioDTO.getTrabajador() != null) {
            boolean tieneRolTrabajador = usuario.getRoles().stream()
                    .anyMatch(rol -> mapToDbRole("ROLE_TRABAJADOR").equals(rol.getNombre()));
            Optional<Trabajador> trabajadorOpt = trabajadorRepository.findByUsuario_IdUsuario(usuario.getIdUsuario());

            if (tieneRolTrabajador || trabajadorOpt.isPresent()) {
                Trabajador trabajador = trabajadorOpt.orElseGet(() -> new Trabajador(usuario));
                if (usuarioDTO.getTrabajador().getAreaId() != null) {
                    Area area = areaRepository.findById(usuarioDTO.getTrabajador().getAreaId())
                            .orElseThrow(() -> new RuntimeException("Area no encontrada con ID: " + usuarioDTO.getTrabajador().getAreaId()));
                    trabajador.setArea(area);
                }
                if (usuarioDTO.getTrabajador().getDescripcion() != null) {
                    trabajador.setDescripcion(usuarioDTO.getTrabajador().getDescripcion().trim());
                }
                if (usuarioDTO.getTrabajador().getExperiencia() != null) {
                    trabajador.setExperiencia(usuarioDTO.getTrabajador().getExperiencia());
                }
                trabajador.setEstado("activo");
                trabajadorRepository.save(trabajador);
            }
        }
        
        return usuarioDTO;
    }
}
