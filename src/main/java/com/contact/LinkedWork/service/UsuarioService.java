package com.contact.LinkedWork.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.contact.LinkedWork.dto.AreaDTO;
import com.contact.LinkedWork.dto.ListarTrabajadorDTO;
import com.contact.LinkedWork.dto.CrearUsuarioDTO;
import com.contact.LinkedWork.dto.LoginDTO;
import com.contact.LinkedWork.dto.RolDTO;
import com.contact.LinkedWork.dto.TrabajadorDTO;
import com.contact.LinkedWork.dto.UsuarioDTO;
import com.contact.LinkedWork.model.Area;
import com.contact.LinkedWork.model.Usuario;
import com.contact.LinkedWork.model.Rol;
import com.contact.LinkedWork.model.Trabajador;
import com.contact.LinkedWork.repository.AreaRepository;
import com.contact.LinkedWork.repository.RolRepository;
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

    @Autowired
    @Qualifier("CrudRolRepository")
    private RolRepository rolRepository;

    @Autowired
    @Qualifier("CrudAreaRepository")
    private AreaRepository areaRepository;

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

    public List<RolDTO> getAllRoles() {
        return ((List<Rol>) rolRepository.findAll())
                .stream()
                .map(rol -> {
                    RolDTO rolDTO = new RolDTO();
                    rolDTO.setIdRol(rol.getIdRol());
                    rolDTO.setNombre(rol.getNombre());
                    return rolDTO;
                })
                .toList();
    }

    public List<AreaDTO> getAllAreas() {
        return ((List<Area>) areaRepository.findAll())
                .stream()
                .map(area -> {
                    AreaDTO areaDTO = new AreaDTO();
                    areaDTO.setIdArea(area.getIdArea());
                    areaDTO.setNombre(area.getNombre());
                    areaDTO.setDescripcion(area.getDescripcion());
                    return areaDTO;
                })
                .toList();
    }

    public UsuarioDTO crearCuenta(CrearUsuarioDTO crearUsuarioDTO) {
        if (crearUsuarioDTO.getNombreCompleto() == null || crearUsuarioDTO.getNombreCompleto().isBlank()) {
            throw new RuntimeException("El nombre completo es obligatorio");
        }
        if (crearUsuarioDTO.getNombreUsuario() == null || crearUsuarioDTO.getNombreUsuario().isBlank()) {
            throw new RuntimeException("El nombre de usuario es obligatorio");
        }
        if (crearUsuarioDTO.getEmail() == null || crearUsuarioDTO.getEmail().isBlank()) {
            throw new RuntimeException("El email es obligatorio");
        }
        if (crearUsuarioDTO.getClave() == null || crearUsuarioDTO.getClave().isBlank()) {
            throw new RuntimeException("La clave es obligatoria");
        }

        if (usuarioRepository.findByNombreUsuario(crearUsuarioDTO.getNombreUsuario()).isPresent()) {
            throw new RuntimeException("El nombre de usuario ya existe");
        }

        if (usuarioRepository.findByEmail(crearUsuarioDTO.getEmail()).isPresent()) {
            throw new RuntimeException("El email ya existe");
        }

        Long idRol = crearUsuarioDTO.getIdRol() != null ? crearUsuarioDTO.getIdRol() : 1L;
        Rol rol = rolRepository.findById(idRol)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado con ID: " + idRol));

        Usuario usuario = new Usuario();
        usuario.setNombreCompleto(crearUsuarioDTO.getNombreCompleto());
        usuario.setNombreUsuario(crearUsuarioDTO.getNombreUsuario());
        usuario.setEmail(crearUsuarioDTO.getEmail());
        usuario.setClaveHash(crearUsuarioDTO.getClave());
        usuario.setEstado("Activo");
        usuario.setIntentosFallidos(0);
        usuario.setBloqueado(false);
        usuario.setRoles(List.of(rol));

        Usuario guardado = usuarioRepository.save(usuario);

        Trabajador trabajadorGuardado = null;
        boolean esTrabajador = rol.getNombre() != null && rol.getNombre().toUpperCase().contains("TRABAJADOR");
        if (esTrabajador) {
            if (crearUsuarioDTO.getIdArea() == null) {
                throw new RuntimeException("El área es obligatoria para un trabajador");
            }

            Area area = areaRepository.findById(crearUsuarioDTO.getIdArea())
                    .orElseThrow(() -> new RuntimeException("Área no encontrada con ID: " + crearUsuarioDTO.getIdArea()));

            Trabajador trabajador = new Trabajador();
            trabajador.setUsuario(guardado);
            trabajador.setArea(area);
            trabajador.setDescripcion(crearUsuarioDTO.getDescripcion());
            trabajador.setExperiencia(crearUsuarioDTO.getExperiencia() != null ? crearUsuarioDTO.getExperiencia() : 0L);
            trabajador.setEstado("Activo");
            trabajadorGuardado = trabajadorRepository.save(trabajador);
        }

        UsuarioDTO usuarioDTO = new UsuarioDTO();
        usuarioDTO.setIdUsuario(guardado.getIdUsuario());
        usuarioDTO.setNombreCompleto(guardado.getNombreCompleto());
        usuarioDTO.setEmail(guardado.getEmail());
        usuarioDTO.setNombreUsuario(guardado.getNombreUsuario());
        usuarioDTO.setEstado(guardado.getEstado());
        List<String> roles = guardado.getRoles()
                .stream()
                .map(Rol::getNombre)
                .toList();
        usuarioDTO.setRoles(roles);

        if (trabajadorGuardado != null) {
            TrabajadorDTO trabajadorDTO = new TrabajadorDTO();
            trabajadorDTO.setAreaNombre(trabajadorGuardado.getArea().getNombre());
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

        if (roles.stream().anyMatch(rol -> rol != null && rol.toUpperCase().contains("TRABAJADOR"))) {
            trabajadorRepository.findByUsuario_IdUsuario(usuario.getIdUsuario()).ifPresent(trabajador -> {
                TrabajadorDTO trabajadorDTO = new TrabajadorDTO();
                if (trabajador.getArea() != null) {
                    trabajadorDTO.setAreaNombre(trabajador.getArea().getNombre());
                }
                usuarioDTO.setTrabajador(trabajadorDTO);
            });
        }

        return usuarioDTO;
    }
}
