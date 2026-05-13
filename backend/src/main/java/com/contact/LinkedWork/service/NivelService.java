package com.contact.LinkedWork.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import com.contact.LinkedWork.model.Nivel;
import com.contact.LinkedWork.repository.NivelRepository;

import java.util.Optional;

@Service("NivelService")
public class NivelService {

    @Autowired
    @Qualifier("CrudNivelRepository")
    private NivelRepository nivelRepository;

    public Optional<Nivel> findNivelByPuntos(Integer puntos) {
        long p = puntos == null ? 0L : puntos.longValue();
        Iterable<Nivel> niveles = nivelRepository.findAll();
        for (Nivel n : niveles) {
            long min = n.getPuntajeMin() == null ? Long.MIN_VALUE : n.getPuntajeMin();
            long max = n.getPuntajeMax() == null ? Long.MAX_VALUE : n.getPuntajeMax();
            if (p >= min && p <= max) {
                return Optional.of(n);
            }
        }
        return Optional.empty();
    }
}
