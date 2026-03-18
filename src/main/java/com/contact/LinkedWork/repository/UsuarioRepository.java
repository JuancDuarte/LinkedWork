package com.contact.LinkedWork.repository;

import com.contact.LinkedWork.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    Optional<Usuario> findByEmail(String email);
    
    Optional<Usuario> findByNombreUsuario(String nombreUsuario);
    
    List<Usuario> findAllByEstado(String estado);
}
