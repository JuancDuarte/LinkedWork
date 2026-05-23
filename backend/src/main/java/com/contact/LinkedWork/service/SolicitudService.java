package com.contact.LinkedWork.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.StreamSupport;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.contact.LinkedWork.dto.CrearSolicituDto;
import com.contact.LinkedWork.dto.EditarSolicitudDTO;
import com.contact.LinkedWork.dto.RespuestaAceptarDTO;
import com.contact.LinkedWork.dto.SolicitudDTO;
import com.contact.LinkedWork.dto.SolicitudHistorialDTO;
import com.contact.LinkedWork.model.Area;
import com.contact.LinkedWork.model.Oferta;
import com.contact.LinkedWork.model.OfertaHistorial;
import com.contact.LinkedWork.model.Solicitud;
import com.contact.LinkedWork.model.SolicitudHistorial;
import com.contact.LinkedWork.model.Trabajador;
import com.contact.LinkedWork.model.Usuario;
import com.contact.LinkedWork.repository.AreaRepository;
import com.contact.LinkedWork.repository.OfertaHistorialRepository;
import com.contact.LinkedWork.repository.OfertaRepository;
import com.contact.LinkedWork.repository.SolicitudHistorialRepository;
import com.contact.LinkedWork.repository.SolicitudRepository;
import com.contact.LinkedWork.repository.TrabajadorRepository;
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

    @Autowired
    @Qualifier("CrudSolicitudHistorialRepository")
    private SolicitudHistorialRepository solicitudHistorialRepository;

    @Autowired
    @Qualifier("CrudTrabajadorRepository")
    private TrabajadorRepository trabajadorRepository;

    @Autowired
    @Qualifier("CrudOfertaRepository")
    private OfertaRepository ofertaRepository;

    @Autowired
    @Qualifier("CrudOfertaHistorialRepository")
    private OfertaHistorialRepository ofertaHistorialRepository;

    @Autowired(required = false)
    private EmailService emailService;

    @Autowired
    private MediaUrlService mediaUrlService;

    public List<SolicitudDTO> getFeed() {
        return StreamSupport.stream(solicitudRepository.findAll().spliterator(), false)
                .filter(s -> "Pendiente".equalsIgnoreCase(s.getEstado()))
                .sorted((a, b) -> b.getFechaCreacion().compareTo(a.getFechaCreacion()))
                .map(this::convertToDTO)
                .toList();
    }

    public SolicitudDTO attachImagen(Long idSolicitud, Long idUsuario, String filename) {
        Solicitud solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
        if (!solicitud.getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new RuntimeException("No tienes permiso para modificar esta solicitud.");
        }
        solicitud.setImagenUrl(filename);
        return convertToDTO(solicitudRepository.save(solicitud));
    }

    public SolicitudDTO AgregarSolicitud(CrearSolicituDto crearSolicitudDto, Long idUsuario, Long idArea) {
        if (crearSolicitudDto == null || crearSolicitudDto.getTitulo() == null || crearSolicitudDto.getTitulo().isBlank()) {
            throw new RuntimeException("El título de la solicitud es obligatorio.");
        }
        if (crearSolicitudDto.getDescripcion() == null || crearSolicitudDto.getDescripcion().isBlank()) {
            throw new RuntimeException("La descripción de la solicitud es obligatoria.");
        }

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + idUsuario));
        Area area = areaRepository.findById(idArea)
                .orElseThrow(() -> new RuntimeException("Área no encontrada con ID: " + idArea));    
        Solicitud solicitud = new Solicitud();
        solicitud.setTitulo(crearSolicitudDto.getTitulo().trim());
        solicitud.setDescripcion(crearSolicitudDto.getDescripcion().trim());
        solicitud.setEstado("Pendiente");
        solicitud.setFechaCreacion(LocalDateTime.now());
        solicitud.setUsuario(usuario);
        solicitud.setArea(area);
        solicitud.setPrecio(crearSolicitudDto.getPrecio());
        solicitud.setFechaServicio(crearSolicitudDto.getFechaServicio());
        if (crearSolicitudDto.getDireccion() != null && !crearSolicitudDto.getDireccion().isBlank()) {
            solicitud.setDireccion(crearSolicitudDto.getDireccion().trim());
        }
        if (crearSolicitudDto.getLatitud() != null) {
            solicitud.setLatitud(crearSolicitudDto.getLatitud());
        }
        if (crearSolicitudDto.getLongitud() != null) {
            solicitud.setLongitud(crearSolicitudDto.getLongitud());
        }

        solicitud = solicitudRepository.save(solicitud);

        SolicitudHistorial historial = new SolicitudHistorial();
        historial.setSolicitud(solicitud);
        historial.setEstadoAnterior("N/A");
        historial.setEstadoNuevo("Pendiente");
        historial.setFecha(LocalDateTime.now());
        solicitudHistorialRepository.save(historial);

        notifySolicitudCreada(solicitud, usuario, area);

        return convertToDTO(solicitud);
    }

    public SolicitudDTO agregarSolicitudDirecta(CrearSolicituDto crearSolicitudDto, Long idUsuario, Long idTrabajadorUsuario) {
        if (crearSolicitudDto == null || crearSolicitudDto.getTitulo() == null || crearSolicitudDto.getTitulo().isBlank()) {
            throw new RuntimeException("El título de la solicitud es obligatorio.");
        }
        if (crearSolicitudDto.getDescripcion() == null || crearSolicitudDto.getDescripcion().isBlank()) {
            throw new RuntimeException("La descripción de la solicitud es obligatoria.");
        }

        Usuario usuarioSolicitante = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario solicitante no encontrado con ID: " + idUsuario));

        Usuario usuarioTrabajador = usuarioRepository.findById(idTrabajadorUsuario)
                .orElseThrow(() -> new RuntimeException("Trabajador no encontrado con ID de usuario: " + idTrabajadorUsuario));

        Trabajador trabajador = trabajadorRepository.findByUsuario_IdUsuario(idTrabajadorUsuario)
                .orElseThrow(() -> new RuntimeException("No existe perfil trabajador para el usuario destino."));

        Area area = trabajador.getArea();
        if (area == null) {
            Long areaIdFromPayload = crearSolicitudDto.getIdArea();
            if (areaIdFromPayload == null) {
                throw new RuntimeException("El trabajador destino no tiene area asignada. Selecciona un area para enviar la solicitud directa.");
            }
            area = areaRepository.findById(areaIdFromPayload)
                    .orElseThrow(() -> new RuntimeException("Area no encontrada con ID: " + areaIdFromPayload));
        }

        Solicitud solicitud = new Solicitud();
        solicitud.setTitulo(crearSolicitudDto.getTitulo().trim());
        solicitud.setDescripcion(crearSolicitudDto.getDescripcion().trim());
        solicitud.setEstado("Pendiente");
        solicitud.setFechaCreacion(LocalDateTime.now());
        solicitud.setUsuario(usuarioSolicitante);
        solicitud.setArea(area);
        solicitud.setPrecio(crearSolicitudDto.getPrecio());
        solicitud.setFechaServicio(crearSolicitudDto.getFechaServicio());
        if (crearSolicitudDto.getDireccion() != null && !crearSolicitudDto.getDireccion().isBlank()) {
            solicitud.setDireccion(crearSolicitudDto.getDireccion().trim());
        }
        if (crearSolicitudDto.getLatitud() != null) {
            solicitud.setLatitud(crearSolicitudDto.getLatitud());
        }
        if (crearSolicitudDto.getLongitud() != null) {
            solicitud.setLongitud(crearSolicitudDto.getLongitud());
        }
        solicitud = solicitudRepository.save(solicitud);

        SolicitudHistorial historial = new SolicitudHistorial();
        historial.setSolicitud(solicitud);
        historial.setEstadoAnterior("N/A");
        historial.setEstadoNuevo("Pendiente");
        historial.setFecha(LocalDateTime.now());
        solicitudHistorialRepository.save(historial);

        Oferta oferta = new Oferta();
        oferta.setSolicitud(solicitud);
        oferta.setTrabajador(trabajador);
        
        if (solicitud.getPrecio() != null && solicitud.getPrecio().compareTo(java.math.BigDecimal.ZERO) > 0) {
            oferta.setPrecio(solicitud.getPrecio());
        } else {
            oferta.setPrecio(new java.math.BigDecimal("50000"));
        }
        oferta.setDescripcion("Solicitud directa generada desde perfil del trabajador");
        oferta.setEstado("Pendiente");
        oferta.setFechaCreacion(LocalDateTime.now());
        oferta = ofertaRepository.save(oferta);

        OfertaHistorial ofertaHistorial = new OfertaHistorial();
        ofertaHistorial.setOferta(oferta);
        ofertaHistorial.setPrecioAnterior(null);
        ofertaHistorial.setPrecioNuevo(oferta.getPrecio());
        ofertaHistorial.setDescripcionAnterior(null);
        ofertaHistorial.setDescripcionNueva(oferta.getDescripcion());
        ofertaHistorial.setFecha(LocalDateTime.now());
        ofertaHistorialRepository.save(ofertaHistorial);

        notifySolicitudCreada(solicitud, usuarioSolicitante, area);
        notifyDirectSolicitudToWorker(solicitud, usuarioSolicitante, trabajador);

        return convertToDTO(solicitud);
    }

    public List<SolicitudDTO> getAllSolicitudes() {
        return ((List<Solicitud>) solicitudRepository.findAll())
                .stream()
                .map(this::convertToDTO)
                .toList();
        
    }

    public List<SolicitudDTO> getSolicitudesByUsuario(Long idUsuario) {
        List<Solicitud> solicitudes = solicitudRepository.findAllByUsuario_IdUsuario(idUsuario);
        return solicitudes.stream()
                .map(this::convertToDTO)
                .toList();
    }

    public List<SolicitudDTO> getSolicitudesParaTrabajador(Long idUsuarioTrabajador) {
        Usuario usuarioTrabajador = usuarioRepository.findById(idUsuarioTrabajador)
                .orElseThrow(() -> new RuntimeException("Usuario trabajador no encontrado con ID: " + idUsuarioTrabajador));

        Trabajador trabajador = trabajadorRepository.findByUsuario_IdUsuario(usuarioTrabajador.getIdUsuario())
            .orElseThrow(() -> new RuntimeException("No existe perfil trabajador para el usuario con ID: " + idUsuarioTrabajador));

        List<Solicitud> solicitudesPorArea = trabajador.getArea() != null
                ? solicitudRepository.findByArea_IdArea(trabajador.getArea().getIdArea())
                : List.of();
        List<SolicitudDTO> resultado = new ArrayList<>();
        Set<Long> idsAgregados = new HashSet<>();

        Set<Long> solicitudesDirectasDelTrabajador = new HashSet<>();
        if (trabajador.getOfertas() != null) {
            for (Oferta oferta : trabajador.getOfertas()) {
                if (oferta == null || oferta.getSolicitud() == null || oferta.getDescripcion() == null) {
                    continue;
                }
                if (oferta.getDescripcion().contains("Solicitud directa generada desde perfil del trabajador")) {
                    solicitudesDirectasDelTrabajador.add(oferta.getSolicitud().getIdSolicitud());
                }
            }
        }

        for (Solicitud solicitud : solicitudesPorArea) {
            if (!"Pendiente".equalsIgnoreCase(solicitud.getEstado())) {
                continue;
            }

            boolean tieneOfertas = solicitud.getOfertas() != null && !solicitud.getOfertas().isEmpty();
            boolean esSolicitudDirecta = false;
            boolean directaParaEsteTrabajador = false;

            if (tieneOfertas) {
                for (Oferta oferta : solicitud.getOfertas()) {
                    if (oferta == null || oferta.getTrabajador() == null) {
                        continue;
                    }
                    boolean marcaDirecta = oferta.getDescripcion() != null
                            && oferta.getDescripcion().contains("Solicitud directa generada desde perfil del trabajador");
                    if (marcaDirecta) {
                        esSolicitudDirecta = true;
                        if (oferta.getTrabajador().getIdTrabajador().equals(trabajador.getIdTrabajador())) {
                            directaParaEsteTrabajador = true;
                        }
                    }
                }
            }

            if (esSolicitudDirecta && !directaParaEsteTrabajador) {
                continue;
            }

            if (idsAgregados.contains(solicitud.getIdSolicitud())) {
                continue;
            }

            resultado.add(convertToDTO(solicitud));
            idsAgregados.add(solicitud.getIdSolicitud());
        }

        for (Long idSolicitudDirecta : solicitudesDirectasDelTrabajador) {
            if (idsAgregados.contains(idSolicitudDirecta)) {
                continue;
            }
            Solicitud solicitud = solicitudRepository.findById(idSolicitudDirecta)
                    .orElse(null);
            if (solicitud == null || !"Pendiente".equalsIgnoreCase(solicitud.getEstado())) {
                continue;
            }

            resultado.add(convertToDTO(solicitud));
            idsAgregados.add(solicitud.getIdSolicitud());
        }

        return resultado;
    }

    public List<SolicitudDTO> getTodasSolicitudesPendientes() {
        return ((List<Solicitud>) solicitudRepository.findAll())
                .stream()
                .filter(s -> "Pendiente".equalsIgnoreCase(s.getEstado()))
                .map(this::convertToDTO)
                .toList();
    }

    public RespuestaAceptarDTO aceptarSolicitudPorTrabajador(Long idSolicitud, Long idUsuarioTrabajador, java.math.BigDecimal precioContraoferta) {
        Usuario usuarioTrabajador = usuarioRepository.findById(idUsuarioTrabajador)
                .orElseThrow(() -> new RuntimeException("Usuario trabajador no encontrado con ID: " + idUsuarioTrabajador));

        Trabajador trabajador = trabajadorRepository.findByUsuario_IdUsuario(usuarioTrabajador.getIdUsuario())
            .orElseThrow(() -> new RuntimeException("No existe perfil trabajador para el usuario con ID: " + idUsuarioTrabajador));

        Solicitud solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada con ID: " + idSolicitud));

        if (!"Pendiente".equalsIgnoreCase(solicitud.getEstado())) {
            throw new RuntimeException("La solicitud ya no se encuentra pendiente.");
        }

        boolean existeOfertaTrabajador = ofertaRepository.existsBySolicitud_idSolicitudAndTrabajador_idTrabajador(
                solicitud.getIdSolicitud(), trabajador.getIdTrabajador());

        // Validar área solo si no es una solicitud directa (oferta preexistente)
        if (!existeOfertaTrabajador) {
            if (trabajador.getArea() == null || solicitud.getArea() == null
                    || !trabajador.getArea().getIdArea().equals(solicitud.getArea().getIdArea())) {
                throw new RuntimeException("El trabajador no pertenece al area de esta solicitud.");
            }
        }

        if (!existeOfertaTrabajador) {
            Oferta oferta = new Oferta();
            oferta.setSolicitud(solicitud);
            oferta.setTrabajador(trabajador);
            
            if (precioContraoferta != null && precioContraoferta.compareTo(java.math.BigDecimal.ZERO) > 0) {
                oferta.setPrecio(precioContraoferta);
            } else if (solicitud.getPrecio() != null && solicitud.getPrecio().compareTo(java.math.BigDecimal.ZERO) > 0) {
                oferta.setPrecio(solicitud.getPrecio());
            } else {
                oferta.setPrecio(new java.math.BigDecimal("50000"));
            }
            
            oferta.setDescripcion("Postulación de trabajador a solicitud general");
            oferta.setEstado("Pendiente");
            oferta.setFechaCreacion(LocalDateTime.now());
            oferta = ofertaRepository.save(oferta);

            OfertaHistorial historialOferta = new OfertaHistorial();
            historialOferta.setOferta(oferta);
            historialOferta.setPrecioAnterior(null);
            historialOferta.setPrecioNuevo(oferta.getPrecio());
            historialOferta.setDescripcionAnterior(null);
            historialOferta.setDescripcionNueva(oferta.getDescripcion());
            historialOferta.setFecha(LocalDateTime.now());
            ofertaHistorialRepository.save(historialOferta);

            notifyNewOffer(solicitud, trabajador, oferta);

            String nombreSolicitante = solicitud.getUsuario().getNombreCompleto() != null
                ? solicitud.getUsuario().getNombreCompleto()
                : solicitud.getUsuario().getNombreUsuario();
            String nombreTrabajador = trabajador.getUsuario().getNombreCompleto() != null
                ? trabajador.getUsuario().getNombreCompleto()
                : trabajador.getUsuario().getNombreUsuario();

            return new RespuestaAceptarDTO(
                "Postulación enviada correctamente. El solicitante debe aceptarla.",
                solicitud.getIdSolicitud(),
                solicitud.getTitulo(),
                solicitud.getUsuario().getIdUsuario(),
                nombreSolicitante,
                trabajador.getIdTrabajador(),
                nombreTrabajador
            );
        } else {
            // Si la oferta ya existe (solicitud directa), actualizar su estado a Aceptada
            Oferta ofertaExistente = ofertaRepository.findBySolicitud_idSolicitudAndTrabajador_idTrabajador(
                    solicitud.getIdSolicitud(), trabajador.getIdTrabajador());
            if (ofertaExistente != null) {
                ofertaExistente.setEstado("Aceptada");
                ofertaRepository.save(ofertaExistente);
            }

            String estadoAnterior = solicitud.getEstado();
            solicitud.setEstado("Aceptada");
            solicitud = solicitudRepository.save(solicitud);

            SolicitudHistorial historial = new SolicitudHistorial();
            historial.setSolicitud(solicitud);
            historial.setEstadoAnterior(estadoAnterior);
            historial.setEstadoNuevo("Aceptada");
            historial.setFecha(LocalDateTime.now());
            solicitudHistorialRepository.save(historial);

            String nombreSolicitante = solicitud.getUsuario().getNombreCompleto() != null
                ? solicitud.getUsuario().getNombreCompleto()
                : solicitud.getUsuario().getNombreUsuario();
            String nombreTrabajador = trabajador.getUsuario().getNombreCompleto() != null
                ? trabajador.getUsuario().getNombreCompleto()
                : trabajador.getUsuario().getNombreUsuario();

            return new RespuestaAceptarDTO(
                "Solicitud directa aceptada correctamente.",
                solicitud.getIdSolicitud(),
                solicitud.getTitulo(),
                solicitud.getUsuario().getIdUsuario(),
                nombreSolicitante,
                trabajador.getIdTrabajador(),
                nombreTrabajador
            );
        }
    }
    
    public boolean hasActiveJobOnDate(Long idUsuarioTrabajador, java.time.LocalDate fechaServicio) {
        if (fechaServicio == null) return false;
        Usuario usuarioTrabajador = usuarioRepository.findById(idUsuarioTrabajador)
                .orElseThrow(() -> new RuntimeException("Usuario trabajador no encontrado"));
        Trabajador trabajador = trabajadorRepository.findByUsuario_IdUsuario(usuarioTrabajador.getIdUsuario())
                .orElseThrow(() -> new RuntimeException("Perfil trabajador no encontrado"));
                
        // Check if there is any offer Aceptada with the same fechaServicio for this worker
        return ((List<Oferta>) ofertaRepository.findAll()).stream()
            .filter(o -> "Aceptada".equalsIgnoreCase(o.getEstado()))
            .filter(o -> o.getTrabajador() != null && o.getTrabajador().getIdTrabajador().equals(trabajador.getIdTrabajador()))
            .filter(o -> o.getSolicitud() != null && o.getSolicitud().getFechaServicio() != null)
            .anyMatch(o -> o.getSolicitud().getFechaServicio().equals(fechaServicio));
    }

    public void deleteSolicitudByUsuarioId(Long idSolicitud, Long idUsuario) {
        Optional<Solicitud> solicitudExistente = solicitudRepository.findById(idSolicitud);
        if (solicitudExistente.isEmpty()) {
            throw new RuntimeException("Solicitud no encontrada con ID: " + idSolicitud);
        }

        Solicitud solicitud = solicitudExistente.get();
        if (!solicitud.getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new RuntimeException("El usuario no tiene permiso para eliminar esta solicitud.");
        }

        // Limpiar colecciones explícitamente para asegurar que JPA procese los huérfanos/cascada
        solicitud.getOfertas().clear();
        solicitud.getHistoriales().clear();
        solicitud.getCalificaciones().clear();
        solicitudRepository.delete(solicitud);
    }
    public SolicitudDTO editarSolicitud(EditarSolicitudDTO editarSolicitudDTO, Long idSolicitud, Long idUsuario) {
        Solicitud solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada con ID: " + idSolicitud));
        if (!solicitud.getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new RuntimeException("El usuario no tiene permiso para editar esta solicitud.");
        }
        String estadoAnterior = solicitud.getEstado();
        SolicitudHistorial historial = new SolicitudHistorial();
        historial.setSolicitud(solicitud);
        historial.setEstadoAnterior(estadoAnterior);
        historial.setEstadoNuevo("Editado");
        historial.setFecha(LocalDateTime.now());
        solicitudHistorialRepository.save(historial);
        solicitud.setTitulo(editarSolicitudDTO.getTitulo());
        solicitud.setDescripcion(editarSolicitudDTO.getDescripcion());
        if (editarSolicitudDTO.getFechaServicio() != null) {
            solicitud.setFechaServicio(editarSolicitudDTO.getFechaServicio());
        }
        Solicitud solicitudActualizada = solicitudRepository.save(solicitud);
        return convertToDTO(solicitudActualizada);
    }
    public void eliminarSolicitud(Long idSolicitud, Long idUsuario) {
        Optional<Solicitud> solicitudExistente = solicitudRepository.findById(idSolicitud);
        if (!solicitudExistente.get().getUsuario().getIdUsuario().equals(idUsuario)) {
            throw new RuntimeException("El usuario no tiene permiso para eliminar esta solicitud.");
        }
    String estadoAnterior = solicitudExistente.get().getEstado();
    SolicitudHistorial historial = new SolicitudHistorial();
    historial.setSolicitud(solicitudExistente.get());
    historial.setEstadoAnterior(estadoAnterior);
    historial.setEstadoNuevo("Eliminado");
    historial.setFecha(LocalDateTime.now());
    solicitudHistorialRepository.save(historial);
    Solicitud solicitud = solicitudExistente.get();
    Area area = solicitud.getArea();
    area.getSolicitudes().remove(solicitud);
    solicitudRepository.deleteById(idSolicitud);
    }
    public List<SolicitudHistorialDTO> getHistorialSolicitud(Long idSolicitud) {
        return solicitudHistorialRepository.findBySolicitud_IdSolicitud(idSolicitud)
                .stream()
                .map(historial -> {
                    SolicitudHistorialDTO dto = new SolicitudHistorialDTO();
                    dto.setIdHistorial(historial.getIdHistorial().intValue());
                    dto.setIdSolicitud(historial.getSolicitud().getIdSolicitud().intValue());
                    dto.setEstadoAnterior(historial.getEstadoAnterior());
                    dto.setEstadoNuevo(historial.getEstadoNuevo());
                    dto.setFecha(historial.getFecha());
                    return dto;
                })
                .toList();
    }
    public SolicitudDTO updateEncounterDetails(Long idSolicitud, String direccion, String horaEncuentro, String notas, Double latitud, Double longitud) {
        Solicitud solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada con ID: " + idSolicitud));
        
        if (direccion == null || direccion.trim().isEmpty()) {
            throw new RuntimeException("La dirección de encuentro es obligatoria.");
        }
        if (horaEncuentro == null || horaEncuentro.trim().isEmpty()) {
            throw new RuntimeException("La hora de encuentro es obligatoria.");
        }
        
        solicitud.setDireccion(direccion.trim());
        solicitud.setHoraEncuentro(horaEncuentro.trim());
        solicitud.setNotas(notesSanitized(notas));
        solicitud.setLatitud(latitud);
        solicitud.setLongitud(longitud);
        
        Solicitud saved = solicitudRepository.save(solicitud);
        return convertToDTO(saved);
    }

    private String notesSanitized(String notes) {
        return notes != null ? notes.trim() : null;
    }

    private void notifySolicitudCreada(Solicitud solicitud, Usuario cliente, Area area) {
        if (emailService == null) {
            return;
        }
        try {
            String clientName = cliente.getNombreCompleto() != null
                    ? cliente.getNombreCompleto()
                    : cliente.getNombreUsuario();
            if (cliente.getEmail() != null) {
                emailService.sendSolicitudCreada(cliente.getEmail(), clientName, solicitud.getTitulo());
            }
            String areaName = area != null ? area.getNombre() : "tu área";
            if (area != null) {
                List<Trabajador> trabajadores = trabajadorRepository.findByArea_IdArea(area.getIdArea());
                for (Trabajador t : trabajadores) {
                    if (t.getUsuario() == null || t.getUsuario().getEmail() == null) {
                        continue;
                    }
                    String workerName = t.getUsuario().getNombreCompleto() != null
                            ? t.getUsuario().getNombreCompleto()
                            : t.getUsuario().getNombreUsuario();
                    emailService.sendNewSolicitudInAreaToWorker(
                            t.getUsuario().getEmail(),
                            workerName,
                            solicitud.getTitulo(),
                            areaName,
                            clientName,
                            solicitud.getPrecio());
                }
            }
        } catch (Exception e) {
            System.err.println("[Email] Error notificando solicitud creada: " + e.getMessage());
        }
    }

    private void notifyNewOffer(Solicitud solicitud, Trabajador trabajador, Oferta oferta) {
        if (emailService == null) {
            return;
        }
        try {
            if (solicitud.getUsuario() != null && solicitud.getUsuario().getEmail() != null) {
                String clientEmail = solicitud.getUsuario().getEmail();
                String clientName = solicitud.getUsuario().getNombreCompleto() != null
                        ? solicitud.getUsuario().getNombreCompleto()
                        : solicitud.getUsuario().getNombreUsuario();
                String workerName = trabajador.getUsuario().getNombreCompleto() != null
                        ? trabajador.getUsuario().getNombreCompleto()
                        : trabajador.getUsuario().getNombreUsuario();
                emailService.sendOfferNotification(
                        clientEmail, clientName, solicitud.getTitulo(), workerName, oferta.getPrecio());
            }
            if (trabajador.getUsuario() != null && trabajador.getUsuario().getEmail() != null) {
                String workerEmail = trabajador.getUsuario().getEmail();
                String workerName = trabajador.getUsuario().getNombreCompleto() != null
                        ? trabajador.getUsuario().getNombreCompleto()
                        : trabajador.getUsuario().getNombreUsuario();
                String clientName = solicitud.getUsuario().getNombreCompleto() != null
                        ? solicitud.getUsuario().getNombreCompleto()
                        : solicitud.getUsuario().getNombreUsuario();
                emailService.sendWorkerApplicationConfirmation(
                        workerEmail, workerName, solicitud.getTitulo(), clientName, oferta.getPrecio());
            }
        } catch (Exception e) {
            System.err.println("[Email] Error notificando nueva oferta: " + e.getMessage());
        }
    }

    private void notifyDirectSolicitudToWorker(Solicitud solicitud, Usuario cliente, Trabajador trabajador) {
        if (emailService == null || trabajador.getUsuario() == null || trabajador.getUsuario().getEmail() == null) {
            return;
        }
        try {
            String clientName = cliente.getNombreCompleto() != null
                    ? cliente.getNombreCompleto()
                    : cliente.getNombreUsuario();
            String workerName = trabajador.getUsuario().getNombreCompleto() != null
                    ? trabajador.getUsuario().getNombreCompleto()
                    : trabajador.getUsuario().getNombreUsuario();
            emailService.sendDirectSolicitudToWorker(
                    trabajador.getUsuario().getEmail(),
                    workerName,
                    solicitud.getTitulo(),
                    clientName);
        } catch (Exception e) {
            System.err.println("[Email] Error notificando solicitud directa: " + e.getMessage());
        }
    }

    private SolicitudDTO convertToDTO(Solicitud s) {
        if (s == null) return null;
        SolicitudDTO dto = new SolicitudDTO();
        dto.setIdSolicitud(s.getIdSolicitud());
        dto.setTitulo(s.getTitulo());
        dto.setDescripcion(s.getDescripcion());
        dto.setEstado(s.getEstado());
        dto.setFechaCreacion(s.getFechaCreacion());
        if (s.getUsuario() != null) {
            dto.setIdUsuario(s.getUsuario().getIdUsuario());
            dto.setNombreUsuario(s.getUsuario().getNombreCompleto() != null
                    ? s.getUsuario().getNombreCompleto()
                    : s.getUsuario().getNombreUsuario());
            dto.setFotoUsuarioUrl(mediaUrlService.toPublicUrl(s.getUsuario().getFotoPerfil()));
        }
        dto.setImagenUrl(mediaUrlService.toPublicUrl(s.getImagenUrl()));
        if (s.getArea() != null) {
            dto.setIdArea(s.getArea().getIdArea());
            dto.setNombreArea(s.getArea().getNombre());
        }
        dto.setPrecio(s.getPrecio());
        dto.setFechaServicio(s.getFechaServicio());
        dto.setDireccion(s.getDireccion());
        dto.setHoraEncuentro(s.getHoraEncuentro());
        dto.setNotas(s.getNotas());
        dto.setLatitud(s.getLatitud());
        dto.setLongitud(s.getLongitud());

        // Map trabajador if there is an accepted offer
        if (s.getOfertas() != null) {
            s.getOfertas().stream()
                .filter(o -> "Aceptada".equalsIgnoreCase(o.getEstado()))
                .findFirst()
                .ifPresent(o -> {
                    if (o.getTrabajador() != null) {
                        dto.setIdTrabajador(o.getTrabajador().getIdTrabajador());
                        if (o.getTrabajador().getUsuario() != null) {
                            var tu = o.getTrabajador().getUsuario();
                            dto.setNombreTrabajador(tu.getNombreCompleto() != null
                                    ? tu.getNombreCompleto()
                                    : tu.getNombreUsuario());
                            dto.setFotoTrabajadorUrl(mediaUrlService.toPublicUrl(tu.getFotoPerfil()));
                        }
                    }
                });
        }
        return dto;
    }
}