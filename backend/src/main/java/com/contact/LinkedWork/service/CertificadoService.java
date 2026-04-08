package com.contact.LinkedWork.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.contact.LinkedWork.dto.CertificadoDTO;
import com.contact.LinkedWork.model.Certificado;
import com.contact.LinkedWork.model.Trabajador;
import com.contact.LinkedWork.repository.CertificadoRepository;
import com.contact.LinkedWork.repository.TrabajadorRepository;

@Service("CertificadoService")
@Transactional
public class CertificadoService {

    @Autowired
    @Qualifier("CrudCertificadoRepository")
    private CertificadoRepository certificadoRepository;

    @Autowired
    @Qualifier("CrudTrabajadorRepository")
    private TrabajadorRepository trabajadorRepository;

    public CertificadoDTO agregarCertificado(CertificadoDTO certificadoDTO, Long idTrabajador) {
        Trabajador trabajador = trabajadorRepository.findById(idTrabajador)
                .orElseThrow(() -> new RuntimeException("Trabajador no encontrado con ID: " + idTrabajador));

        Certificado certificado = new Certificado(trabajador, certificadoDTO.getNombre(), certificadoDTO.getEntidad());
        certificadoRepository.save(certificado);

        certificadoDTO.setIdCertificado(certificado.getIdCertificado().intValue());
        certificadoDTO.setIdTrabajador(idTrabajador.intValue());
        return certificadoDTO;
    }

    public List<CertificadoDTO> getCertificadosByTrabajador(Long idTrabajador) {
        return trabajadorRepository.findById(idTrabajador)
                .map(trabajador -> trabajador.getCertificados()
                        .stream()
                        .map(certificado -> {
                            CertificadoDTO dto = new CertificadoDTO();
                            dto.setIdCertificado(certificado.getIdCertificado().intValue());
                            dto.setIdTrabajador(certificado.getTrabajador().getIdTrabajador().intValue());
                            dto.setNombre(certificado.getNombre());
                            dto.setEntidad(certificado.getEntidad());
                            return dto;
                        })
                        .toList())
                .orElse(List.of());
    }

    public CertificadoDTO editarCertificado(CertificadoDTO certificadoDTO, Long idCertificado, Long idTrabajador) {
        Certificado certificado = certificadoRepository.findById(idCertificado)
                .orElseThrow(() -> new RuntimeException("Certificado no encontrado con ID: " + idCertificado));

        if (!certificado.getTrabajador().getIdTrabajador().equals(idTrabajador)) {
            throw new RuntimeException("El trabajador con ID: " + idTrabajador + " no puede editar este certificado.");
        }

        certificado.setNombre(certificadoDTO.getNombre());
        certificado.setEntidad(certificadoDTO.getEntidad());
        certificadoRepository.save(certificado);

        certificadoDTO.setIdCertificado(idCertificado.intValue());
        certificadoDTO.setIdTrabajador(idTrabajador.intValue());
        return certificadoDTO;
    }

    public void eliminarCertificado(Long idCertificado, Long idTrabajador) {
        Certificado certificado = certificadoRepository.findById(idCertificado)
                .orElseThrow(() -> new RuntimeException("Certificado no encontrado con ID: " + idCertificado));

        Long trabajadorId = certificado.getTrabajador().getIdTrabajador();
        Long trabajadorUsuarioId = certificado.getTrabajador().getUsuario() != null
            ? certificado.getTrabajador().getUsuario().getIdUsuario()
            : null;

        boolean autorizado = trabajadorId.equals(idTrabajador)
            || (trabajadorUsuarioId != null && trabajadorUsuarioId.equals(idTrabajador));

        if (!autorizado) {
            throw new RuntimeException("El trabajador con ID: " + idTrabajador + " no puede eliminar este certificado.");
        }

        certificadoRepository.delete(certificado);
    }
}