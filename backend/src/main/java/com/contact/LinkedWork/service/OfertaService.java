package com.contact.LinkedWork.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.contact.LinkedWork.dto.OfertaDTO;
import com.contact.LinkedWork.dto.OfertaVistaDTO;
import com.contact.LinkedWork.dto.RespuestaAceptarDTO;
import com.contact.LinkedWork.dto.CrearOfertaDTO;
import com.contact.LinkedWork.dto.EditarOFertaDTO.EditarOfertaDTO;
import com.contact.LinkedWork.model.Oferta;
import com.contact.LinkedWork.model.OfertaHistorial;
import com.contact.LinkedWork.model.Solicitud;
import com.contact.LinkedWork.model.Trabajador;
import com.contact.LinkedWork.model.Usuario;
import com.contact.LinkedWork.repository.OfertaHistorialRepository;
import com.contact.LinkedWork.repository.OfertaRepository;
import com.contact.LinkedWork.repository.SolicitudRepository;
import com.contact.LinkedWork.repository.TrabajadorRepository;
import com.contact.LinkedWork.repository.UsuarioRepository;
import java.util.stream.StreamSupport;

@Service("OfertaService")
@Transactional
public class OfertaService {

    @Autowired
    @Qualifier("CrudOfertaRepository")
    private OfertaRepository ofertaRepository;

    @Autowired
    @Qualifier("CrudSolicitudRepository")
    private SolicitudRepository solicitudRepository;

    @Autowired
    @Qualifier("CrudTrabajadorRepository")
    private TrabajadorRepository trabajadorRepository;

    @Autowired
    @Qualifier("CrudUsuarioRepository")
    private UsuarioRepository  usuarioRepository;

    @Autowired
    @Qualifier("CrudOfertaHistorialRepository")
    private OfertaHistorialRepository ofertaHistorialRepository;

    @Autowired
    @Qualifier("NotificacionService")
    private NotificacionService notificacionService;

    public OfertaDTO crearOferta(CrearOfertaDTO crearofertaDTO, Long idTrabajador, Long idSolicitud) {
        Usuario usuario = usuarioRepository.findByidUsuario(idTrabajador)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + idTrabajador));
        boolean esTrabajador = usuario.getRoles()
                .stream()
                .anyMatch(rol -> rol.getNombre().equals("ROLE_TRABAJADOR"));
        if (!esTrabajador) {
            throw new RuntimeException("El usuario con ID: " + idTrabajador
                    + " no tiene el rol de trabajador y no puede crear una oferta.");
        }
        Trabajador trabajador = trabajadorRepository.findByUsuario_IdUsuario(usuario.getIdUsuario())
                .orElseThrow(() -> new RuntimeException("Trabajador no encontrado para el usuario con ID: " + usuario.getIdUsuario()));
        Solicitud solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada con ID: " + idSolicitud));
        if(trabajador.getArea() == null || solicitud.getArea() == null || !trabajador.getArea().getIdArea().equals(solicitud.getArea().getIdArea())) {
            throw new RuntimeException("El trabajador con ID: " + trabajador.getIdTrabajador()
                    + " no pertenece al área requerida por la solicitud con ID: " + solicitud.getIdSolicitud());
        }
        BigDecimal precio = crearofertaDTO.getPrecio();
        BigDecimal MIN = new BigDecimal("50000");
        BigDecimal MAX = new BigDecimal("700000");
        if(precio.compareTo(MIN) < 0 || precio.compareTo(MAX) > 0) {
            throw new RuntimeException("El precio de la oferta debe estar entre 50000 y 700000.");
        }

        boolean yaExisteOferta = StreamSupport.stream(ofertaRepository.findAll().spliterator(), false).anyMatch(o -> o.getSolicitud().getIdSolicitud().equals(solicitud.getIdSolicitud()) && o.getTrabajador().getIdTrabajador().equals(trabajador.getIdTrabajador()));
        if (yaExisteOferta) {
            throw new RuntimeException("Ya existe una oferta para la solicitud con ID: " + crearofertaDTO.getIdSolicitud()
                    + " por parte del trabajador con ID: " + trabajador.getIdTrabajador());
        }
        Oferta oferta = new Oferta();
        oferta.setPrecio(crearofertaDTO.getPrecio());
        oferta.setDescripcion(crearofertaDTO.getDescripcion());
        oferta.setTrabajador(trabajador);
        oferta.setSolicitud(solicitud);
        oferta.setEstado("Pendiente");
        oferta.setFechaCreacion(LocalDateTime.now());
        OfertaHistorial historial = new OfertaHistorial();
        historial.setOferta(oferta);
        historial.setDescripcionNueva(crearofertaDTO.getDescripcion());
        historial.setPrecioNuevo(precio);
        historial.setFecha(LocalDateTime.now());
        historial.setDescripcionAnterior(null);
        historial.setPrecioAnterior(null);      
        ofertaRepository.save(oferta);
        ofertaHistorialRepository.save(historial);
        OfertaDTO ofertaDTO = new OfertaDTO();
        ofertaDTO.setIdOferta(oferta.getIdOferta());
        ofertaDTO.setIdSolicitud(solicitud.getIdSolicitud());
        ofertaDTO.setIdTrabajador(trabajador.getIdTrabajador());
        ofertaDTO.setPrecio(oferta.getPrecio());
        ofertaDTO.setDescripcion(oferta.getDescripcion());

        Long idUsuarioSolicitud = solicitud.getUsuario().getIdUsuario();
        notificacionService.crearNotificacion(  idUsuarioSolicitud, "Nueva oferta recibida",
        "Un trabajador envió una oferta a tu solicitud: " + solicitud.getTitulo(),
        "OFERTA");

        return ofertaDTO;
    }
    public Oferta editOferta(EditarOfertaDTO editarOfertaDTO, Long idOferta, Long idTrabajador) {
        Oferta oferta = ofertaRepository.findById(idOferta)
                .orElseThrow(() -> new RuntimeException("Oferta no encontrada con ID: " + idOferta));
        if (!oferta.getTrabajador().getIdTrabajador().equals(idTrabajador)) {
            throw new RuntimeException("El trabajador con ID: " + idTrabajador
                    + " no es el creador de la oferta con ID: " + idOferta + " y no puede editarla.");
        }
        BigDecimal precio = editarOfertaDTO.getPrecio();
        BigDecimal MIN = new BigDecimal("50000");
        BigDecimal MAX = new BigDecimal("700000");
        BigDecimal precioAnterior = oferta.getPrecio();
        String descripcionAnterior = oferta.getDescripcion();
        if(precio.compareTo(MIN) < 0 || precio.compareTo(MAX) > 0) {
            throw new RuntimeException("El precio de la oferta debe estar entre 50000 y 700000.");
        }
        oferta.setPrecio(precio);
        oferta.setDescripcion(editarOfertaDTO.getDescripcion());
        OfertaHistorial historial = new OfertaHistorial();
        historial.setOferta(oferta);
        historial.setPrecioAnterior(precioAnterior);
        historial.setPrecioNuevo(precio);
        historial.setDescripcionAnterior(descripcionAnterior);
        historial.setDescripcionNueva(editarOfertaDTO.getDescripcion());
        historial.setFecha(LocalDateTime.now());
        ofertaHistorialRepository.save(historial);
        return ofertaRepository.save(oferta);
        }

        public void eliminarOferta(Long idOferta, Long idTrabajador) {
            Oferta oferta = ofertaRepository.findById(idOferta)
                    .orElseThrow(() -> new RuntimeException("Oferta no encontrada con ID: " + idOferta));
            Long trabajadorId = oferta.getTrabajador().getIdTrabajador();
            Long trabajadorUsuarioId = oferta.getTrabajador().getUsuario() != null
                    ? oferta.getTrabajador().getUsuario().getIdUsuario()
                    : null;

            boolean autorizado = trabajadorId.equals(idTrabajador)
                    || (trabajadorUsuarioId != null && trabajadorUsuarioId.equals(idTrabajador));

            if (!autorizado) {
                throw new RuntimeException("El trabajador con ID: " + idTrabajador
                        + " no es el creador de la oferta con ID: " + idOferta + " y no puede eliminarla.");
                }
        BigDecimal precioAnterior = oferta.getPrecio();
        String descripcionAnterior = oferta.getDescripcion();
        OfertaHistorial historial = new OfertaHistorial();
        historial.setOferta(oferta);
        historial.setPrecioAnterior(precioAnterior);
        historial.setPrecioNuevo(null);
        historial.setDescripcionAnterior(descripcionAnterior);
        historial.setDescripcionNueva("Eliminada");
        historial.setFecha(LocalDateTime.now());
        ofertaHistorialRepository.save(historial);

        Trabajador trabajador = oferta.getTrabajador();
        Solicitud solicitud = oferta.getSolicitud();
        trabajador.getOfertas().remove(oferta);
        solicitud.getOfertas().remove(oferta);
        ofertaRepository.deleteById(idOferta);
        }
        
        public List<OfertaVistaDTO> listarOfertasPorSolicitud(Long idSolicitud, Long idUsuario) {
                Solicitud solicitud = solicitudRepository.findById(idSolicitud)
                        .orElseThrow(() -> new RuntimeException("Solicitud no encontrada con ID: " + idSolicitud));
                if (!solicitud.getUsuario().getIdUsuario().equals(idUsuario)) {
                        throw new RuntimeException("El usuario con ID: " + idUsuario
                                + " no es el creador de la solicitud con ID: " + idSolicitud + " y no puede ver las ofertas.");
                }
                return solicitud.getOfertas()
                        .stream()
                        .sorted(Comparator.comparing(Oferta::getPrecio))
                        .map(oferta -> {
                                OfertaVistaDTO ofertaVistaDTO = new OfertaVistaDTO();
                                ofertaVistaDTO.setIdOferta(oferta.getIdOferta());
                                ofertaVistaDTO.setIdUsuario(oferta.getTrabajador().getUsuario().getIdUsuario());
                                ofertaVistaDTO.setNombreTrabajador(oferta.getTrabajador().getUsuario().getNombreUsuario());
                                ofertaVistaDTO.setNombreArea(oferta.getTrabajador().getArea().getNombre());
                                ofertaVistaDTO.setDescripcion(oferta.getDescripcion());
                                ofertaVistaDTO.setPrecio(oferta.getPrecio());
                                ofertaVistaDTO.setEstado(oferta.getEstado());
                                ofertaVistaDTO.setFechaPublicacion(oferta.getFechaCreacion().toLocalDate());
                                Double calificacionPromedio = oferta.getTrabajador().getCalificaciones()
                                        .stream()
                                        .mapToDouble(calificacion -> calificacion.getPuntuacion())
                                        .average()
                                        .orElse(0.0);
                                ofertaVistaDTO.setCalificacionPromedio(calificacionPromedio);
                                return ofertaVistaDTO;
                        })
                        .toList();
        }
        public RespuestaAceptarDTO aceptarOferta(Long idSolicitud, Long idOferta, Long idUsuario) {
                Solicitud solicitud = solicitudRepository.findById(idSolicitud)
                        .orElseThrow(() -> new RuntimeException("Solicitud no encontrada con ID: " + idSolicitud));
                if (!solicitud.getUsuario().getIdUsuario().equals(idUsuario)) {
                        throw new RuntimeException("El usuario con ID: " + idUsuario
                                + " no es el creador de la solicitud con ID: " + idSolicitud + " y no puede aceptar ofertas para esta solicitud.");
                }

                Oferta oferta = ofertaRepository.findById(idOferta)
                        .orElseThrow(() -> new RuntimeException("Oferta no encontrada con ID: " + idOferta));
                if (!oferta.getSolicitud().getUsuario().getIdUsuario().equals(idUsuario)) {
                        throw new RuntimeException("El usuario con ID: " + idUsuario
                                + " no es el creador de la solicitud asociada a la oferta con ID: " + idOferta + " y no puede aceptar esta oferta.");
                }
                solicitud.setEstado("Aceptada");
                if (oferta.getPrecio() != null) {
                    solicitud.setPrecio(oferta.getPrecio());
                }
                solicitudRepository.save(solicitud);
                oferta.setEstado("Aceptada");
                ofertaRepository.save(oferta);
                solicitud.getOfertas().forEach(o -> {
                        if (!o.getIdOferta().equals(idOferta)) {
                                o.setEstado("Rechazada");
                                ofertaRepository.save(o);
                        }
                });
                ofertaRepository.save(oferta);

                Long idUsuarioSolicitud = oferta.getTrabajador().getUsuario().getIdUsuario();

                notificacionService.crearNotificacion(
                idUsuarioSolicitud,
        "Oferta aceptada",
                "El usuario " + oferta.getTrabajador().getUsuario().getNombreUsuario() + " aceptó tu oferta para la solicitud: " + oferta.getSolicitud().getTitulo(),
                "OFERTA");
                String nombreSolicitante = solicitud.getUsuario().getNombreCompleto() != null
                                ? solicitud.getUsuario().getNombreCompleto()
                                : solicitud.getUsuario().getNombreUsuario();
                String nombreTrabajador = oferta.getTrabajador().getUsuario().getNombreCompleto() != null
                                ? oferta.getTrabajador().getUsuario().getNombreCompleto()
                                : oferta.getTrabajador().getUsuario().getNombreUsuario();

                return new RespuestaAceptarDTO(
                                "Oferta aceptada correctamente.",
                                solicitud.getIdSolicitud(),
                                solicitud.getTitulo(),
                                solicitud.getUsuario().getIdUsuario(),
                                nombreSolicitante,
                                oferta.getTrabajador().getIdTrabajador(),
                                nombreTrabajador);
        }

        public List<OfertaVistaDTO> listarOfertasPorTrabajador(Long idUsuarioTrabajador) {
                Trabajador trabajador = trabajadorRepository.findByUsuario_IdUsuario(idUsuarioTrabajador)
                        .orElseThrow(() -> new RuntimeException("Trabajador no encontrado para el usuario con ID: " + idUsuarioTrabajador));
                
                return trabajador.getOfertas()
                        .stream()
                        .sorted(Comparator.comparing(Oferta::getFechaCreacion).reversed())
                        .map(oferta -> {
                                OfertaVistaDTO dto = new OfertaVistaDTO();
                                dto.setIdOferta(oferta.getIdOferta());
                                dto.setIdSolicitud(oferta.getSolicitud().getIdSolicitud());
                                dto.setTituloSolicitud(oferta.getSolicitud().getTitulo());
                                dto.setFechaServicio(oferta.getSolicitud().getFechaServicio());
                                dto.setPrecio(oferta.getPrecio());
                                dto.setEstado(oferta.getEstado());
                                dto.setDescripcion(oferta.getDescripcion());
                                dto.setFechaPublicacion(oferta.getFechaCreacion().toLocalDate());
                                dto.setNombreTrabajador(trabajador.getUsuario().getNombreUsuario());
                                return dto;
                        })
                        .toList();
        }
}
