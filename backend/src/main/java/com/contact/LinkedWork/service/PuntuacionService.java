package com.contact.LinkedWork.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.contact.LinkedWork.model.Nivel;
import com.contact.LinkedWork.model.Trabajador;
import com.contact.LinkedWork.repository.TrabajadorRepository;

import java.util.Optional;

@Service("PuntuacionService")
@Transactional
public class PuntuacionService {

    @Autowired
    @Qualifier("CrudTrabajadorRepository")
    private TrabajadorRepository trabajadorRepository;

    @Autowired
    @Qualifier("NivelService")
    private NivelService nivelService;

    @Autowired
    @Qualifier("NotificacionService")
    private NotificacionService notificacionService;

    public Trabajador addPuntosToTrabajador(Long idTrabajador, Integer puntos) {
        Trabajador trabajador = trabajadorRepository.findById(idTrabajador)
                .orElseThrow(() -> new RuntimeException("Trabajador no encontrado con ID: " + idTrabajador));
        Integer current = trabajador.getPuntuacion() == null ? 0 : trabajador.getPuntuacion();
        int nuevo = current + (puntos == null ? 0 : puntos);
        trabajador.setPuntuacion(nuevo);
        trabajador = trabajadorRepository.save(trabajador);
            notificacionService.crearNotificacion(
            trabajador.getUsuario().getIdUsuario(),
            "Ganaste puntos",
            "Has ganado " + puntos + " puntos",
            "PUNTOS"
    );
        Optional<Nivel> nivel = nivelService.findNivelByPuntos(trabajador.getPuntuacion());
        // no se persiste relación; se puede usar nivel para notificaciones
           Optional<Nivel> nuevoNivel = nivelService.findNivelByPuntos(
            trabajador.getPuntuacion()
    );

    // VALIDAR SI CAMBIO DE NIVEL
    if (
            nivel.isPresent()
            && nuevoNivel.isPresent()
            && !nivel.get().getIdNivel()
                    .equals(nuevoNivel.get().getIdNivel())
    ) {

        notificacionService.crearNotificacion(
                trabajador.getUsuario().getIdUsuario(),
                "Subiste de nivel",
                "Ahora eres nivel " + nuevoNivel.get().getNombre(),
                "NIVEL"
        );
    }
        return trabajador;
    }

    public Trabajador quitarPuntosDeTrabajador(Long idTrabajador, Integer puntos) {
        Trabajador trabajador = trabajadorRepository.findById(idTrabajador)
                .orElseThrow(() -> new RuntimeException("Trabajador no encontrado con ID: " + idTrabajador));
        Integer current = trabajador.getPuntuacion() == null ? 0 : trabajador.getPuntuacion();
        int nuevo = current - (puntos == null ? 0 : puntos);
        if (nuevo < 0) nuevo = 0;
        trabajador.setPuntuacion(nuevo);
        trabajador = trabajadorRepository.save(trabajador);
        return trabajador;
    }
}
