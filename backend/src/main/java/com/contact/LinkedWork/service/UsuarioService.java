package com.contact.LinkedWork.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import java.util.Collections;

import com.contact.LinkedWork.dto.ListarTrabajadorDTO;
import com.contact.LinkedWork.dto.LoginDTO;
import com.contact.LinkedWork.dto.TrabajadorDTO;
import com.contact.LinkedWork.dto.UsuarioDTO;
import com.contact.LinkedWork.model.Area;
import com.contact.LinkedWork.model.Ciudad;
import com.contact.LinkedWork.model.Departamento;
import com.contact.LinkedWork.model.Usuario;
import com.contact.LinkedWork.model.Rol;
import com.contact.LinkedWork.model.Trabajador;
import com.contact.LinkedWork.repository.AreaRepository;
import com.contact.LinkedWork.repository.CiudadRepository;
import com.contact.LinkedWork.repository.DepartamentoRepository;
import com.contact.LinkedWork.repository.TrabajadorRepository;
import com.contact.LinkedWork.repository.UsuarioRepository;
import com.contact.LinkedWork.repository.RolRepository;
import com.contact.LinkedWork.dto.CertificadoDTO;

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

    @Autowired
    @Qualifier("CrudDepartamentoRepository")
    private DepartamentoRepository departamentoRepository;

    @Autowired
    @Qualifier("CrudCiudadRepository")
    private CiudadRepository ciudadRepository;

    @Autowired
    @Qualifier("CertificadoService")
    private CertificadoService certificadoService;

    private String mapToDbRole(String roleName) {
        return switch (roleName) {
            case "ROLE_USUARIO" -> "Usuario";
            case "ROLE_TRABAJADOR" -> "Trabajador";
            case "ROLE_FARMING" -> "FARMING";
            default -> roleName;
        };
    }

    private String mapToFrontendRole(String dbRoleName) {
        return switch (dbRoleName) {
            case "Usuario" -> "ROLE_USUARIO";
            case "Trabajador" -> "ROLE_TRABAJADOR";
            case "FARMING" -> "ROLE_FARMING";
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
        System.out.println("[UsuarioService] Requested profile for ID: " + idUsuario);
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
        // Intentaremos siempre cargar información de trabajador si existe.
        TrabajadorDTO trabajadorDTO = new TrabajadorDTO();
        trabajadorRepository.findByUsuario_IdUsuario(usuario.getIdUsuario())
                .ifPresent(trabajador -> {
                    trabajadorDTO.setIdTrabajador(trabajador.getIdTrabajador());
                    if (trabajador.getArea() != null) {
                        trabajadorDTO.setAreaId(trabajador.getArea().getIdArea());
                        trabajadorDTO.setAreaNombre(trabajador.getArea().getNombre());
                    }
                    trabajadorDTO.setDescripcion(trabajador.getDescripcion());
                    trabajadorDTO.setExperiencia(trabajador.getExperiencia());
                    trabajadorDTO.setPuntuacion(trabajador.getPuntuacion());
                    if (trabajador.getDepartamento() != null) {
                        trabajadorDTO.setDepartamento(trabajador.getDepartamento().getNombre());
                    }
                    if (trabajador.getCiudad() != null) {
                        trabajadorDTO.setCiudad(trabajador.getCiudad().getNombre());
                    }
                    trabajadorDTO.setEsFarming(trabajador.getEsFarming() != null && trabajador.getEsFarming());
                });
        if (trabajadorDTO.getIdTrabajador() != null) {
            usuarioDTO.setTrabajador(trabajadorDTO);
        }
        return usuarioDTO;
    } 
    public List<ListarTrabajadorDTO> listarTrabajadores(){
        return ((List<Trabajador>) trabajadorRepository.findAll())
                .stream()
                .sorted((t1, t2) -> {
                    Integer p1 = t1.getPuntuacion() != null ? t1.getPuntuacion() : 0;
                    Integer p2 = t2.getPuntuacion() != null ? t2.getPuntuacion() : 0;
                    return p2.compareTo(p1); // Orden descendente
                })
                .map(trabajador -> {
                    ListarTrabajadorDTO trabajadorDTO = new ListarTrabajadorDTO();
                    trabajadorDTO.setIdTrabajador(trabajador.getIdTrabajador());
                    trabajadorDTO.setIdUsuario(trabajador.getUsuario().getIdUsuario());
                    trabajadorDTO.setNombreUsuario(trabajador.getUsuario().getNombreUsuario());
                    if (trabajador.getArea() != null) {
                        trabajadorDTO.setNombreArea(trabajador.getArea().getNombre());
                    }
                    trabajadorDTO.setExperiencia(trabajador.getExperiencia() == null ? 0L : trabajador.getExperiencia());
                    Long puntajeTotal = trabajador.getPuntuacion() == null
                            ? 0L
                            : trabajador.getPuntuacion().longValue();
                    trabajadorDTO.setPuntajeTotal(puntajeTotal);
                    trabajadorDTO.setNivel(getNivelLabel(puntajeTotal));
                    if (trabajador.getDepartamento() != null) {
                        trabajadorDTO.setDepartamento(trabajador.getDepartamento().getNombre());
                    }
                    if (trabajador.getCiudad() != null) {
                        trabajadorDTO.setCiudad(trabajador.getCiudad().getNombre());
                    }
                    trabajadorDTO.setEsFarming(trabajador.getEsFarming() != null && trabajador.getEsFarming());
                    return trabajadorDTO;
                })
                .toList();
    }

    private String getNivelLabel(Long puntajeTotal) {
        long puntos = puntajeTotal == null ? 0L : puntajeTotal;
        if (puntos >= 3001) return "Maestro";
        if (puntos >= 1501) return "Elite";
        if (puntos >= 501) return "Experto";
        if (puntos >= 101) return "Profesional";
        return "Aprendiz";
    }

    public UsuarioDTO createUser(String nombreUsuario, String nombre, String email, String password, List<String> roleNames, Long areaId, String descripcion, Long experiencia, Integer idDepartamento, Integer idCiudad, List<CertificadoDTO> certificados) {
        Usuario usuario = new Usuario();
        usuario.setNombreUsuario(nombreUsuario);
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
            if (idDepartamento != null) {
                departamentoRepository.findById(idDepartamento).ifPresent(trabajador::setDepartamento);
            }
            if (idCiudad != null) {
                ciudadRepository.findById(idCiudad).ifPresent(trabajador::setCiudad);
            }
            trabajador.setEstado("activo");
            trabajadorRepository.save(trabajador);

            if (certificados != null && !certificados.isEmpty()) {
                for (CertificadoDTO cert : certificados) {
                    certificadoService.agregarCertificado(cert, trabajador.getIdTrabajador());
                }
            }

            TrabajadorDTO trabajadorDTO = new TrabajadorDTO();
            trabajadorDTO.setAreaId(areaId);
            if (trabajador.getArea() != null) {
                trabajadorDTO.setAreaNombre(trabajador.getArea().getNombre());
            }
            trabajadorDTO.setDescripcion(trabajador.getDescripcion());
            trabajadorDTO.setExperiencia(trabajador.getExperiencia());
            trabajadorDTO.setPuntuacion(trabajador.getPuntuacion());
            if (trabajador.getDepartamento() != null) {
                trabajadorDTO.setDepartamento(trabajador.getDepartamento().getNombre());
            }
            if (trabajador.getCiudad() != null) {
                trabajadorDTO.setCiudad(trabajador.getCiudad().getNombre());
            }
            trabajadorDTO.setEsFarming(false);
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
        } else {
            String identifier = (loginDTO.getNombreUsuario() != null && !loginDTO.getNombreUsuario().isBlank()) 
                ? loginDTO.getNombreUsuario() 
                : loginDTO.getEmail();

            if (identifier != null && !identifier.isBlank()) {
                // Intenta buscar por nombre de usuario (Cédula) primero
                usuarioEncontrado = usuarioRepository.findByNombreUsuario(identifier);
                // Si no lo encuentra, intenta buscar por Email
                if (usuarioEncontrado.isEmpty()) {
                    usuarioEncontrado = usuarioRepository.findByEmail(identifier);
                }
            } else {
                throw new RuntimeException("Debes enviar idUsuario, nombreUsuario o email");
            }
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
            .map(rol -> mapToFrontendRole(rol.getNombre()))
            .toList();
        usuarioDTO.setRoles(roles);

        // Añadir datos de Trabajador si existe, para que el cliente tenga el idTrabajador y puntuacion
        trabajadorRepository.findByUsuario_IdUsuario(usuario.getIdUsuario())
            .ifPresent(trabajador -> {
                TrabajadorDTO trabajadorDTO = new TrabajadorDTO();
                trabajadorDTO.setIdTrabajador(trabajador.getIdTrabajador());
                if (trabajador.getArea() != null) {
                trabajadorDTO.setAreaId(trabajador.getArea().getIdArea());
                trabajadorDTO.setAreaNombre(trabajador.getArea().getNombre());
                }
                trabajadorDTO.setExperiencia(trabajador.getExperiencia());
                trabajadorDTO.setPuntuacion(trabajador.getPuntuacion());
                trabajadorDTO.setEsFarming(trabajador.getEsFarming() != null && trabajador.getEsFarming());
                usuarioDTO.setTrabajador(trabajadorDTO);
            });
        return usuarioDTO;
    }

    public UsuarioDTO loginOrRegisterGoogle(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList("648560152467-llla49ipnmr34bj6q63ii2q56oaine36.apps.googleusercontent.com"))
                .setAcceptableTimeSkewSeconds(315360000L) // 10 years para evitar problemas de reloj en dev
                .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();
                String name = (String) payload.get("name");

                Optional<Usuario> usuarioEncontrado = usuarioRepository.findByEmail(email);
                Usuario usuario;

                if (usuarioEncontrado.isPresent()) {
                    usuario = usuarioEncontrado.get();
                    if (Boolean.TRUE.equals(usuario.getBloqueado())) {
                        throw new RuntimeException("Usuario bloqueado, contacta al administrador");
                    }
                    usuario.setUltimoAcceso(LocalDateTime.now());
                } else {
                    // Create new user if not exists
                    usuario = new Usuario();
                    usuario.setEmail(email);
                    usuario.setNombreCompleto(name);
                    usuario.setNombreUsuario(email); // Use email as username for google
                    usuario.setClaveHash(""); // No password for Google users
                    usuario.setEstado("Activo");
                    usuario.setBloqueado(false);
                    usuario.setIntentosFallidos(0);
                    usuario.setFechaCreacion(LocalDateTime.now());
                    usuario.setUltimoAcceso(LocalDateTime.now());
                    
                    Rol rolUsuario = rolRepository.findByNombre("Usuario").orElseGet(() -> {
                        Rol r = new Rol();
                        r.setNombre("Usuario");
                        return rolRepository.save(r);
                    });
                    List<Rol> roles = new ArrayList<>();
                    roles.add(rolUsuario);
                    usuario.setRoles(roles);
                }
                
                usuarioRepository.save(usuario);

                UsuarioDTO usuarioDTO = new UsuarioDTO();
                usuarioDTO.setIdUsuario(usuario.getIdUsuario());
                usuarioDTO.setNombreCompleto(usuario.getNombreCompleto());
                usuarioDTO.setEmail(usuario.getEmail());
                usuarioDTO.setNombreUsuario(usuario.getNombreUsuario());
                usuarioDTO.setEstado(usuario.getEstado());
                List<String> rolesStr = usuario.getRoles().stream().map(rol -> mapToFrontendRole(rol.getNombre())).toList();
                usuarioDTO.setRoles(rolesStr);
                
                return usuarioDTO;
            } else {
                throw new RuntimeException("Token de Google inválido (firma o expiración)");
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error al validar token de Google: " + e.getMessage());
        }
    }

    public UsuarioDTO changeRole(Long idUsuario, List<String> newRoles) {
        Usuario usuario = usuarioRepository.findByidUsuario(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + idUsuario));
        
        List<Rol> roles = new ArrayList<>();
        if (newRoles != null && !newRoles.isEmpty()) {
            for (String roleName : newRoles) {
                String dbName = mapToDbRole(roleName);
                Optional<Rol> rolOpt = rolRepository.findByNombre(dbName);
                if (rolOpt.isPresent()) {
                    roles.add(rolOpt.get());
                } else {
                    // Si no existe el rol en BD, lo creamos para asegurar la asignación
                    Rol nuevoRol = new Rol();
                    nuevoRol.setNombre(dbName);
                    rolRepository.save(nuevoRol);
                    roles.add(nuevoRol);
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

    public UsuarioDTO upgradeToWorker(Long idUsuario, Long areaId, String descripcion, Long experiencia, Integer idDepartamento, Integer idCiudad) {
        Usuario usuario = usuarioRepository.findByidUsuario(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + idUsuario));
        
        // Agregar el rol si no lo tiene (verificar por nombre)
        boolean yaTieneRol = usuario.getRoles().stream()
                .anyMatch(r -> "Trabajador".equalsIgnoreCase(r.getNombre()));

        if (!yaTieneRol) {
            Optional<Rol> rolOpt = rolRepository.findByNombre("Trabajador");
            Rol rolTrabajador = rolOpt.orElseGet(() -> {
                Rol r = new Rol();
                r.setNombre("Trabajador");
                return rolRepository.save(r);
            });
            usuario.getRoles().add(rolTrabajador);
            usuarioRepository.save(usuario);
        }

        // Crear o actualizar el registro de Trabajador
        Trabajador trabajador = trabajadorRepository.findByUsuario_IdUsuario(usuario.getIdUsuario())
                .orElseGet(() -> new Trabajador(usuario));
        
        if (areaId != null) {
            Area area = areaRepository.findById(areaId)
                    .orElseThrow(() -> new RuntimeException("Area no encontrada con ID: " + areaId));
            trabajador.setArea(area);
        }
        if (descripcion != null) {
            trabajador.setDescripcion(descripcion.trim());
        }
        if (experiencia != null) {
            trabajador.setExperiencia(experiencia);
        }
        if (idDepartamento != null) {
            departamentoRepository.findById(idDepartamento).ifPresent(trabajador::setDepartamento);
        }
        if (idCiudad != null) {
            ciudadRepository.findById(idCiudad).ifPresent(trabajador::setCiudad);
        }
        trabajador.setEstado("activo");
        trabajadorRepository.save(trabajador);

        return SeeProfile(idUsuario);
    }

    public List<Departamento> getAllDepartamentos() {
        return (List<Departamento>) departamentoRepository.findAll();
    }

    public List<Ciudad> getCiudadesByDepartamento(Integer idDepartamento) {
        return ciudadRepository.findByDepartamento_IdDepartamento(idDepartamento);
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
