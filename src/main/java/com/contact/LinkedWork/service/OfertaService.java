package com.contact.LinkedWork.service;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.contact.LinkedWork.dto.OfertaDTO;
import com.contact.LinkedWork.dto.EditarOFertaDTO.EditarOfertaDTO;
import com.contact.LinkedWork.model.Oferta;
import com.contact.LinkedWork.model.Solicitud;
import com.contact.LinkedWork.model.Trabajador;
import com.contact.LinkedWork.model.Usuario;
import com.contact.LinkedWork.repository.OfertaRepository;
import com.contact.LinkedWork.repository.SolicitudRepository;
import com.contact.LinkedWork.repository.TrabajadorRepository;
import com.contact.LinkedWork.repository.UsuarioRepository;

@Service("OfertaService")
@Transactional
public class OfertaService {

    @Autowired
    private OfertaRepository ofertaRepository;

    @Autowired
    private SolicitudRepository solicitudRepository;

    @Autowired
    private TrabajadorRepository trabajadorRepository;

    @Autowired
    private UsuarioRepository  usuarioRepository;

    public Oferta crearOferta(OfertaDTO ofertaDTO) {
        Usuario usuario = usuarioRepository.findByidUsuario(ofertaDTO.getIdTrabajador())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + ofertaDTO.getIdTrabajador()));
        boolean esTrabajador = usuario.getRoles()
                .stream()
                .anyMatch(rol -> rol.getNombre().equals("ROLE_TRABAJADOR"));
        if (!esTrabajador) {
            throw new RuntimeException("El usuario con ID: " + ofertaDTO.getIdTrabajador()
                    + " no tiene el rol de trabajador y no puede crear una oferta.");
        }
        Trabajador trabajador = trabajadorRepository.findByUsuario_IdUsuario(usuario.getIdUsuario())
                .orElseThrow(() -> new RuntimeException("Trabajador no encontrado para el usuario con ID: " + usuario.getIdUsuario()));
        Solicitud solicitud = solicitudRepository.findById(ofertaDTO.getIdSolicitud())
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada con ID: " + ofertaDTO.getIdSolicitud()));
        if(trabajador.getArea() == null || solicitud.getArea() == null || !trabajador.getArea().getIdArea().equals(solicitud.getArea().getIdArea())) {
            throw new RuntimeException("El trabajador con ID: " + trabajador.getIdTrabajador()
                    + " no pertenece al área requerida por la solicitud con ID: " + solicitud.getIdSolicitud());
        }
        BigDecimal precio = ofertaDTO.getPrecio();
        BigDecimal MIN = new BigDecimal("50000");
        BigDecimal MAX = new BigDecimal("700000");
        if(precio.compareTo(MIN) < 0 || precio.compareTo(MAX) > 0) {
            throw new RuntimeException("El precio de la oferta debe estar entre 50000 y 700000.");
        }
        boolean yaExisteOferta = ofertaRepository.existsBySolicitud_IdSolicitudAndTrabajador_IdTrabajador(ofertaDTO.getIdSolicitud(), trabajador.getIdTrabajador());
        if (yaExisteOferta) {
            throw new RuntimeException("Ya existe una oferta para la solicitud con ID: " + ofertaDTO.getIdSolicitud()
                    + " por parte del trabajador con ID: " + trabajador.getIdTrabajador());
        }
        Oferta oferta = new Oferta();
        oferta.setSolicitud(solicitud);
        oferta.setTrabajador(trabajador);
        oferta.setPrecio(precio);
        oferta.setDescripcion(ofertaDTO.getDescripcion());
        return ofertaRepository.save(oferta);
    }
    public Oferta editOferta(EditarOfertaDTO editarOfertaDTO) {
        Oferta oferta = ofertaRepository.findById(editarOfertaDTO.getIdOferta())
                .orElseThrow(() -> new RuntimeException("Oferta no encontrada con ID: " + editarOfertaDTO.getIdOferta()));
        if (!oferta.getTrabajador().getIdTrabajador().equals(editarOfertaDTO.getIdTrabajador())) {
            throw new RuntimeException("El trabajador con ID: " + editarOfertaDTO.getIdTrabajador()
                    + " no es el creador de la oferta con ID: " + editarOfertaDTO.getIdOferta() + " y no puede editarla.");
        }
        BigDecimal precio = editarOfertaDTO.getPrecio();
        BigDecimal MIN = new BigDecimal("50000");
        BigDecimal MAX = new BigDecimal("700000");
        if(precio.compareTo(MIN) < 0 || precio.compareTo(MAX) > 0) {
            throw new RuntimeException("El precio de la oferta debe estar entre 50000 y 700000.");
        }
        oferta.setPrecio(precio);
        oferta.setDescripcion(editarOfertaDTO.getDescripcion());
        return ofertaRepository.save(oferta);
        }

        public void eliminarOferta(Long idOferta, Long idTrabajador) {
            Oferta oferta = ofertaRepository.findById(idOferta)
                    .orElseThrow(() -> new RuntimeException("Oferta no encontrada con ID: " + idOferta));
            if (!oferta.getTrabajador().getIdTrabajador().equals(idTrabajador)) {
                throw new RuntimeException("El trabajador con ID: " + idTrabajador
                        + " no es el creador de la oferta con ID: " + idOferta + " y no puede eliminarla.");
                }
        Trabajador trabajador = oferta.getTrabajador();
        Solicitud solicitud = oferta.getSolicitud();
        trabajador.getOfertas().remove(oferta);
        solicitud.getOfertas().remove(oferta);
        ofertaRepository.deleteById(idOferta);
        }
    

}
