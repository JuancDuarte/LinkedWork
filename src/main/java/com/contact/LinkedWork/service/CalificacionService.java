package com.contact.LinkedWork.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.contact.LinkedWork.dto.CalificarDTO;
import com.contact.LinkedWork.repository.CalificacionRepository;
import com.contact.LinkedWork.repository.OfertaRepository;
import com.contact.LinkedWork.repository.SolicitudRepository;
import com.contact.LinkedWork.model.Solicitud;
import com.contact.LinkedWork.model.Trabajador;
import com.contact.LinkedWork.model.Calificacion;
import com.contact.LinkedWork.model.Oferta;

@Service("CalificacionService")
@Transactional
public class CalificacionService {

    @Autowired
    @Qualifier("CrudCalificacionRepository")
    private CalificacionRepository calificacionRepository;

    @Autowired
    @Qualifier("CrudSolicitudRepository")
    private SolicitudRepository solicitudRepository;

    @Autowired
    @Qualifier("CrudOfertaRepository")
    private OfertaRepository ofertaRepository;

    public String CalificarTrabajador(CalificarDTO calificarDTO, long idUsuario, long idSolicitud) {
        Solicitud solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));
            if(!solicitud.getUsuario().getIdUsuario().equals(idUsuario)) {
                throw new RuntimeException("El usuario no es el trabajador asignado a la solicitud");
            }
            if(!"Aceptada".equals(solicitud.getEstado())) {
                throw new RuntimeException("La solicitud no está en estado ACEPTADA");
            }
            Oferta oferta = solicitud.getOfertas().stream()
                .filter(o -> "Aceptada".equals(o.getEstado()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No se encontró una oferta aceptada para esta solicitud"));
            Trabajador trabajador = oferta.getTrabajador();
            boolean yaCalificado = solicitud.getCalificaciones().stream()
                .anyMatch(c -> c.getTrabajador().getIdTrabajador().equals(trabajador.getIdTrabajador()));
            if(yaCalificado){
                throw new RuntimeException("Ya calificaste esta solicitud");
            }
            Calificacion calificacion = new Calificacion();
            calificacion.setSolicitud(solicitud);
            calificacion.setTrabajador(trabajador);
            calificacion.setUsuario(solicitud.getUsuario());
            calificacion.setPuntuacion(calificarDTO.getPuntuacion());
            calificacion.setComentario(calificarDTO.getComentario());
            calificacion.setFechaCreacion(LocalDateTime.now());
            calificacionRepository.save(calificacion);
            List<Calificacion> calificaciones = calificacionRepository.findByTrabajador_IdTrabajador(trabajador.getIdTrabajador());
            double promedio = calificaciones.stream()
                .mapToLong(Calificacion::getPuntuacion)
                .average()
                .orElse(0.0);
            solicitud.setEstado("Finalizada");
            oferta.setEstado("Finalizada");

            solicitudRepository.save(solicitud);
            ofertaRepository.save(oferta);
        return "Calificación realizada con éxito";
    }

}
