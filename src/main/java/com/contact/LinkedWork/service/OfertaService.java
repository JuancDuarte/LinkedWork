package com.contact.LinkedWork.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.contact.LinkedWork.dto.OfertaDTO;
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
        boolean yaExisteOferta = ofertaRepository.existsBySolicitud_IdSolicitudAndTrabajador_IdTrabajador(crearofertaDTO.getIdSolicitud(), trabajador.getIdTrabajador());
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
            if (!oferta.getTrabajador().getIdTrabajador().equals(idTrabajador)) {
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
    

}
